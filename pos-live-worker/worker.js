/* POS Live relay — chay tren Cloudflare Workers + Durable Objects.
 * Moi bill (?bill=MÃ) la 1 phong, tu gop o client, server chi chuyen tiep. */

const URGE_COOLDOWN_MS = 10000;
const DO_QR_CHUNK_SIZE = 96000;

async function saveLastWrap(storage, incoming) {
  if (!storage || !incoming) return;
  const raw = JSON.stringify(incoming);
  const hasQr = !!(incoming.fields && ((incoming.fields.hostQr && incoming.fields.hostQr.v) || (incoming.fields.hostQrs && Array.isArray(incoming.fields.hostQrs.v) && incoming.fields.hostQrs.v.length)));
  if (raw.length <= 105000 || !hasQr) {
    await storage.put('last', incoming);
    const oldCnt = Number(await storage.get('lastQrChunks')) || 0;
    for (let i = 0; i < oldCnt; i++) {
      await storage.delete('lastQr_' + i);
    }
    if (oldCnt > 0) await storage.delete('lastQrChunks');
    return;
  }
  const bundleStr = JSON.stringify({
    hostQr: incoming.fields.hostQr || null,
    hostQrs: incoming.fields.hostQrs || null
  });
  const chunks = Math.ceil(bundleStr.length / DO_QR_CHUNK_SIZE);
  const nextFields = Object.assign({}, incoming.fields);
  if (nextFields.hostQr) nextFields.hostQr = Object.assign({}, nextFields.hostQr, { v: '' });
  if (nextFields.hostQrs) nextFields.hostQrs = Object.assign({}, nextFields.hostQrs, { v: [] });
  nextFields._qrBundleChunks = chunks;
  const slim = Object.assign({}, incoming, { fields: nextFields });
  await storage.put('last', slim);
  await storage.put('lastQrChunks', chunks);
  for (let i = 0; i < chunks; i++) {
    await storage.put('lastQr_' + i, bundleStr.slice(i * DO_QR_CHUNK_SIZE, (i + 1) * DO_QR_CHUNK_SIZE));
  }
}

async function loadLastWrap(storage) {
  if (!storage) return null;
  const last = (await storage.get('last')) || null;
  if (!last) return null;
  const fields = last.fields;
  const bundleChunks = fields && Number(fields._qrBundleChunks) ? Number(fields._qrBundleChunks) : 0;
  if (bundleChunks > 0) {
    const parts = [];
    for (let i = 0; i < bundleChunks; i++) {
      const p = await storage.get('lastQr_' + i);
      if (p) parts.push(String(p));
    }
    if (parts.length === bundleChunks) {
      try {
        const parsed = JSON.parse(parts.join(''));
        if (parsed.hostQr) fields.hostQr = parsed.hostQr;
        if (parsed.hostQrs) fields.hostQrs = parsed.hostQrs;
      } catch (e) {}
    }
    delete fields._qrBundleChunks;
  } else {
    const qrField = fields && fields.hostQr;
    const chunks = qrField && Number(qrField.splitChunks) ? Number(qrField.splitChunks) : 0;
    if (chunks > 0) {
      const parts = [];
      for (let i = 0; i < chunks; i++) {
        const p = await storage.get('lastQr_' + i);
        if (p) parts.push(String(p));
      }
      if (parts.length === chunks) {
        qrField.v = parts.join('');
      }
      delete qrField.splitChunks;
    }
  }
  return last;
}
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-SePay-Signature, X-SePay-Timestamp'
};

const PAY_CONFIRMED_TEXT = 'Cám ơn bà con rất là nhiều ... Đó, tiếng ting ting đó là tiếng gửi tiền vào đó.';
const PAY_CONFIRMED_AUDIO = 'assets/audio/pay-confirmed.mp3';

function jsonCors(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS_HEADERS)
  });
}

