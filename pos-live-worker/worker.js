/* POS Live relay — chay tren Cloudflare Workers + Durable Objects.
 * Moi bill (?bill=MÃ) la 1 phong, tu gop o client, server chi chuyen tiep. */

export class LiveRoom {
  constructor(state) {
    this.state = state;
    this.bill = '';
    this.last = null;
    this.presence = {}; // cid -> { cid, uid, uname, ucolor, lastSeen }
    this.state.blockConcurrencyWhile(async () => {
      try {
        this.last = (await this.state.storage.get('last')) || null;
      } catch (e) {
        this.last = null;
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
      this.last = d.wrap;
      try { await this.state.storage.put('last', d.wrap); } catch (e) {}
      const out = JSON.stringify({ type: 'state', bill: this.bill || d.bill, wrap: d.wrap, from: d.from });
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
      const out = JSON.stringify(d);
      for (const s of this.state.getWebSockets()) {
        if (s !== ws) {
          try { s.send(out); } catch (e) {}
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
      try { await this.state.storage.delete('last'); } catch (e) {}
      const out = JSON.stringify(d);
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
