/* Office Order Chrome Extension — Background Service Worker (MV3)
 * Lắng nghe WebSocket nền cho nhiều bill trong ngày, phát loa thoại .mp3 qua Offscreen API,
 * tự động chống trùng với tab web đang mở.
 */

const WEB_ORIGIN = 'https://office-order.pages.dev';
const WS_ORIGIN = 'wss://uu-pos-live.tuanlee-tech.workers.dev';
const BILL_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_TRACKED_BILLS = 6;
const HEARTBEAT_ALARM = 'uu_ext_heartbeat';

const sockets = new Map(); // billCode -> WebSocket
const seenEventIds = new Map(); // eventId -> ts
const notifBillMap = new Map(); // notificationId -> billCode

let stateCache = {
  user: { uid: '', uname: '' },
  bills: {},
  settings: { audioEnabled: true, mutedUntil: 0 }
};

function fmtVnd(n) {
  const v = Math.round(Number(n) || 0);
  return v > 0 ? (v.toLocaleString('vi-VN') + 'đ') : '0đ';
}

function isMutedNow(settings) {
  const s = settings || stateCache.settings || {};
  return !!(s.mutedUntil && Number(s.mutedUntil) > Date.now());
}

async function loadState() {
  try {
    const res = await chrome.storage.local.get(['user', 'bills', 'settings']);
    if (res.user) stateCache.user = Object.assign({ uid: '', uname: '' }, res.user);
    if (res.bills && typeof res.bills === 'object') stateCache.bills = res.bills;
    if (res.settings) stateCache.settings = Object.assign({ audioEnabled: true, mutedUntil: 0 }, res.settings);
  } catch (e) {}
  pruneExpiredBills();
  updateBadge();
  return stateCache;
}

async function saveState() {
  try {
    await chrome.storage.local.set({
      user: stateCache.user,
      bills: stateCache.bills,
      settings: stateCache.settings
    });
  } catch (e) {}
  updateBadge();
}

function pruneExpiredBills() {
  const now = Date.now();
  const entries = Object.entries(stateCache.bills || {})
    .filter(([, b]) => b && b.bill && (now - (b.updatedAt || 0) < BILL_TTL_MS))
    .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
    .slice(0, MAX_TRACKED_BILLS);
  const next = {};
  for (const [k, v] of entries) next[k] = v;
  stateCache.bills = next;

  // Close sockets for pruned bills
  for (const [code, ws] of sockets.entries()) {
    if (!next[code]) {
      try { ws.close(); } catch (e) {}
      sockets.delete(code);
    }
  }
}

function updateBadge() {
  const bills = Object.values(stateCache.bills || {});
  const totalUnread = bills.reduce((s, b) => s + (Number(b.unreadCount) || 0), 0);
  const muted = isMutedNow();
  if (muted) {
    chrome.action.setBadgeText({ text: 'OFF' }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ color: '#64748B' }).catch(() => {});
  } else if (totalUnread > 0) {
    chrome.action.setBadgeText({ text: String(totalUnread > 9 ? '9+' : totalUnread) }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ color: '#DC2626' }).catch(() => {});
  } else {
    chrome.action.setBadgeText({ text: '' }).catch(() => {});
  }
}

async function ensureOffscreenDocument() {
  if (!chrome.offscreen) return false;
  try {
    if (typeof chrome.offscreen.hasDocument === 'function') {
      const has = await chrome.offscreen.hasDocument();
      if (has) return true;
    }
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Phát âm thanh thoại thông báo đặt món / thanh toán Office Order khi tắt tab web.'
    });
    return true;
  } catch (e) {
    // Document may already exist
    return true;
  }
}

async function playBackgroundAudio(audioUrl) {
  if (!stateCache.settings.audioEnabled || isMutedNow()) return;
  const ok = await ensureOffscreenDocument();
  if (!ok) return;
  try {
    await chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'PLAY_AUDIO',
      url: audioUrl || ''
    });
  } catch (e) {}
}

