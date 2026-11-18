/* POS Live — WebSocket relay cho nhiều máy văn phòng.
 * Chạy: npm i ws && node server.js [PORT]
 * Máy khác vào Cài đặt POS Live, điền: ws://IP-may-nay:8787
 * Live trong cùng trình duyệt không cần server (BroadcastChannel). */
var PORT = Number(process.argv[2]) || 8787;
var WebSocketServer;
try {
  WebSocketServer = require('ws').WebSocketServer;
} catch (e) {
  console.error('Thieu thu vien ws. Chay: npm i ws');
  process.exit(1);
}
var wss = new WebSocketServer({ port: PORT });
var URGE_COOLDOWN_MS = 10000;
var PAY_URGE_COOLDOWN_MS = 0;
var rooms = {}; // bill -> { last: wrap, lastUrgeAt: number, lastPayUrgeAt: number, lastPayUrge: object, presence: { cid -> ... } }

function isPaidInLastState(lastWrap, uid, uname) {
  var pm = lastWrap && lastWrap.fields && lastWrap.fields.paidMap && lastWrap.fields.paidMap.v;
  if (!pm || typeof pm !== 'object') return false;
  if (uid && pm['u:' + String(uid)] === true) return true;
  var normName = String(uname || '').trim().toLowerCase();
  return !!(normName && pm['n:' + normName] === true);
}

function shouldDeliverPayUrge(peer, msg, lastWrap) {
  if (!peer || !msg) return false;
  var uid = peer.uid ? String(peer.uid) : '';
  var uname = String(peer.uname || '').trim().toLowerCase();
  if (isPaidInLastState(lastWrap, uid, uname)) return false;
  var hasUidFilter = Array.isArray(msg.targetUids);
  var hasNameFilter = Array.isArray(msg.targetNames);
  if (!hasUidFilter && !hasNameFilter) return true;
  if (uid && hasUidFilter && msg.targetUids.indexOf(uid) !== -1) return true;
  if (uname && hasNameFilter && msg.targetNames.indexOf(uname) !== -1) return true;
  return false;
}

