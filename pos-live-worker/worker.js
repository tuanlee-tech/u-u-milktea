/* POS Live relay — chay tren Cloudflare Workers + Durable Objects.
 * Moi bill (?bill=MÃ) la 1 phong, tu gop o client, server chi chuyen tiep. */

const URGE_COOLDOWN_MS = 30000;
const PAY_URGE_COOLDOWN_MS = 30000;

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
  constructor(state) {
    this.state = state;
    this.bill = '';
    this.last = null;
    this.lastUrgeAt = 0;
    this.lastPayUrgeAt = 0;
    this.lastPayUrge = null;
    this.presence = {}; // cid -> { cid, uid, uname, ucolor, lastSeen }
    this.state.blockConcurrencyWhile(async () => {
      try {
        this.last = (await this.state.storage.get('last')) || null;
        this.lastUrgeAt = Number(await this.state.storage.get('lastUrgeAt')) || 0;
        this.lastPayUrgeAt = Number(await this.state.storage.get('lastPayUrgeAt')) || 0;
        this.lastPayUrge = (await this.state.storage.get('lastPayUrge')) || null;
      } catch (e) {
        this.last = null;
        this.lastUrgeAt = 0;
        this.lastPayUrgeAt = 0;
        this.lastPayUrge = null;
      }
    });
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('POS Live relay. WS: /bill/MÃ', { status: 400 });
    }
    const pair = new WebSocketPair();
    this.state.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
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
      if (d.bill) this.bill = String(d.bill);
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
      this.last = incoming;
      try { await this.state.storage.put('last', incoming); } catch (e) {}
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
    const u = new URL(request.url);
    const m = u.pathname.match(/^\/bill\/(.+)/);
    if (!m) return new Response('POS Live relay. WS: /bill/MÃ', { status: 200 });
    const id = env.LIVE_ROOM.idFromName(decodeURIComponent(m[1]));
    return env.LIVE_ROOM.get(id).fetch(request);
  }
};
