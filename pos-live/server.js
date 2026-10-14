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
var rooms = {}; // bill -> { last: wrap, presence: { cid -> { cid, uid, uname, ucolor, lastSeen } } }

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

    if (!rooms[d.bill]) rooms[d.bill] = { last: null, presence: {} };
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
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill) {
          try { c.send(JSON.stringify(d)); } catch (e) {}
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
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1 && c.bill === d.bill) {
          try { c.send(JSON.stringify(d)); } catch (e) {}
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
