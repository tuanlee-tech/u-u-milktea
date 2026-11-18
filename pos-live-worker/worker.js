/* POS Live relay — chay tren Cloudflare Workers + Durable Objects.
 * Moi bill (?bill=MÃ) la 1 phong, tu gop o client, server chi chuyen tiep. */

const URGE_COOLDOWN_MS = 30000;
const PAY_URGE_COOLDOWN_MS = 30000;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function jsonCors(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, CORS_HEADERS)
  });
}

function summarizeRoomWrap(bill, lastWrap, presenceMap) {
  const lines = lastWrap && Array.isArray(lastWrap.lines) ? lastWrap.lines : [];
  const fields = (lastWrap && lastWrap.fields) || {};
  const hostName = (fields.cust && fields.cust.v) ? String(fields.cust.v) : '';
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
        this.last = (await this.state.storage.get('last')) || null;
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
          try { this.last = (await this.state.storage.get('last')) || null; } catch (e) {}
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
        try { this.last = (await this.state.storage.get('last')) || null; } catch (e) {}
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
      if (!this.lastPayUrgeAt) {
        try { this.lastPayUrgeAt = Number(await this.state.storage.get('lastPayUrgeAt')) || 0; } catch (e) {}
      }
      if (!this.lastPayUrge) {
        try { this.lastPayUrge = (await this.state.storage.get('lastPayUrge')) || null; } catch (e) {}
      }
      const payElapsed = Date.now() - (this.lastPayUrgeAt || 0);
      if (this.lastPayUrgeAt > 0 && payElapsed < PAY_URGE_COOLDOWN_MS) {
        try {
          ws.send(JSON.stringify({
            type: 'urge_pay_cooldown',
            bill: this.bill,
            remainingMs: PAY_URGE_COOLDOWN_MS - payElapsed
          }));
        } catch (e) {}
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
      try { await this.state.storage.put('last', incoming); } catch (e) {}
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
        if (!this.lastPayUrgeAt) {
          try { this.lastPayUrgeAt = Number(await this.state.storage.get('lastPayUrgeAt')) || 0; } catch (e) {}
        }
        const elapsedPay = nowPay - (this.lastPayUrgeAt || 0);
        if (elapsedPay < PAY_URGE_COOLDOWN_MS) {
          const remPayMs = PAY_URGE_COOLDOWN_MS - elapsedPay;
          try {
            ws.send(JSON.stringify({ type: 'urge_pay_rejected', bill: this.bill || d.bill, remainingMs: remPayMs }));
          } catch (e) {}
          outObj = stripPayUrgeMeta(outObj, true);
        } else {
          this.lastPayUrgeAt = nowPay;
          payUrgeAllowed = true;
          outObj = Object.assign({}, outObj, { urgePayCooldownMs: PAY_URGE_COOLDOWN_MS });
          this.lastPayUrge = outObj;
          try {
            await this.state.storage.put('lastPayUrgeAt', nowPay);
            await this.state.storage.put('lastPayUrge', outObj);
          } catch (e) {}
        }
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
      if (!this.lastPayUrgeAt) {
        try { this.lastPayUrgeAt = Number(await this.state.storage.get('lastPayUrgeAt')) || 0; } catch (e) {}
      }
      const elapsed = now - (this.lastPayUrgeAt || 0);
      if (elapsed < PAY_URGE_COOLDOWN_MS) {
        try {
          ws.send(JSON.stringify({
            type: 'urge_pay_rejected',
            bill: this.bill || d.bill,
            remainingMs: PAY_URGE_COOLDOWN_MS - elapsed
          }));
        } catch (e) {}
        return;
      }
      this.lastPayUrgeAt = now;
      const outObj = Object.assign({}, d, { urgePayCooldownMs: PAY_URGE_COOLDOWN_MS });
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

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    const u = new URL(request.url);
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