function stripPayUrgeMeta(obj, removeAlertFields) {
  var copy = Object.assign({}, obj);
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

function prunePresence(room) {
  if (!room || !room.presence) return;
  var now = Date.now();
  Object.keys(room.presence).forEach(function (cid) {
    if (now - room.presence[cid].lastSeen > 12000) {
      delete room.presence[cid];
    }
  });
}

wss.on('connection', function (s) {
  s.on('message', function (raw) {
    var d = null;
    try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || !d.bill) return;

    if (!rooms[d.bill]) rooms[d.bill] = { last: null, lastUrgeAt: 0, lastPayUrgeAt: 0, lastPayUrge: null, presence: {} };
    s.bill = d.bill;

    if (d.type === 'hello') {
      var cid = d.from || Math.random().toString(36).slice(2);
      s.cid = cid;
      s.uid = d.uid || cid;
      s.uname = d.uname || d.dev || 'Bạn';
      s.ucolor = d.ucolor || '#0A7259';

      rooms[d.bill].presence[cid] = {
        cid: cid,
        uid: s.uid,
        uname: s.uname,
        ucolor: s.ucolor,
        lastSeen: Date.now()
      };
      prunePresence(rooms[d.bill]);

      var last = rooms[d.bill].last;
      if (last) {
        try { s.send(JSON.stringify({ type: 'state', bill: d.bill, wrap: last, from: 'server' })); } catch (e) {}
      }
      // Send current presence list to newly joined peer
      var pres = rooms[d.bill].presence;
      if (pres && Object.keys(pres).length > 0) {
        try { s.send(JSON.stringify({ type: 'presence_list', bill: d.bill, users: pres })); } catch (e) {}
      }
      // Inform newly joined peer if room urge cooldown is active
      var helloElapsed = Date.now() - (rooms[d.bill].lastUrgeAt || 0);
      if (rooms[d.bill].lastUrgeAt > 0 && helloElapsed < URGE_COOLDOWN_MS) {
        try {
          s.send(JSON.stringify({
            type: 'urge_cooldown',
            bill: d.bill,
            remainingMs: URGE_COOLDOWN_MS - helloElapsed
          }));
        } catch (e) {}
      }
      var payElapsed = Date.now() - (rooms[d.bill].lastPayUrgeAt || 0);
      if (rooms[d.bill].lastPayUrgeAt > 0 && payElapsed < PAY_URGE_COOLDOWN_MS) {
        try {
          s.send(JSON.stringify({
            type: 'urge_pay_cooldown',
            bill: d.bill,
            remainingMs: PAY_URGE_COOLDOWN_MS - payElapsed
          }));
        } catch (e) {}
      }
      if (rooms[d.bill].lastPayUrge && shouldDeliverPayUrge(s, rooms[d.bill].lastPayUrge, rooms[d.bill].last)) {
        try {
          s.send(JSON.stringify(Object.assign(stripPayUrgeMeta(rooms[d.bill].lastPayUrge, false), { isSyncReplay: true })));
        } catch (e) {}
      }
      // Broadcast peer_joined to other peers
      var peerMsg = JSON.stringify({
        type: 'peer_joined',
        bill: d.bill,
        from: cid,
        dev: d.dev || s.uname,
        uid: s.uid,
        uname: s.uname,
        ucolor: s.ucolor
      });
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill) {
          try { c.send(peerMsg); } catch (e) {}
        }
      });
      return;
    }

    if (d.type === 'state' && d.wrap) {
      rooms[d.bill].last = d.wrap;
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill) {
          try { c.send(JSON.stringify({ type: 'state', bill: d.bill, wrap: d.wrap, from: d.from })); } catch (e) {}
        }
      });
      return;
    }

    if (d.type === 'presence') {
      var pcid = d.from || s.cid;
      if (pcid) {
        s.cid = pcid;
        if (d.uid) s.uid = d.uid;
        if (d.uname) s.uname = d.uname;
        if (d.ucolor) s.ucolor = d.ucolor;
        rooms[d.bill].presence[pcid] = {
          cid: pcid,
          uid: d.uid || s.uid,
          uname: d.uname || s.uname || 'Bạn',
          ucolor: d.ucolor || s.ucolor || '#0A7259',
          lastSeen: Date.now()
        };
      }
      var outObj = d;
      if (d.urge) {
        var now = Date.now();
        var elapsed = now - (rooms[d.bill].lastUrgeAt || 0);
        if (elapsed < URGE_COOLDOWN_MS) {
          try {
            s.send(JSON.stringify({ type: 'urge_rejected', bill: d.bill, remainingMs: URGE_COOLDOWN_MS - elapsed }));
          } catch (e) {}
          outObj = Object.assign({}, d);
          delete outObj.urge;
          delete outObj.urgeId;
          delete outObj.urgeVoiceId;
          delete outObj.urgeText;
          delete outObj.urgeAudio;
        } else {
          rooms[d.bill].lastUrgeAt = now;
          outObj = Object.assign({}, d, { urgeCooldownMs: URGE_COOLDOWN_MS });
        }
      }
      var payUrgeAllowed = false;
      if (d.urgePay) {
        var nowPay = Date.now();
        rooms[d.bill].lastPayUrgeAt = nowPay;
        payUrgeAllowed = true;
        outObj = Object.assign({}, outObj, { urgePayCooldownMs: 0 });
        rooms[d.bill].lastPayUrge = outObj;
      }
      var basePresenceStr = payUrgeAllowed ? null : JSON.stringify(stripPayUrgeMeta(outObj, false));
      var targetedPresenceStr = payUrgeAllowed ? JSON.stringify(stripPayUrgeMeta(outObj, false)) : null;
      var nonTargetPresenceStr = payUrgeAllowed ? JSON.stringify(stripPayUrgeMeta(outObj, true)) : null;
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill) {
          var payload = payUrgeAllowed
            ? (shouldDeliverPayUrge(c, outObj, rooms[d.bill].last) ? targetedPresenceStr : nonTargetPresenceStr)
            : basePresenceStr;
          try { c.send(payload); } catch (e) {}
        }
      });
      return;
    }

    if (d.type === 'peer_left') {
      var lcid = d.from || s.cid;
      if (lcid && rooms[d.bill] && rooms[d.bill].presence) {
        delete rooms[d.bill].presence[lcid];
      }
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill) {
          try { c.send(JSON.stringify(d)); } catch (e) {}
        }
      });
      return;
    }

    if (d.type === 'reset') {
      rooms[d.bill].last = null;
      rooms[d.bill].lastPayUrge = null;
      rooms[d.bill].lastPayUrgeAt = 0;
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill) {
          try { c.send(JSON.stringify(d)); } catch (e) {}
        }
      });
      return;
    }

    if (d.type === 'urge_pay') {
      var nowP = Date.now();
      rooms[d.bill].lastPayUrgeAt = nowP;
      var urgePayOut = Object.assign({}, d, { urgePayCooldownMs: 0 });
      rooms[d.bill].lastPayUrge = urgePayOut;
      var urgePayPayload = JSON.stringify(stripPayUrgeMeta(urgePayOut, false));
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill && shouldDeliverPayUrge(c, urgePayOut, rooms[d.bill].last)) {
          try { c.send(urgePayPayload); } catch (e) {}
        }
      });
      return;
    }

    if (d.type === 'urge') {
      var nowU = Date.now();
      var elapsedU = nowU - (rooms[d.bill].lastUrgeAt || 0);
      if (elapsedU < URGE_COOLDOWN_MS) {
        try {
          s.send(JSON.stringify({ type: 'urge_rejected', bill: d.bill, remainingMs: URGE_COOLDOWN_MS - elapsedU }));
        } catch (e) {}
        return;
      }
      rooms[d.bill].lastUrgeAt = nowU;
      var urgePayload = JSON.stringify(Object.assign({}, d, { urgeCooldownMs: URGE_COOLDOWN_MS }));
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill) {
          try { c.send(urgePayload); } catch (e) {}
        }
      });
      return;
    }
  });

  s.on('close', function () {
    var cid = s.cid;
    if (s.bill && cid && rooms[s.bill] && rooms[s.bill].presence) {
      delete rooms[s.bill].presence[cid];
      var leaveMsg = JSON.stringify({ type: 'peer_left', bill: s.bill, uid: s.uid, from: cid });
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === s.bill) {
          try { c.send(leaveMsg); } catch (e) {}
        }
      });
    }
  });
});

console.log('POS Live WS chay o port ' + PORT);
