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
var rooms = {}; // bill -> last state message

wss.on('connection', function (s) {
  s.on('message', function (raw) {
    var d = null;
    try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || !d.bill) return;
    if (d.type === 'hello') {
      var last = rooms[d.bill];
      if (last) {
        try { s.send(JSON.stringify({ type: 'state', bill: d.bill, wrap: last, from: 'server' })); } catch (e) {}
      }
      return;
    }
    if (d.type === 'state' && d.wrap) {
      rooms[d.bill] = d.wrap;
      wss.clients.forEach(function (c) {
        if (c !== s && c.readyState === 1) {
          try { c.send(JSON.stringify({ type: 'state', bill: d.bill, wrap: d.wrap, from: d.from })); } catch (e) {}
        }
      });
    }
  });
});

console.log('POS Live WS chay o port ' + PORT);