async function isBillTabOpen(billCode) {
  try {
    const tabs = await chrome.tabs.query({ url: WEB_ORIGIN + '/*' });
    for (const tab of tabs) {
      if (tab.url && billCode && tab.url.indexOf(billCode) !== -1) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function isEventSeen(id) {
  if (!id) return false;
  const now = Date.now();
  if (seenEventIds.has(id)) return true;
  seenEventIds.set(id, now);
  if (seenEventIds.size > 150) {
    for (const [k, ts] of seenEventIds.entries()) {
      if (now - ts > 10 * 60 * 1000) seenEventIds.delete(k);
    }
  }
  return false;
}

function extractBillSummaryFromWrap(billCode, wrap) {
  if (!wrap || typeof wrap !== 'object') return null;
  const fields = wrap.fields || {};
  const hostUid = (fields.hostUid && fields.hostUid.v) ? String(fields.hostUid.v) : '';
  const hostName = (fields.customer && fields.customer.v) ? String(fields.customer.v) : '';
  const submitted = !!(fields.submitted && fields.submitted.v);
  const storeName = (fields.storeName && fields.storeName.v)
    ? String(fields.storeName.v)
    : ((wrap.store && wrap.store.name) ? String(wrap.store.name) : '');
  const items = Array.isArray(wrap.items) ? wrap.items : [];
  let itemCount = 0;
  let subTotal = 0;
  let myDrinkSub = 0;
  const myUid = String(stateCache.user.uid || '').trim();
  const myNameLow = String(stateCache.user.uname || '').trim().toLowerCase();

  for (const it of items) {
    if (!it || it._del) continue;
    const qty = Math.max(1, Number(it.qty) || 1);
    const unit = Number(it.price) || 0;
    const topSum = Array.isArray(it.toppings)
      ? it.toppings.reduce((s, t) => s + (Number(t && t.gia) || 0), 0)
      : 0;
    const lineAmt = (unit + topSum) * qty;
    itemCount += qty;
    subTotal += lineAmt;
    const itUid = String(it.uid || '').trim();
    const itNameLow = String(it.uname || it.owner || '').trim().toLowerCase();
    if ((myUid && itUid && itUid === myUid) || (myNameLow && itNameLow && itNameLow === myNameLow)) {
      myDrinkSub += lineAmt;
    }
  }

  const disc = Number(fields.discount && fields.discount.v) || 0;
  const ship = Number(fields.shipFee && fields.shipFee.v) || 0;
  const grandTotal = Math.max(0, subTotal - disc + ship);
  const paidMap = (fields.paidMap && fields.paidMap.v && typeof fields.paidMap.v === 'object') ? fields.paidMap.v : {};
  const isPaid = !!(
    (myUid && paidMap['u:' + myUid]) ||
    (myNameLow && paidMap['n:' + myNameLow])
  );
  const isHost = !!(
    (hostUid && myUid && hostUid === myUid) ||
    (hostName && myNameLow && hostName.trim().toLowerCase() === myNameLow)
  );
  let myUnpaid = 0;
  if (submitted && !isPaid && !isHost && myDrinkSub > 0 && subTotal > 0) {
    const share = Math.round((ship - disc) * (myDrinkSub / subTotal));
    myUnpaid = Math.max(0, myDrinkSub + share);
  }

  return {
    bill: billCode,
    storeName: storeName || (stateCache.bills[billCode] && stateCache.bills[billCode].storeName) || 'Office Order',
    hostUid,
    hostName,
    submitted,
    itemCount,
    grandTotal,
    myUnpaid,
    updatedAt: Date.now()
  };
}

async function notifyAndSpeak(billCode, opts) {
  if (isMutedNow()) return;
  const tabOpen = await isBillTabOpen(billCode);
  if (tabOpen) return; // Tab web đang mở -> để trang web tự phát loa & hiện banner (chống trùng)

  if (stateCache.bills[billCode]) {
    stateCache.bills[billCode].unreadCount = (Number(stateCache.bills[billCode].unreadCount) || 0) + 1;
    stateCache.bills[billCode].updatedAt = Date.now();
    await saveState();
  }

  const notifId = 'uu_ext_' + billCode + '_' + Date.now();
  notifBillMap.set(notifId, billCode);
  try {
    await chrome.notifications.create(notifId, {
      type: 'basic',
      iconUrl: 'icons/icon-192.png',
      title: opts.title || ('Office Order · #' + billCode),
      message: opts.body || 'Mở bill để xem chi tiết.',
      priority: 2
    });
  } catch (e) {}

  await playBackgroundAudio(opts.audioUrl || '');
}

async function handleSocketMessage(billCode, rawData) {
  let d;
  try { d = JSON.parse(rawData); } catch (e) { return; }
  if (!d || !d.type) return;

  if (d.type === 'state' && d.wrap) {
    const summary = extractBillSummaryFromWrap(billCode, d.wrap);
    if (summary) {
      const prev = stateCache.bills[billCode] || {};
      stateCache.bills[billCode] = Object.assign({}, prev, summary);
      await saveState();
    }
    return;
  }

  const myUid = String(stateCache.user.uid || '').trim();
  const myNameLow = String(stateCache.user.uname || '').trim().toLowerCase();

  if (d.type === 'urge' || (d.type === 'presence' && d.urge)) {
    if (isEventSeen(d.urgeId)) return;
    if (myUid && d.uid && String(d.uid) === myUid) return;
    const voiceId = String(d.urgeVoiceId || '1');
    await notifyAndSpeak(billCode, {
      title: '📣 ' + (d.uname || 'Đồng nghiệp') + ' hối chốt đơn! (#' + billCode + ')',
      body: d.urgeText || 'Nhanh tay đặt món để đại diện chốt bill nhé!',
      audioUrl: WEB_ORIGIN + '/assets/audio/' + encodeURIComponent(voiceId) + '.mp3'
    });
    return;
  }

  if (d.type === 'urge_finalize') {
    if (isEventSeen(d.urgeFinId)) return;
    const amt = fmtVnd(d.grandTotal);
    await notifyAndSpeak(billCode, {
      title: '⏰ ' + (d.uname || 'Thành viên') + ' hối chốt đơn tính tiền! (#' + billCode + ')',
      body: 'Đơn có ' + (d.totalCups || '') + ' ' + (d.unit || 'món') + (amt !== '0đ' ? (' · Tổng ' + amt) : '') + ' — Bấm Chốt & Lưu Sheet nhé!',
      audioUrl: '' // chuông tổng hợp rõ ràng
    });
    return;
  }

  if (d.type === 'urge_pay' || (d.type === 'presence' && d.urgePay)) {
    const id = d.urgePayId || d.urgeId;
    if (isEventSeen(id)) return;
    if (Array.isArray(d.targetUids) || Array.isArray(d.targetNames)) {
      const hitUid = !!(myUid && Array.isArray(d.targetUids) && d.targetUids.includes(myUid));
      const hitName = !!(myNameLow && Array.isArray(d.targetNames) && d.targetNames.includes(myNameLow));
      if (!hitUid && !hitName) return;
    }
    const payVoiceId = String(d.urgePayVoiceId || 'pay-1');
    await notifyAndSpeak(billCode, {
      title: '💸 ' + (d.uname || 'Đại diện') + ' nhắc chuyển khoản! (#' + billCode + ')',
      body: d.urgePayText || d.urgeText || 'Vui lòng mở bill và quét mã QR thanh toán nhé!',
      audioUrl: WEB_ORIGIN + '/assets/audio/' + encodeURIComponent(payVoiceId) + '.mp3'
    });
    return;
  }

  if (d.type === 'pay_claim') {
    if (isEventSeen(d.claimId)) return;
    const payer = d.uname || d.name || 'Thành viên';
    const donor = d.donatedBy ? String(d.donatedBy).trim() : '';
    const amt = Number(d.amount) > 0 ? (' ' + fmtVnd(d.amount)) : '';
    await notifyAndSpeak(billCode, {
      title: donor
        ? ('🎁 ' + donor + ' báo CK hộ ' + payer + amt + ' · #' + billCode)
        : ('🔔 ' + payer + ' báo đã chuyển khoản' + amt + ' · #' + billCode),
      body: 'Mở app ngân hàng kiểm tra tiền vào rồi bấm xác nhận trên bill.',
      audioUrl: '' // chuông tổng hợp
    });
    return;
  }

  if (d.type === 'pay_claim_rejected') {
    const hostWho = d.hostName || 'Đại diện';
    await notifyAndSpeak(billCode, {
      title: '⚠️ ' + hostWho + ' chưa thấy tiền chuyển khoản · #' + billCode,
      body: 'Đại diện chưa thấy tiền vào tài khoản, hãy kiểm tra lại giao dịch nhé!',
      audioUrl: ''
    });
    return;
  }

  if (d.type === 'order_placed') {
    if (isEventSeen(d.placedId)) return;
    const hostWho = d.hostName || 'Đại diện';
    await notifyAndSpeak(billCode, {
      title: '🛵 ' + hostWho + ' đã đặt hàng! (#' + billCode + ')',
      body: 'Đơn đã gửi tới quán (chưa chốt thanh toán). Đợi đại diện chốt bill để chuyển khoản nhé!',
      audioUrl: ''
    });
    return;
  }

  if (d.type === 'order_finalized') {
    if (isEventSeen(d.finalizeId)) return;
    const hostWho = d.hostName || 'Đại diện';
    const amt = fmtVnd(d.grandTotal);
    await notifyAndSpeak(billCode, {
      title: '🔒 ' + hostWho + ' đã chốt đơn! (#' + billCode + ')',
      body: 'Đơn có ' + (d.totalCups || '') + ' ' + (d.unit || 'món') + (amt !== '0đ' ? (' · Tổng ' + amt) : '') + ' — Mở bill để xem số tiền & quét QR thanh toán nhé!',
      audioUrl: ''
    });
    return;
  }

  if (d.type === 'pay_confirmed') {
    if (isEventSeen(d.confirmId)) return;
    const payer = d.payerName || 'Thành viên';
    const amt = Number(d.amount) > 0 ? (' (' + fmtVnd(d.amount) + ')') : '';
    await notifyAndSpeak(billCode, {
      title: (d.viaSePay ? '⚡ SePay tự động xác nhận ' : '💸 Đã xác nhận ') + payer + amt + ' · #' + billCode,
      body: d.text || 'Cám ơn bà con rất là nhiều!',
      audioUrl: WEB_ORIGIN + '/assets/audio/pay-confirmed.mp3'
    });
  }
}

function connectBillSocket(billCode) {
  if (!billCode) return;
  const existing = sockets.get(billCode);
  if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
    return;
  }
  try {
    const ws = new WebSocket(WS_ORIGIN + '/bill/' + encodeURIComponent(billCode));
    sockets.set(billCode, ws);

    ws.onopen = () => {
      try {
        ws.send(JSON.stringify({
          type: 'hello',
          bill: billCode,
          from: 'ext_' + (stateCache.user.uid || 'anon'),
          uid: stateCache.user.uid || '',
          uname: stateCache.user.uname || 'Extension',
          ucolor: '#0A7259'
        }));
      } catch (e) {}
    };

    ws.onmessage = (ev) => {
      handleSocketMessage(billCode, ev.data).catch(() => {});
    };

    ws.onclose = () => {
      if (sockets.get(billCode) === ws) {
        sockets.delete(billCode);
      }
    };

    ws.onerror = () => {
      try { ws.close(); } catch (e) {}
    };
  } catch (e) {}
}

function ensureAllSocketsConnected() {
  pruneExpiredBills();
  for (const code of Object.keys(stateCache.bills || {})) {
    connectBillSocket(code);
  }
}

async function openOrFocusBillTab(billCode) {
  const targetUrl = WEB_ORIGIN + (billCode ? ('/?bill=' + encodeURIComponent(billCode)) : '/');
  if (billCode && stateCache.bills[billCode]) {
    stateCache.bills[billCode].unreadCount = 0;
    await saveState();
  }
  try {
    const tabs = await chrome.tabs.query({ url: WEB_ORIGIN + '/*' });
    for (const tab of tabs) {
      if (tab.url && billCode && tab.url.indexOf(billCode) !== -1) {
        await chrome.tabs.update(tab.id, { active: true });
        if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
        return;
      }
    }
    await chrome.tabs.create({ url: targetUrl });
  } catch (e) {}
}

chrome.notifications.onClicked.addListener((notifId) => {
  const billCode = notifBillMap.get(notifId) || '';
  chrome.notifications.clear(notifId).catch(() => {});
  notifBillMap.delete(notifId);
  openOrFocusBillTab(billCode);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm && alarm.name === HEARTBEAT_ALARM) {
    await loadState();
    ensureAllSocketsConnected();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  await loadState();
  chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: 0.45 });
  ensureAllSocketsConnected();
});