function toAsciiUpper(raw) {
  if (!raw) return '';
  return String(raw)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(str) {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeAccNo(raw) {
  return String(raw || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function accountNumbersMatch(a, b) {
  const na = normalizeAccNo(a);
  const nb = normalizeAccNo(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (/^\d+$/.test(na) && /^\d+$/.test(nb)) {
    return na.replace(/^0+/, '') === nb.replace(/^0+/, '');
  }
  return false;
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(String(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(String(message)));
  const bytes = new Uint8Array(sigBuf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function timingSafeEqualHex(a, b) {
  const s1 = String(a || '').toLowerCase().trim();
  const s2 = String(b || '').toLowerCase().trim();
  if (!s1 || s1.length !== s2.length) return false;
  let diff = 0;
  for (let i = 0; i < s1.length; i++) {
    diff |= s1.charCodeAt(i) ^ s2.charCodeAt(i);
  }
  return diff === 0;
}

async function verifySePaySignature(request, rawBody, secretKey) {
  if (!secretKey) return { valid: false, reason: 'secret_not_configured' };
  const sigHeader = (request.headers.get('X-SePay-Signature') || request.headers.get('x-sepay-signature') || '').trim();
  let tsHeader = (request.headers.get('X-SePay-Timestamp') || request.headers.get('x-sepay-timestamp') || '').trim();
  if (!sigHeader) return { valid: false, reason: 'missing_signature' };

  let receivedHex = '';
  if (sigHeader.includes(',') && sigHeader.includes('v1=')) {
    const parts = sigHeader.split(',');
    for (const part of parts) {
      const [k, v] = part.split('=').map(s => (s || '').trim());
      if (k === 't' && !tsHeader) tsHeader = v;
      if (k === 'v1' || k === 'sha256') receivedHex = v;
    }
  } else if (sigHeader.toLowerCase().startsWith('sha256=')) {
    receivedHex = sigHeader.slice(7).trim();
  } else {
    receivedHex = sigHeader;
  }

  if (!/^[a-fA-F0-9]{64}$/.test(receivedHex)) {
    return { valid: false, reason: 'invalid_signature_format' };
  }

  if (tsHeader) {
    const tsNum = Number(tsHeader);
    const nowSec = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(tsNum) || Math.abs(nowSec - tsNum) > 600) {
      return { valid: false, reason: 'timestamp_expired' };
    }
    const expectedWithTs = await hmacSha256Hex(secretKey, `${tsHeader}.${rawBody}`);
    if (timingSafeEqualHex(receivedHex, expectedWithTs)) {
      return { valid: true, mode: 'timestamp_raw' };
    }
  }

  const expectedRaw = await hmacSha256Hex(secretKey, rawBody);
  if (timingSafeEqualHex(receivedHex, expectedRaw)) {
    return { valid: true, mode: 'raw_only' };
  }
  return { valid: false, reason: 'signature_mismatch' };
}

function computeRoomBillSplit(lastWrap) {
  const lines = lastWrap && Array.isArray(lastWrap.lines) ? lastWrap.lines : [];
  const fields = (lastWrap && lastWrap.fields) || {};
  const disc = Math.max(0, Number(fields.disc && fields.disc.v) || 0);
  const ship = Math.max(0, Number(fields.ship && fields.ship.v) || 0);
  let sub = 0;
  const personMap = {};

  for (const c of lines) {
    const qty = Number(c.qty) || 1;
    let topSum = 0;
    if (Array.isArray(c.toppings)) {
      for (const t of c.toppings) topSum += (Number(t.price) || 0) * (Number(t.qty) || 1);
    }
    const lineTot = ((Number(c.price) || 0) + topSum) * qty;
    sub += lineTot;

    const name = String(c.uname || c.owner || 'Bạn').trim() || 'Bạn';
    const uid = c.uid ? String(c.uid).trim() : '';
    const nameKey = 'n:' + name.toLowerCase();
    const key = uid ? ('u:' + uid) : nameKey;
    if (uid && !personMap[key] && personMap[nameKey]) {
      personMap[key] = personMap[nameKey];
      personMap[key].uid = uid;
      delete personMap[nameKey];
    }
    if (!personMap[key]) {
      personMap[key] = {
        uid,
        name,
        drinkSub: 0
      };
    }
    personMap[key].drinkSub += lineTot;
  }

  const netAdj = ship - disc;
  const people = Object.keys(personMap).map(k => {
    const p = personMap[k];
    const share = sub > 0 ? Math.round(netAdj * (p.drinkSub / sub)) : 0;
    const finalPay = Math.max(0, p.drinkSub + share);
    const payKey = p.uid ? ('u:' + p.uid) : ('n:' + p.name.toLowerCase());
    const paid = isPaidInLastState(lastWrap, p.uid, p.name);
    return {
      uid: p.uid,
      name: p.name,
      drinkSub: p.drinkSub,
      share,
      finalPay,
      payKey,
      paid
    };
  });

  return { sub, disc, ship, netAdj, people };
}

function summarizeRoomWrap(bill, lastWrap, presenceMap) {
  const lines = lastWrap && Array.isArray(lastWrap.lines) ? lastWrap.lines : [];
  const fields = (lastWrap && lastWrap.fields) || {};
  const hostName = (fields.customer && fields.customer.v)
    ? String(fields.customer.v)
    : ((fields.cust && fields.cust.v) ? String(fields.cust.v) : '');
  const submitted = !!(fields.orderSubmitted && fields.orderSubmitted.v);
  const storeId = (lastWrap && lastWrap.storeId) || '';
  const storeName = (lastWrap && lastWrap.storeData && lastWrap.storeData.name) ||
    (storeId === 'vua-tron' ? 'Vua Trộn' : (storeId ? 'Ú Ụ Milk Tea' : ''));
  let itemCount = 0;
  let subTotal = 0;
  for (const c of lines) {
    const qty = Number(c.qty) || 1;
    if (c.size !== 'TP') itemCount += qty;
    let topSum = 0;
    if (Array.isArray(c.toppings)) {
      for (const t of c.toppings) topSum += (Number(t.price) || 0) * (Number(t.qty) || 1);
    }
    subTotal += ((Number(c.price) || 0) + topSum) * qty;
  }
  const now = Date.now();
  const onlineCount = Object.keys(presenceMap || {}).filter(k => (now - (presenceMap[k].lastSeen || 0)) < 15000).length;
  const exists = !!(lastWrap && (lines.length > 0 || submitted || hostName));
  return {
    ok: true,
    exists,
    bill: bill || '',
    linesCount: lines.length,
    itemCount,
    subTotal,
    hostName,
    storeId,
    storeName,
    submitted,
    onlineCount
  };
}

function isPaidInLastState(lastWrap, uid, uname) {
  const pm = lastWrap && lastWrap.fields && lastWrap.fields.paidMap && lastWrap.fields.paidMap.v;
  if (!pm || typeof pm !== 'object') return false;
  if (uid && pm['u:' + String(uid)] === true) return true;
  const normName = String(uname || '').trim().toLowerCase();
  return !!(normName && pm['n:' + normName] === true);
}

function shouldDeliverPayUrge(peer, msg, lastWrap) {
  if (!peer || !msg) return false;
  const uid = peer.uid ? String(peer.uid) : '';
  const uname = String(peer.uname || '').trim().toLowerCase();
  if (isPaidInLastState(lastWrap, uid, uname)) return false;
  const hasUidFilter = Array.isArray(msg.targetUids);
  const hasNameFilter = Array.isArray(msg.targetNames);
  if (!hasUidFilter && !hasNameFilter) return true;
  if (uid && hasUidFilter && msg.targetUids.includes(uid)) return true;
  if (uname && hasNameFilter && msg.targetNames.includes(uname)) return true;
  return false;
}

function stripPayUrgeMeta(obj, removeAlertFields) {
  const copy = Object.assign({}, obj);
  delete copy.targetUids;
  delete copy.targetNames;
  if (removeAlertFields) {
    delete copy.urgePay;
    delete copy.urgePayId;
    delete copy.urgePayVoiceId;
    delete copy.urgePayText;
    delete copy.urgePayCooldownMs;
  }
  return copy;
}

function isHostPeer(peer, msg, lastWrap) {
  if (!peer) return false;
  const f = (lastWrap && lastWrap.fields) || {};
  const hostUid = String((f.hostUid && f.hostUid.v) || (msg && msg.hostUid) || '').trim();
  const hostName = String((f.customer && f.customer.v) || (msg && msg.hostName) || '').trim().toLowerCase();
  const peerUid = peer.uid ? String(peer.uid).trim() : '';
  const peerName = String(peer.uname || '').trim().toLowerCase();
  if (hostUid) return !!(peerUid && peerUid === hostUid);
  if (hostName) return !!(peerName && peerName === hostName);
  return true;
}

function matchesTargetPayer(peer, msg) {
  if (!peer || !msg) return false;
  const tUid = msg.targetUid ? String(msg.targetUid).trim() : '';
  const tName = msg.targetName ? String(msg.targetName).trim().toLowerCase() : '';
  const peerUid = peer.uid ? String(peer.uid).trim() : '';
  const peerName = String(peer.uname || '').trim().toLowerCase();
  if (tUid && peerUid && tUid === peerUid) return true;
  if (tName && peerName && tName === peerName) return true;
  return !tUid && !tName;
}

export class LiveRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env || {};
    this.bill = '';
    this.last = null;
    this.lastUrgeAt = 0;
    this.lastPayUrgeAt = 0;
    this.lastPayUrge = null;
    this.lastIndexedAt = 0;
    this.lastIndexedSubmitted = false;
    this.lastIndexedCount = -1;
    this.billIndex = null;
    this.presence = {}; // cid -> { cid, uid, uname, ucolor, lastSeen }
    this.state.blockConcurrencyWhile(async () => {
      try {
        this.bill = (await this.state.storage.get('billCode')) || '';
        this.last = await loadLastWrap(this.state.storage);
        this.lastUrgeAt = Number(await this.state.storage.get('lastUrgeAt')) || 0;
        this.lastPayUrgeAt = Number(await this.state.storage.get('lastPayUrgeAt')) || 0;
        this.lastPayUrge = (await this.state.storage.get('lastPayUrge')) || null;
      } catch (e) {
        this.bill = '';
        this.last = null;
        this.lastUrgeAt = 0;
        this.lastPayUrgeAt = 0;
        this.lastPayUrge = null;
      }
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (url.pathname === '/__index_upsert' && request.method === 'POST') {
      try {
        const entry = await request.json();
        if (!this.billIndex) {
          this.billIndex = (await this.state.storage.get('billIndex')) || {};
        }
        if (entry && entry.bill) {
          const code = String(entry.bill).trim();
          if (entry.remove) {
            delete this.billIndex[code];
          } else {
            this.billIndex[code] = entry;
          }
          const cutoff = Date.now() - 14 * 86400000;
          const entries = Object.values(this.billIndex)
            .filter(item => item && item.bill && (item.updatedAt || 0) > cutoff)
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
            .slice(0, 120);
          const nextMap = {};
          for (const it of entries) nextMap[it.bill] = it;
          this.billIndex = nextMap;
          await this.state.storage.put('billIndex', nextMap);
        }
        return jsonCors({ ok: true });
      } catch (e) {
        return jsonCors({ ok: false }, 400);
      }
    }
    if (url.pathname === '/__index_list' && request.method === 'GET') {
      try {
        if (!this.billIndex) {
          this.billIndex = (await this.state.storage.get('billIndex')) || {};
        }
        const cutoff = Date.now() - 14 * 86400000;
        const list = Object.values(this.billIndex)
          .filter(it => it && it.bill && (it.updatedAt || 0) > cutoff)
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        return jsonCors({ ok: true, bills: list });
      } catch (e) {
        return jsonCors({ ok: true, bills: [] });
      }
    }
    if (url.pathname === '/__sepay_webhook' && request.method === 'POST') {
      try {
        const payload = await request.json();
        const result = await this.handleSepayWebhook(payload);
        return jsonCors(result);
      } catch (e) {
        return jsonCors({ ok: false, matched: false, error: String(e && e.message || e) }, 500);
      }
    }
    if (url.pathname === '/bills' && request.method === 'GET') {
      try {
        if (!this.billIndex) {
          this.billIndex = (await this.state.storage.get('billIndex')) || {};
        }
        const rawQ = (url.searchParams.get('q') || '').trim().toLowerCase();
        const cutoff = Date.now() - 14 * 86400000;
        let list = Object.values(this.billIndex)
          .filter(it => it && it.bill && (it.updatedAt || 0) > cutoff && (it.itemCount > 0 || it.submitted || it.hostName));
        if (rawQ) {
          list = list.filter(it =>
            String(it.bill || '').toLowerCase().includes(rawQ) ||
            String(it.hostName || '').toLowerCase().includes(rawQ) ||
            String(it.storeName || '').toLowerCase().includes(rawQ)
          );
        }
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        return jsonCors({ ok: true, bills: list.slice(0, 25) });
      } catch (e) {
        return jsonCors({ ok: true, bills: [] });
      }
    }
    if (request.headers.get('Upgrade') !== 'websocket') {
      if (url.searchParams.get('info') === '1') {
        if (!this.last) {
          try { this.last = await loadLastWrap(this.state.storage); } catch (e) {}
        }
        const m = url.pathname.match(/^\/bill\/(.+)/);
        const billCode = this.bill || (m ? decodeURIComponent(m[1]) : '');
        return jsonCors(summarizeRoomWrap(billCode, this.last, this.presence));
      }
      return new Response('POS Live relay. WS: /bill/MÃ', { status: 400 });
    }
    const pair = new WebSocketPair();
    this.state.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async reportToBillIndex(billCode, wrap, force = false) {
    if (!this.env || !this.env.LIVE_ROOM || !billCode || billCode === '__BILL_INDEX__') return;
    const summary = summarizeRoomWrap(billCode, wrap, this.presence);
    const now = Date.now();
    if (!summary.exists && !force) return;
    const keyChanged = (summary.submitted !== this.lastIndexedSubmitted) || (summary.linesCount !== this.lastIndexedCount);
    if (!force && !keyChanged && (now - this.lastIndexedAt < 8000)) return;
    this.lastIndexedAt = now;
    this.lastIndexedSubmitted = summary.submitted;
    this.lastIndexedCount = summary.linesCount;
    try {
      const idxId = this.env.LIVE_ROOM.idFromName('__BILL_INDEX__');
      const stub = this.env.LIVE_ROOM.get(idxId);
      await stub.fetch('https://internal/__index_upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill: billCode,
          hostName: summary.hostName,
          storeId: summary.storeId,
          storeName: summary.storeName,
          itemCount: summary.itemCount,
          linesCount: summary.linesCount,
          subTotal: summary.subTotal,
          submitted: summary.submitted,
          onlineCount: summary.onlineCount,
          updatedAt: now,
          remove: !summary.exists
        })
      });
    } catch (e) {}
  }

  prunePresence() {
    const now = Date.now();
    for (const cid of Object.keys(this.presence)) {
      if (now - this.presence[cid].lastSeen > 12000) {
        delete this.presence[cid];
      }
    }
  }

  async webSocketMessage(ws, msg) {
    let d = null;
    try { d = JSON.parse(msg); } catch (e) { return; }
    if (!d) return;

    if (d.type === 'hello') {
      if (d.bill) {
        this.bill = String(d.bill);
        try { await this.state.storage.put('billCode', this.bill); } catch (e) {}
      }
      const cid = d.from || Math.random().toString(36).slice(2);
      ws.cid = cid;
      ws.uid = d.uid || cid;
      ws.uname = d.uname || d.dev || 'Bạn';
      ws.ucolor = d.ucolor || '#0A7259';

      this.presence[cid] = {
        cid: cid,
        uid: ws.uid,
        uname: ws.uname,
        ucolor: ws.ucolor,
        lastSeen: Date.now()
      };
      this.prunePresence();

      if (!this.last) {
        try { this.last = await loadLastWrap(this.state.storage); } catch (e) {}
      }
      if (this.last) {
        try {
          ws.send(JSON.stringify({ type: 'state', bill: this.bill, wrap: this.last, from: 'server' }));
        } catch (e) {}
      }
      // Send current presence list to newly joined peer
      if (Object.keys(this.presence).length > 0) {
        try {
          ws.send(JSON.stringify({ type: 'presence_list', bill: this.bill, users: this.presence }));
        } catch (e) {}
      }
      // Inform newly joined peer if room urge cooldown is active
      if (!this.lastUrgeAt) {
        try { this.lastUrgeAt = Number(await this.state.storage.get('lastUrgeAt')) || 0; } catch (e) {}
      }
      const helloElapsed = Date.now() - (this.lastUrgeAt || 0);
      if (this.lastUrgeAt > 0 && helloElapsed < URGE_COOLDOWN_MS) {
        try {
          ws.send(JSON.stringify({
            type: 'urge_cooldown',
            bill: this.bill,
            remainingMs: URGE_COOLDOWN_MS - helloElapsed
          }));
        } catch (e) {}
      }
      if (!this.lastPayUrge) {
        try { this.lastPayUrge = (await this.state.storage.get('lastPayUrge')) || null; } catch (e) {}
      }
      if (this.lastPayUrge && shouldDeliverPayUrge(ws, this.lastPayUrge, this.last)) {
        try {
          ws.send(JSON.stringify(Object.assign(stripPayUrgeMeta(this.lastPayUrge, false), { isSyncReplay: true })));
        } catch (e) {}
      }
      // Broadcast peer_joined to all other clients in this bill room
      const peerMsg = JSON.stringify({
        type: 'peer_joined',
        bill: this.bill,
        from: cid,
        dev: d.dev || ws.uname,
        uid: ws.uid,
        uname: ws.uname,
        ucolor: ws.ucolor
      });
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          try { s.send(peerMsg); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'state' && d.wrap) {
      const prev = this.last;
      const incoming = d.wrap;
      const prevHasLines = prev && Array.isArray(prev.lines) && prev.lines.length > 0;
      const incomingHasLines = Array.isArray(incoming.lines) && incoming.lines.length > 0;
      const incomingHasTomb = incoming.tomb && Object.keys(incoming.tomb).length > 0;
      const prevSubRev = (prev && prev.fields && prev.fields.orderSubmitted && prev.fields.orderSubmitted.rev) || 0;
      const inSubRev = (incoming.fields && incoming.fields.orderSubmitted && incoming.fields.orderSubmitted.rev) || 0;
      if (prevHasLines && !incomingHasLines && !incomingHasTomb && inSubRev === 0) {
        try {
          ws.send(JSON.stringify({ type: 'state', bill: this.bill || d.bill, wrap: prev, from: 'server' }));
        } catch (e) {}
        return;
      }
      if (prev && prev.fields && prevSubRev > inSubRev && incoming.fields) {
        incoming.fields.orderSubmitted = prev.fields.orderSubmitted;
      }
      if (d.bill && !this.bill) {
        this.bill = String(d.bill);
        try { await this.state.storage.put('billCode', this.bill); } catch (e) {}
      }
      this.last = incoming;
      try { await saveLastWrap(this.state.storage, incoming); } catch (e) {}
      this.reportToBillIndex(this.bill || d.bill, incoming, false).catch(() => {});
      const out = JSON.stringify({ type: 'state', bill: this.bill || d.bill, wrap: incoming, from: d.from });
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          try { s.send(out); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'presence') {
      const cid = d.from || ws.cid;
      if (cid) {
        ws.cid = cid;
        if (d.uid) ws.uid = d.uid;
        if (d.uname) ws.uname = d.uname;
        if (d.ucolor) ws.ucolor = d.ucolor;
        this.presence[cid] = {
          cid: cid,
          uid: d.uid || ws.uid,
          uname: d.uname || ws.uname || 'Bạn',
          ucolor: d.ucolor || ws.ucolor || '#0A7259',
          lastSeen: Date.now()
        };
      }
      let outObj = d;
      if (d.urge) {
        const now = Date.now();
        if (!this.lastUrgeAt) {
          try { this.lastUrgeAt = Number(await this.state.storage.get('lastUrgeAt')) || 0; } catch (e) {}
        }
        const elapsed = now - (this.lastUrgeAt || 0);
        if (elapsed < URGE_COOLDOWN_MS) {
          const remainingMs = URGE_COOLDOWN_MS - elapsed;
          try {
            ws.send(JSON.stringify({ type: 'urge_rejected', bill: this.bill || d.bill, remainingMs: remainingMs }));
          } catch (e) {}
          outObj = Object.assign({}, d);
          delete outObj.urge;
          delete outObj.urgeId;
          delete outObj.urgeVoiceId;
          delete outObj.urgeText;
          delete outObj.urgeAudio;
        } else {
          this.lastUrgeAt = now;
          try { await this.state.storage.put('lastUrgeAt', now); } catch (e) {}
          outObj = Object.assign({}, d, { urgeCooldownMs: URGE_COOLDOWN_MS });
        }
      }
      let payUrgeAllowed = false;
      if (d.urgePay) {
        const nowPay = Date.now();
        this.lastPayUrgeAt = nowPay;
        payUrgeAllowed = true;
        outObj = Object.assign({}, outObj, { urgePayCooldownMs: 0 });
        this.lastPayUrge = outObj;
        try {
          await this.state.storage.put('lastPayUrgeAt', nowPay);
          await this.state.storage.put('lastPayUrge', outObj);
        } catch (e) {}
      }
      const basePresenceStr = payUrgeAllowed ? null : JSON.stringify(stripPayUrgeMeta(outObj, false));
      const targetedPresenceStr = payUrgeAllowed ? JSON.stringify(stripPayUrgeMeta(outObj, false)) : null;
      const nonTargetPresenceStr = payUrgeAllowed ? JSON.stringify(stripPayUrgeMeta(outObj, true)) : null;
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          const payload = payUrgeAllowed
            ? (shouldDeliverPayUrge(s, outObj, this.last) ? targetedPresenceStr : nonTargetPresenceStr)
            : basePresenceStr;
          try { s.send(payload); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'peer_left') {
      const cid = d.from || ws.cid;
      if (cid && this.presence[cid]) {
        delete this.presence[cid];
      }
      const out = JSON.stringify(d);
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          try { s.send(out); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'reset') {
      this.last = null;
      this.lastPayUrge = null;
      this.lastPayUrgeAt = 0;
      this.lastIndexedCount = 0;
      this.reportToBillIndex(this.bill || d.bill, null, true).catch(() => {});
      try {
        const oldQrChunks = Number(await this.state.storage.get('lastQrChunks')) || 0;
        for (let qi = 0; qi < oldQrChunks; qi++) {
          await this.state.storage.delete('lastQr_' + qi);
        }
        await this.state.storage.delete('lastQrChunks');
        await this.state.storage.delete('last');
        await this.state.storage.delete('lastPayUrge');
        await this.state.storage.delete('lastPayUrgeAt');
      } catch (e) {}
      const out = JSON.stringify(d);
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          try { s.send(out); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'urge_pay') {
      const now = Date.now();
      this.lastPayUrgeAt = now;
      const outObj = Object.assign({}, d, { urgePayCooldownMs: 0 });
      this.lastPayUrge = outObj;
      try {
        await this.state.storage.put('lastPayUrgeAt', now);
        await this.state.storage.put('lastPayUrge', outObj);
      } catch (e) {}
      const out = JSON.stringify(stripPayUrgeMeta(outObj, false));
      for (const s of this.state.getWebSockets()) {
        if (s !== ws && shouldDeliverPayUrge(s, outObj, this.last)) {
          try { s.send(out); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'urge') {
      const now = Date.now();
      if (!this.lastUrgeAt) {
        try { this.lastUrgeAt = Number(await this.state.storage.get('lastUrgeAt')) || 0; } catch (e) {}
      }
      const elapsed = now - (this.lastUrgeAt || 0);
      if (elapsed < URGE_COOLDOWN_MS) {
        try {
          ws.send(JSON.stringify({
            type: 'urge_rejected',
            bill: this.bill || d.bill,
            remainingMs: URGE_COOLDOWN_MS - elapsed
          }));
        } catch (e) {}
        return;
      }
      this.lastUrgeAt = now;
      try { await this.state.storage.put('lastUrgeAt', now); } catch (e) {}
      const out = JSON.stringify(Object.assign({}, d, { urgeCooldownMs: URGE_COOLDOWN_MS }));
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          try { s.send(out); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'pay_claim' || d.type === 'pay_claim_cancel' || d.type === 'urge_finalize') {
      const out = JSON.stringify(d);
      for (const s of this.state.getWebSockets()) {
        if (s !== ws && isHostPeer(s, d, this.last)) {
          try { s.send(out); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'pay_claim_rejected') {
      const out = JSON.stringify(d);
      for (const s of this.state.getWebSockets()) {
        if (s !== ws && matchesTargetPayer(s, d)) {
          try { s.send(out); } catch (e) {}
        }
      }
      return;
    }

    if (d.type === 'pay_confirmed') {
      const out = JSON.stringify(d);
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          try { s.send(out); } catch (e) {}
        }
      }
      return;
    }
  }

  async handleSepayWebhook(tx) {
    if (!tx || typeof tx !== 'object') {
      return { ok: true, matched: false, reason: 'invalid_payload' };
    }
    if (!this.last) {
      try { this.last = await loadLastWrap(this.state.storage); } catch (e) {}
    }
    if (!this.bill && tx._candidateBill) {
      this.bill = String(tx._candidateBill).trim();
    }
    if (!this.last || !Array.isArray(this.last.lines) || !this.last.lines.length) {
      return { ok: true, matched: false, reason: 'empty_bill', bill: this.bill };
    }

    const txKey = String(tx.id || tx.referenceCode || '').trim();
    let processedMap = (await this.state.storage.get('processedSepayTx')) || {};
    if (txKey && processedMap[txKey]) {
      return { ok: true, matched: true, duplicate: true, bill: this.bill, payer: processedMap[txKey].payer || '' };
    }

    const fields = this.last.fields || (this.last.fields = {});
    const hostBank = (fields.hostBank && fields.hostBank.v && typeof fields.hostBank.v === 'object')
      ? fields.hostBank.v
      : null;
    if (hostBank && hostBank.account) {
      const accOk = accountNumbersMatch(hostBank.account, tx.accountNumber) ||
        accountNumbersMatch(hostBank.account, tx.subAccount);
      if (!accOk) {
        return { ok: true, matched: false, reason: 'account_mismatch', bill: this.bill };
      }
    }

    const transferAmount = Math.round(Number(tx.transferAmount) || 0);
    if (transferAmount <= 0) {
      return { ok: true, matched: false, reason: 'invalid_amount', bill: this.bill };
    }

    const split = computeRoomBillSplit(this.last);
    // Đối khớp CHÍNH XÁC 100% số tiền cần trả (transferAmount === finalPay)
    const exactAmtUnpaid = split.people.filter(p => !p.paid && p.finalPay === transferAmount && p.finalPay > 0);
    if (!exactAmtUnpaid.length) {
      return { ok: true, matched: false, reason: 'no_exact_amount_match', bill: this.bill, transferAmount };
    }

    const billUpper = toAsciiUpper(this.bill || '');
    const billCompact = billUpper.replace(/\s+/g, '');
    const rawUpper = toAsciiUpper([tx.content, tx.description, tx.code].filter(Boolean).join(' '));
    const compactUpper = rawUpper.replace(/\s+/g, '');
    const idxBillCompact = billCompact ? compactUpper.indexOf(billCompact) : -1;
    const afterBillCompact = idxBillCompact !== -1 ? compactUpper.slice(idxBillCompact + billCompact.length) : '';

    const scored = exactAmtUnpaid.map(p => {
      const pAscii = toAsciiUpper(p.name).slice(0, 26).trim();
      const pCompact = pAscii.replace(/\s+/g, '');
      let score = 0;
      if (pAscii && billUpper && rawUpper.includes(billUpper + ' ' + pAscii)) {
        score = 4;
      } else if (pCompact && billCompact && compactUpper.includes(billCompact + pCompact)) {
        score = 3;
      } else if (pAscii && (rawUpper.includes(pAscii) || (pCompact.length >= 2 && compactUpper.includes(pCompact)))) {
        score = 2;
      } else if (pCompact.length >= 4 && afterBillCompact && afterBillCompact.startsWith(pCompact.slice(0, Math.min(pCompact.length, 8)))) {
        score = 1;
      }
      return { p, score, nameLen: pCompact.length };
    });

    scored.sort((a, b) => (b.score - a.score) || (b.nameLen - a.nameLen));

    let targetMember = null;
    if (scored[0] && scored[0].score > 0) {
      targetMember = scored[0].p;
    } else if (exactAmtUnpaid.length === 1 && billCompact && (rawUpper.includes(billUpper) || compactUpper.includes(billCompact))) {
      targetMember = exactAmtUnpaid[0];
    }

    if (!targetMember) {
      return { ok: true, matched: false, reason: 'member_not_matched', bill: this.bill, transferAmount };
    }

    const prevPmField = fields.paidMap;
    const nextPm = (prevPmField && prevPmField.v && typeof prevPmField.v === 'object')
      ? Object.assign({}, prevPmField.v)
      : {};
    nextPm[targetMember.payKey] = true;
    fields.paidMap = {
      v: nextPm,
      rev: ((prevPmField && Number(prevPmField.rev)) || 0) + 1,
      by: 'sepay'
    };

    const prevClaimField = fields.payClaimMap;
    if (prevClaimField && prevClaimField.v && typeof prevClaimField.v === 'object') {
      const nextClaims = Object.assign({}, prevClaimField.v);
      const nameKey = 'n:' + String(targetMember.name || '').trim().toLowerCase();
      let claimChanged = false;
      if (nextClaims[targetMember.payKey] !== undefined) {
        delete nextClaims[targetMember.payKey];
        claimChanged = true;
      }
      if (nextClaims[nameKey] !== undefined) {
        delete nextClaims[nameKey];
        claimChanged = true;
      }
      if (claimChanged) {
        fields.payClaimMap = {
          v: nextClaims,
          rev: (Number(prevClaimField.rev) || 0) + 1,
          by: 'sepay'
        };
      }
    }

    if (txKey) {
      processedMap[txKey] = { at: Date.now(), payer: targetMember.name, amount: transferAmount };
      const keys = Object.keys(processedMap);
      if (keys.length > 200) {
        keys.sort((a, b) => (processedMap[a].at || 0) - (processedMap[b].at || 0));
        for (let i = 0; i < keys.length - 200; i++) delete processedMap[keys[i]];
      }
      try { await this.state.storage.put('processedSepayTx', processedMap); } catch (e) {}
    }

    try { await saveLastWrap(this.state.storage, this.last); } catch (e) {}
    this.reportToBillIndex(this.bill, this.last, false).catch(() => {});

    const hostUid = (fields.hostUid && fields.hostUid.v) ? String(fields.hostUid.v) : '';
    const hostName = (fields.customer && fields.customer.v) ? String(fields.customer.v) : 'Đại diện';
    const stateMsg = JSON.stringify({ type: 'state', bill: this.bill, wrap: this.last, from: 'sepay' });
    const confirmMsg = JSON.stringify({
      type: 'pay_confirmed',
      bill: this.bill,
      from: 'sepay',
      viaSePay: true,
      confirmId: 'sepay_' + (txKey || (Date.now() + '_' + Math.random().toString(36).slice(2, 6))),
      hostUid,
      hostName,
      payerUid: targetMember.uid || '',
      payerName: targetMember.name,
      amount: transferAmount,
      text: PAY_CONFIRMED_TEXT,
      audio: PAY_CONFIRMED_AUDIO,
      ts: Date.now()
    });

    for (const s of this.state.getWebSockets()) {
      try { s.send(stateMsg); } catch (e) {}
      try { s.send(confirmMsg); } catch (e) {}
    }

    return {
      ok: true,
      matched: true,
      bill: this.bill,
      payer: targetMember.name,
      amount: transferAmount,
      txId: txKey
    };
  }

  async webSocketClose(ws) {
    const cid = ws.cid;
    if (cid && this.presence[cid]) {
      delete this.presence[cid];
      const leaveMsg = JSON.stringify({ type: 'peer_left', bill: this.bill, uid: ws.uid, from: cid });
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          try { s.send(leaveMsg); } catch (e) {}
        }
      }
    }
    try { ws.close(); } catch (e) {}
  }

  async webSocketError(ws) {
    try { ws.close(); } catch (e) {}
  }
}

async function handleIncomingSePayWebhookRequest(request, env) {
  if (request.method === 'GET') {
    return jsonCors({ ok: true, service: 'sepay-webhook', auth: 'HMAC-SHA256', configured: !!env.SEPAY_WEBHOOK_SECRET });
  }
  if (request.method !== 'POST') {
    return jsonCors({ success: false, error: 'Method not allowed' }, 405);
  }
  const secretKey = env && env.SEPAY_WEBHOOK_SECRET ? String(env.SEPAY_WEBHOOK_SECRET).trim() : '';
  if (!secretKey) {
    return jsonCors({ success: false, error: 'Webhook secret not configured on server' }, 500);
  }

  const rawBody = await request.text();
  const sigCheck = await verifySePaySignature(request, rawBody, secretKey);
  if (!sigCheck.valid) {
    return jsonCors({ success: false, error: 'Unauthorized', reason: sigCheck.reason }, 401);
  }

  let tx = null;
  try {
    tx = JSON.parse(rawBody);
  } catch (e) {
    return jsonCors({ success: false, error: 'Invalid JSON body' }, 400);
  }
  if (!tx || typeof tx !== 'object') {
    return jsonCors({ success: false, error: 'Empty payload' }, 400);
  }

  if (String(tx.transferType || '').toLowerCase() !== 'in') {
    return jsonCors({ success: true, ignored: 'not_incoming' });
  }
  const transferAmount = Math.round(Number(tx.transferAmount) || 0);
  if (transferAmount <= 0) {
    return jsonCors({ success: true, ignored: 'zero_amount' });
  }

  const rawUpper = toAsciiUpper([tx.content, tx.description, tx.code].filter(Boolean).join(' '));
  const compactUpper = rawUpper.replace(/\s+/g, '');

  const candidateBills = [];
  const addCandidate = (code) => {
    const clean = String(code || '').trim();
    if (!clean) return;
    if (!candidateBills.includes(clean)) candidateBills.push(clean);
  };

  // 1. Tìm trong danh sách bill gần đây ở __BILL_INDEX__ (ưu tiên mới nhất trước)
  try {
    const idxId = env.LIVE_ROOM.idFromName('__BILL_INDEX__');
    const idxRes = await env.LIVE_ROOM.get(idxId).fetch('https://internal/__index_list');
    const idxData = await idxRes.json();
    if (idxData && Array.isArray(idxData.bills)) {
      for (const b of idxData.bills) {
        if (!b || !b.bill) continue;
        const bCode = String(b.bill).trim();
        const bUpper = toAsciiUpper(bCode);
        const bCompact = bUpper.replace(/\s+/g, '');
        if (!bCompact || bCompact.length < 3) continue;
        const wordRe = new RegExp('(^|[^A-Z0-9])' + escapeRegExp(bUpper) + '([^A-Z0-9]|$)');
        if (wordRe.test(rawUpper) || (bCompact.length >= 4 && compactUpper.includes(bCompact))) {
          addCandidate(bCode);
        }
      }
    }
  } catch (e) {}

  // 2. Fallback regex tìm mã bill chuẩn dạng Uxxxx (5 ký tự) trong nội dung chuyển khoản
  const regexMatches = rawUpper.match(/\bU[2-9A-HJ-NP-Z]{4}\b/g) || [];
  for (const m of regexMatches) addCandidate(m);

  // 3. Fallback từ trường tx.code nếu SePay tự tách mã
  if (tx.code) {
    const cleanTxCode = toAsciiUpper(tx.code).replace(/\s+/g, '');
    if (cleanTxCode.length >= 4 && cleanTxCode.length <= 14) {
      addCandidate(cleanTxCode);
    }
  }

  const attempts = [];
  for (const billCode of candidateBills.slice(0, 5)) {
    try {
      const roomId = env.LIVE_ROOM.idFromName(billCode);
      const roomRes = await env.LIVE_ROOM.get(roomId).fetch('https://internal/__sepay_webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, tx, { _candidateBill: billCode }))
      });
      const roomJson = await roomRes.json();
      attempts.push(roomJson);
      if (roomJson && roomJson.matched) {
        return jsonCors({
          success: true,
          matched: true,
          duplicate: !!roomJson.duplicate,
          bill: roomJson.bill || billCode,
          payer: roomJson.payer || '',
          amount: roomJson.amount || transferAmount
        });
      }
    } catch (e) {}
  }

  return jsonCors({
    success: true,
    matched: false,
    candidates: candidateBills.slice(0, 5),
    attempts
  });
}

const IMG_KEY_RE = /^m_[a-z0-9_]+\.(webp|jpg|png)$/i;
const MAX_UPLOAD_BYTES = 512 * 1024; // 512 KB (client compresses to 800x800 WebP ~30-90KB)

function extractImageKey(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (IMG_KEY_RE.test(s)) return s;
  const m = s.match(/\/img\/(m_[a-z0-9_]+\.(?:webp|jpg|png))(?:\?.*)?$/i);
  return m ? m[1] : '';
}

async function handleImageUpload(request, env, u) {
  if (request.method !== 'POST') return jsonCors({ ok: false, error: 'Method not allowed' }, 405);
  if (!env.MENU_IMAGES) return jsonCors({ ok: false, error: 'KV MENU_IMAGES chưa được cấu hình' }, 500);

  const rawCt = String(request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const extMap = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png' };
  const ext = extMap[rawCt];
  if (!ext) {
    return jsonCors({ ok: false, error: 'Chỉ hỗ trợ ảnh WebP / JPG / PNG' }, 415);
  }

  let buf;
  try {
    buf = await request.arrayBuffer();
  } catch (e) {
    return jsonCors({ ok: false, error: 'Không đọc được dữ liệu ảnh' }, 400);
  }
  if (!buf || buf.byteLength === 0) {
    return jsonCors({ ok: false, error: 'File ảnh rỗng' }, 400);
  }
  if (buf.byteLength > MAX_UPLOAD_BYTES) {
    return jsonCors({ ok: false, error: 'Ảnh sau nén vượt quá 512KB' }, 413);
  }

  const rand = Math.random().toString(36).slice(2, 8);
  const key = 'm_' + Date.now().toString(36) + '_' + rand + '.' + ext;
  const storeId = String(u.searchParams.get('store') || '').slice(0, 64);
  const oldKey = extractImageKey(u.searchParams.get('old') || '');

  try {
    await env.MENU_IMAGES.put(key, buf, {
      metadata: { contentType: rawCt === 'image/jpg' ? 'image/jpeg' : rawCt, storeId, uploadedAt: Date.now() }
    });
    if (oldKey && oldKey !== key) {
      await env.MENU_IMAGES.delete(oldKey).catch(() => {});
    }
  } catch (e) {
    return jsonCors({ ok: false, error: 'Lỗi lưu ảnh lên KV: ' + (e && e.message ? e.message : 'unknown') }, 500);
  }

  return jsonCors({
    ok: true,
    key,
    url: u.origin + '/img/' + key,
    size: buf.byteLength
  });
}

async function handleImageGet(env, key) {
  if (!env.MENU_IMAGES || !IMG_KEY_RE.test(key)) {
    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  }
  try {
    const res = await env.MENU_IMAGES.getWithMetadata(key, { type: 'arrayBuffer' });
    if (!res || !res.value) {
      return new Response('Not found', { status: 404, headers: CORS_HEADERS });
    }
    const ext = key.split('.').pop().toLowerCase();
    const fallbackCt = ext === 'png' ? 'image/png' : (ext === 'jpg' ? 'image/jpeg' : 'image/webp');
    const ct = (res.metadata && res.metadata.contentType) || fallbackCt;
    return new Response(res.value, {
      status: 200,
      headers: Object.assign({
        'Content-Type': ct,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }, CORS_HEADERS)
    });
  } catch (e) {
    return new Response('Error reading image', { status: 500, headers: CORS_HEADERS });
  }
}

async function handleImageDelete(request, env) {
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    return jsonCors({ ok: false, error: 'Method not allowed' }, 405);
  }
  if (!env.MENU_IMAGES) return jsonCors({ ok: false, error: 'KV MENU_IMAGES chưa được cấu hình' }, 500);
  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    return jsonCors({ ok: false, error: 'JSON không hợp lệ' }, 400);
  }
  const rawList = []
    .concat(Array.isArray(body.keys) ? body.keys : [])
    .concat(Array.isArray(body.urls) ? body.urls : [])
    .concat(body.key ? [body.key] : [])
    .concat(body.url ? [body.url] : []);

  const uniqueKeys = Array.from(new Set(rawList.map(extractImageKey).filter(Boolean))).slice(0, 60);
  let deleted = 0;
  for (const k of uniqueKeys) {
    try {
      await env.MENU_IMAGES.delete(k);
      deleted++;
    } catch (e) {}
  }
  return jsonCors({ ok: true, deleted });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    const u = new URL(request.url);
    if (u.pathname === '/webhook/sepay' || u.pathname === '/webhook/sepay/') {
      return handleIncomingSePayWebhookRequest(request, env);
    }
    if (u.pathname === '/api/upload-image') {
      return handleImageUpload(request, env, u);
    }
    if (u.pathname === '/api/delete-image') {
      return handleImageDelete(request, env);
    }
    const imgMatch = u.pathname.match(/^\/img\/([^/]+)$/);
    if (imgMatch && request.method === 'GET') {
      return handleImageGet(env, decodeURIComponent(imgMatch[1]));
    }
    if (u.pathname === '/bills') {
      const idxId = env.LIVE_ROOM.idFromName('__BILL_INDEX__');
      return env.LIVE_ROOM.get(idxId).fetch(request);
    }
    const m = u.pathname.match(/^\/bill\/(.+)/);
    if (!m) return new Response('POS Live relay. WS: /bill/MÃ', { status: 200, headers: CORS_HEADERS });
    const id = env.LIVE_ROOM.idFromName(decodeURIComponent(m[1]));
    return env.LIVE_ROOM.get(id).fetch(request);
  }
};