chrome.runtime.onStartup.addListener(async () => {
  await loadState();
  chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: 0.45 });
  ensureAllSocketsConnected();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return false;

  if (msg.type === 'SYNC_BILL_SESSION') {
    (async () => {
      await loadState();
      let identityChanged = false;
      if (msg.uid && msg.uid !== stateCache.user.uid) {
        stateCache.user.uid = String(msg.uid).trim();
        identityChanged = true;
      }
      if (msg.uname && msg.uname !== stateCache.user.uname) {
        stateCache.user.uname = String(msg.uname).trim();
        identityChanged = true;
      }
      const bill = String(msg.bill || '').trim();
      if (bill) {
        const prev = stateCache.bills[bill] || {
          bill,
          storeName: 'Office Order',
          hostName: '',
          submitted: false,
          itemCount: 0,
          grandTotal: 0,
          myUnpaid: 0,
          unreadCount: 0
        };
        prev.updatedAt = Date.now();
        prev.unreadCount = 0; // Đang mở tab bill này -> xóa badge chưa đọc
        stateCache.bills[bill] = prev;
      }
      await saveState();
      if (identityChanged && bill && sockets.has(bill)) {
        try { sockets.get(bill).close(); } catch (e) {}
        sockets.delete(bill);
      }
      ensureAllSocketsConnected();
      sendResponse({ ok: true });
    })();
    return true;
  }

  if (msg.type === 'GET_POPUP_STATE') {
    (async () => {
      await loadState();
      ensureAllSocketsConnected();
      const wsStatus = {};
      for (const code of Object.keys(stateCache.bills || {})) {
        const s = sockets.get(code);
        wsStatus[code] = !!(s && s.readyState === WebSocket.OPEN);
      }
      sendResponse({
        ok: true,
        user: stateCache.user,
        bills: Object.values(stateCache.bills || {}).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
        settings: stateCache.settings,
        wsStatus
      });
    })();
    return true;
  }

  if (msg.type === 'UPDATE_SETTINGS') {
    (async () => {
      await loadState();
      stateCache.settings = Object.assign({}, stateCache.settings, msg.settings || {});
      await saveState();
      sendResponse({ ok: true, settings: stateCache.settings });
    })();
    return true;
  }

  if (msg.type === 'REMOVE_BILL') {
    (async () => {
      await loadState();
      const code = String(msg.bill || '').trim();
      if (code && stateCache.bills[code]) {
        delete stateCache.bills[code];
        if (sockets.has(code)) {
          try { sockets.get(code).close(); } catch (e) {}
          sockets.delete(code);
        }
        await saveState();
      }
      sendResponse({ ok: true });
    })();
    return true;
  }

  if (msg.type === 'OPEN_BILL') {
    openOrFocusBillTab(String(msg.bill || '').trim()).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === 'TEST_ALERT') {
    (async () => {
      await loadState();
      try {
        await chrome.notifications.create('uu_test_' + Date.now(), {
          type: 'basic',
          iconUrl: 'icons/icon-192.png',
          title: '🔔 Office Order Extension đang hoạt động!',
          message: 'Khi tắt tab web, bạn vẫn nhận được thông báo & loa thoại nền.',
          priority: 2
        });
      } catch (e) {}
      await playBackgroundAudio(WEB_ORIGIN + '/assets/audio/pay-confirmed.mp3');
      sendResponse({ ok: true });
    })();
    return true;
  }

  return false;
});

// Khởi động ngay khi service worker thức dậy
loadState().then(() => {
  chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: 0.45 });
  ensureAllSocketsConnected();
});
