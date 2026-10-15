/* Ú Ụ Milk Tea — Web Đặt Trà Sữa Chung Nhóm (Live Collaboration)
 * Realtime sync qua Cloudflare Workers + Durable Objects / BroadcastChannel
 * HTML5 Canvas Bill Generator & Automatic Bill Splitter
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* ================= 1. MENU DỮ LIỆU GỐC ================= */
  var DEFAULT_MENU = [
    { id: 'ts01', ten: 'Ú ụ full topping', nhom: 'trasua', giaM: 30000, giaL: 38000, note: 'M 30-32 / L 38-40 tùy topping' },
    { id: 'ts02', ten: 'Trà sữa truyền thống', nhom: 'trasua', giaM: 18000, giaL: 22000 },
    { id: 'ts03', ten: 'Trà sữa thái xanh', nhom: 'trasua', giaM: 18000, giaL: 22000 },
    { id: 'ts04', ten: 'Trà sữa thái đỏ', nhom: 'trasua', giaM: 18000, giaL: 22000 },
    { id: 'ts05', ten: 'Trà sữa khoai môn', nhom: 'trasua', giaM: 18000, giaL: 22000 },
    { id: 'ts06', ten: 'Trà sữa olong lài', nhom: 'trasua', giaM: 20000, giaL: 25000 },
    { id: 'ts07', ten: 'Trà sữa chocomint', nhom: 'trasua', giaM: 20000, giaL: 25000 },
    { id: 'ts08', ten: 'Trà sữa socola', nhom: 'trasua', giaM: 20000, giaL: 25000 },
    { id: 'ts09', ten: 'Trà sữa gạo rang', nhom: 'trasua', giaM: 20000, giaL: 25000 },
    { id: 'st01', ten: 'Sữa tươi cf sương sáo', nhom: 'suatuoi', giaM: 25000, giaL: 30000 },
    { id: 'st02', ten: 'Sữa tươi tc đường đen', nhom: 'suatuoi', giaM: 25000, giaL: 30000 },
    { id: 'st03', ten: 'Matcha latte', nhom: 'suatuoi', giaM: 27000, giaL: 32000 },
    { id: 'st04', ten: 'Khoai môn latte', nhom: 'suatuoi', giaM: 27000, giaL: 32000 },
    { id: 'st05', ten: 'Cacao latte', nhom: 'suatuoi', giaM: 27000, giaL: 32000 },
    { id: 'tr01', ten: 'Hồng trà', nhom: 'tra', giaM: 12000, giaL: 17000 },
    { id: 'tr02', ten: 'Hồng trà tắc', nhom: 'tra', giaM: 12000, giaL: 17000 },
    { id: 'tr03', ten: 'Trà tắc thái xanh', nhom: 'tra', giaM: 12000, giaL: 17000 },
    { id: 'tr04', ten: 'Lục trà lài', nhom: 'tra', giaM: 12000, giaL: 17000 },
    { id: 'tr05', ten: 'Lục trà tắc', nhom: 'tra', giaM: 12000, giaL: 17000 },
    { id: 'tc01', ten: 'Trà ổi hồng', nhom: 'traitraicay', giaM: 25000, giaL: 30000 },
    { id: 'tc02', ten: 'Trà đào', nhom: 'traitraicay', giaM: 25000, giaL: 30000 },
    { id: 'tc03', ten: 'Trà vải', nhom: 'traitraicay', giaM: 25000, giaL: 30000 },
    { id: 'tc04', ten: 'Trà xoài chanh dây', nhom: 'traitraicay', giaM: 25000, giaL: 30000 },
    { id: 'tc05', ten: 'Trà nhiệt đới', nhom: 'traitraicay', giaM: 25000, giaL: 30000 },
    { id: 'tc06', ten: 'Trà tắc xí muội', nhom: 'traitraicay', giaM: 15000, giaL: 20000 },
    { id: 'tc07', ten: 'Trà dưa lưới', nhom: 'traitraicay', giaM: 25000, giaL: 30000 },
    { id: 'tc08', ten: 'Trà dâu', nhom: 'traitraicay', giaM: 25000, giaL: 30000 },
    { id: 'tc09', ten: 'Trà đặc thơm (dứa)', nhom: 'traitraicay', giaM: 27000, giaL: 32000 },
    { id: 'tp01', ten: 'Trân châu dừa', nhom: 'topping', gia: 6000 },
    { id: 'tp02', ten: 'Trân châu đen', nhom: 'topping', gia: 6000 },
    { id: 'tp03', ten: 'Trân châu trắng', nhom: 'topping', gia: 6000 },
    { id: 'tp04', ten: 'Trân châu phô mai', nhom: 'topping', gia: 1000, note: '1k/viên' },
    { id: 'tp05', ten: 'Trân châu củ năng', nhom: 'topping', gia: 6000 },
    { id: 'tp06', ten: 'Khoai dẻo', nhom: 'topping', gia: 5000 },
    { id: 'tp07', ten: 'Sương sáo', nhom: 'topping', gia: 5000 },
    { id: 'tp08', ten: 'Rau câu phô mai', nhom: 'topping', gia: 6000, note: '6k/4 viên' },
    { id: 'tp09', ten: 'Pudding socola', nhom: 'topping', gia: 5000 },
    { id: 'tp10', ten: 'Pudding trứng', nhom: 'topping', gia: 5000 },
    { id: 'tp11', ten: 'Khúc bạch tảng', nhom: 'topping', gia: 5000, note: '5k/3 viên' },
    { id: 'tp12', ten: 'Khúc bạch', nhom: 'topping', gia: 6000, note: '6k/3 viên' },
    { id: 'tp13', ten: 'Khúc bạch bảy màu', nhom: 'topping', gia: 6000 },
    { id: 'tp14', ten: 'Khúc bạch donut', nhom: 'topping', gia: 14000 },
    { id: 'tp15', ten: 'Khúc bạch chân mèo', nhom: 'topping', gia: 6000, note: '4k/6k/8k — mặc định 6k' },
    { id: 'tp16', ten: 'Khúc bạch jerry', nhom: 'topping', gia: 6000, note: '6k/8k — mặc định 6k' },
    { id: 'tp17', ten: 'Kem trứng', nhom: 'topping', gia: 6000 },
    { id: 'tp18', ten: 'Kem cheese', nhom: 'topping', gia: 6000 },
    { id: 'tp19', ten: 'Khoai môn tươi', nhom: 'topping', gia: 6000 }
  ];

  var MENU = DEFAULT_MENU.slice();
  var cart = [];
  var cartDel = {};
  var currentCat = 'trasua';
  var orderCode = newOrderCode();
  var isInitialSyncing = false; // Flag to prevent pushing empty cart on initial load

  var CAT_INFO = {
    'topping': {
      title: 'Topping tươi ngon',
      sub: 'Topping được chọn lọc kỹ lưỡng, tươi ngon mỗi ngày'
    },
    'trasua': {
      title: 'Trà sữa đậm vị',
      sub: 'Hương trà mộc đậm đà hòa quyện cùng sữa thơm béo hảo hạng'
    },
    'suatuoi': {
      title: 'Sữa tươi & Latte',
      sub: 'Sữa tươi thanh trùng Đà Lạt nguyên chất thơm ngậy dinh dưỡng'
    },
    'tra': {
      title: 'Trà nguyên chất thanh mát',
      sub: 'Lá trà tươi chọn lọc, ủ lạnh giữ trọn vị thanh tao tự nhiên'
    },
    'traitraicay': {
      title: 'Trà trái cây tươi mát',
      sub: 'Trái cây tự nhiên nhiệt đới ngọt ngào sảng khoái mát lạnh'
    }
  };

  /* ================= 2. QUẢN LÝ IDENTITY NGƯỜI DÙNG ================= */
  var USER_PALETTE = [
    { bg: '#8B5CF6', text: '#FFFFFF', name: 'Tím' },
    { bg: '#2563EB', text: '#FFFFFF', name: 'Xanh dương' },
    { bg: '#059669', text: '#FFFFFF', name: 'Xanh lá' },
    { bg: '#EA580C', text: '#FFFFFF', name: 'Cam' },
    { bg: '#DB2777', text: '#FFFFFF', name: 'Hồng' },
    { bg: '#E11D48', text: '#FFFFFF', name: 'Đỏ san hô' },
    { bg: '#D97706', text: '#FFFFFF', name: 'Vàng hổ phách' },
    { bg: '#0D9488', text: '#FFFFFF', name: 'Teal' },
    { bg: '#4F46E5', text: '#FFFFFF', name: 'Chàm' },
    { bg: '#0891B2', text: '#FFFFFF', name: 'Xanh ngọc' }
  ];

  var FUN_NAMES = [
    'Trùm Trà Sữa', 'Thánh Topping', 'Bé Bụng Bự', 'Mê Trân Châu', 'Hảo Hán Uống Trà',
    'Cao Thủ 100% Đường', 'Chiến Thần Topping', 'Dân Chơi 0% Đá', 'Bé Heo Ú Ụ',
    'Thánh Ăn Vặt', 'Phú Bà Bao Bill', 'Đại Gia Trà Sữa', 'Tiểu Thư Hảo Ngọt',
    'Gấu Trúc Ham Ăn', 'Mèo Lười Uống Trà', 'Ninja Trà Đào', 'Bé Khủng Long',
    'Thần Đồng Hút Trà', 'Chúa Tể Olong', 'Thánh Săn Topping', 'Trùm Cuối Văn Phòng',
    'Bé Thỏ Thèm Trà', 'Bé Corgi Chân Ngắn', 'Thánh Uống Trà Sữa', 'Fan Cứng Ú Ụ',
    'Chúa Tể Sữa Tươi', 'Thợ Săn Khuyến Mãi', 'Bé Bự Đói Bụng', 'Cao Thủ Uống Ké'
  ];
  function getRandomFunName() {
    return FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
  }

  var TOPPING_IMGS = {
    'tp01': 'assets/img/toppings/opt/tc-dua.webp',
    'tp02': 'assets/img/toppings/opt/tc-den.webp',
    'tp03': 'assets/img/toppings/opt/tc-trang.webp',
    'tp04': 'assets/img/toppings/opt/tc-pho-mai.webp',
    'tp05': 'assets/img/toppings/opt/tc-cu-nang.webp',
    'tp06': 'assets/img/toppings/opt/khoai-deo.webp',
    'tp07': 'assets/img/toppings/opt/suong-sao.webp',
    'tp08': 'assets/img/toppings/opt/rau-cau-pho-mai.webp',
    'tp09': 'assets/img/toppings/opt/pudding-socola.webp',
    'tp10': 'assets/img/toppings/opt/pudding-trung.webp',
    'tp11': 'assets/img/toppings/opt/khuc-bach-tang.webp',
    'tp12': 'assets/img/toppings/opt/khuc-bach.webp',
    'tp13': 'assets/img/toppings/opt/khuc-bach-bay-mau.webp',
    'tp14': 'assets/img/toppings/opt/khuc-bach-donut.webp',
    'tp15': 'assets/img/toppings/opt/khuc-bach-chan-meo.webp',
    'tp16': 'assets/img/toppings/opt/khuc-bach-jerry.webp',
    'tp17': 'assets/img/toppings/opt/kem-trung.webp',
    'tp18': 'assets/img/toppings/opt/kem-cheese.webp',
    'tp19': 'assets/img/toppings/opt/khoai-mon-tuoi.webp'
  };

  var PRODUCT_IMGS = {
    'ts01': 'assets/img/products/1._Ú_Ụ_Milk_Tea_20261014152238.jpg',
    'ts02': 'assets/img/products/2._Trà_sữa_truyền_thống_20261014152238.jpg',
    'ts03': 'assets/img/products/3._Trà_sữa_Thái_xanh_20261014152238.jpg',
    'ts04': 'assets/img/products/4._Trà_sữa_Thái_đỏ_20261014152238.jpg',
    'ts05': 'assets/img/products/5._Trà_sữa_khoai_môn_20261014152238.jpg',
    'ts06': 'assets/img/products/6._Trà_sữa_Olong_lài_20261014152238.jpg',
    'ts07': 'assets/img/products/7._Trà_sữa_Chocomint_20261014152238.jpg',
    'ts08': 'assets/img/products/8._Trà_sữa_Socola_20261014152238.jpg',
    'ts09': 'assets/img/products/9._Trà_sữa_gạo_rang_20261014152238.jpg',
    'st01': 'assets/img/products/10._Sữa_tươi_cà_phê_20261014152238.jpg',
    'st02': 'assets/img/products/11._Sữa_tươi_trân_châu_20261014152238.jpg',
    'st03': 'assets/img/products/12._Matcha_latte_20261014152238.jpg',
    'st04': 'assets/img/products/13._Khoai_môn_latte_20261014152238.jpg',
    'st05': 'assets/img/products/14._Cacao_latte_20261014152238.jpg',
    'tr01': 'assets/img/products/15._Hồng_trà_20261014152238.jpg',
    'tr02': 'assets/img/products/16._Hồng_trà_tắc_20261014152238.jpg',
    'tr03': 'assets/img/products/17._Trà_tắc_Thái_xanh_20261014152238.jpg',
    'tr04': 'assets/img/products/18._Lục_trà_lài_20261014152238.jpg',
    'tr05': 'assets/img/products/19._Lục_trà_tắc_20261014152238.jpg',
    'tc01': 'assets/img/products/20._Trà_ổi_hồng_20261014152238.jpg',
    'tc02': 'assets/img/products/21._Trà_đào_20261014152238.jpg',
    'tc03': 'assets/img/products/22._Trà_vải_20261014152238.jpg',
    'tc04': 'assets/img/products/23._Trà_xoài_chanh_dây_20261014152238.jpg',
    'tc05': 'assets/img/products/24._Trà_nhiệt_đới_20261014152238.jpg',
    'tc06': 'assets/img/products/25._Trà_tắc_xí_muội_20261014152238.jpg',
    'tc07': 'assets/img/products/26._Trà_dưa_lưới_v3_20261014152238.jpg',
    'tc08': 'assets/img/products/27._Trà_dâu_v3_20261014152238.jpg',
    'tc09': 'assets/img/products/28._Trà_đắc_thơm_v3_20261014152238.jpg'
  };

  // Quản lý Identity người dùng: Mỗi tab/cửa sổ có danh tính độc lập (kể cả khi duplicate tab)
  var tabSessionId = '';
  try {
    tabSessionId = window.name;
    if (!tabSessionId || !/^uu_tab_/.test(tabSessionId)) {
      tabSessionId = 'uu_tab_' + Math.random().toString(36).slice(2, 8);
      window.name = tabSessionId;
    }
  } catch (e) {
    tabSessionId = 'uu_tab_' + Math.random().toString(36).slice(2, 8);
  }

  var myUid = '';
  try { myUid = sessionStorage.getItem(tabSessionId + '_uid') || ''; } catch (e) {}
  if (!myUid) {
    myUid = 'u_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
    try { sessionStorage.setItem(tabSessionId + '_uid', myUid); } catch (e) {}
  }

  var myUname = '';
  try { myUname = sessionStorage.getItem(tabSessionId + '_uname') || ''; } catch (e) {}
  if (!myUname || /^Bạn #?\d+$/.test(myUname)) {
    myUname = getRandomFunName();
    try { sessionStorage.setItem(tabSessionId + '_uname', myUname); } catch (e) {}
  }

  var myUcolor = '';
  try { myUcolor = sessionStorage.getItem(tabSessionId + '_ucolor') || ''; } catch (e) {}
  if (!myUcolor) {
    myUcolor = USER_PALETTE[Math.floor(Math.random() * USER_PALETTE.length)].bg;
    try { sessionStorage.setItem(tabSessionId + '_ucolor', myUcolor); } catch (e) {}
  }

  function userInitial(name) {
    return (name && name.trim()) ? name.trim().charAt(0).toUpperCase() : '?';
  }

  function updateMyProfileUI() {
    var av = $('myProfileAvatar');
    var nm = $('myProfileName');
    if (av) {
      av.textContent = userInitial(myUname);
      av.style.backgroundColor = myUcolor;
    }
    if (nm) {
      nm.textContent = myUname;
    }
    var prevAv = $('profilePreviewAvatar');
    var prevNm = $('profilePreviewName');
    if (prevAv) {
      prevAv.textContent = userInitial(myUname);
      prevAv.style.backgroundColor = myUcolor;
    }
    if (prevNm) prevNm.textContent = myUname;
  }

  /* ================= 3. UTILITIES & FORMATTING ================= */
  function newOrderCode() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, '0'); }
    return 'UU-' + d.getFullYear().toString().slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }
  function fmt(n) { return (Number(n) || 0).toLocaleString('vi-VN') + 'đ'; }
  function fmtK(n) {
    var v = Number(n) || 0;
    return (v >= 1000 ? (v / 1000).toLocaleString('vi-VN') + 'k' : v + 'đ');
  }
  function parseMoney(v) {
    if (typeof v === 'number') return Math.max(0, Math.round(v));
    var s = String(v == null ? '' : v).replace(/[^\d]/g, '');
    return s ? (parseInt(s, 10) || 0) : 0;
  }
  function formatMoneyStr(n) {
    var num = parseMoney(n);
    return num > 0 ? num.toLocaleString('vi-VN') : '0';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var DEFAULT_API = 'https://script.google.com/macros/s/AKfycby39xudP9BTqvHS4XOmS2zHq78LanddGF_7sqEfGgkoATDpkU9nFlfvGGh-__zbe9E/exec';
  function api() { return ((localStorage.getItem('pos_api') || '').trim() || DEFAULT_API); }

  function showToast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function toppingsList() {
    return MENU.filter(function (m) { return m.nhom === 'topping'; });
  }
  function menuById(id) {
    var f = null;
    MENU.forEach(function (m) { if (m.id === id) f = m; });
    return f;
  }
  function topSum(c) {
    var s = 0;
    (c.toppings || []).forEach(function (t) { s += (t.price || 0) * (t.qty || 1); });
    return s;
  }
  function lineUnit(c) { return (c.price || 0) + topSum(c); }
  function lineTotal(c) { return lineUnit(c) * (c.qty || 1); }

  function topText(c) {
    if (!c.toppings || !c.toppings.length) return '';
    return c.toppings.map(function (t) { return t.name + (t.qty > 1 ? ' x' + t.qty : ''); }).join(', ');
  }

  /* Tùy chọn hiển thị trên 1 dòng đơn (không viết tắt) */
  function shortOptText(c) {
    var p = [];
    if (c.size !== 'TP') {
      if (c.sugar && c.sugar !== '100%') {
        if (c.sugar === 'Không đường') {
          p.push('Không đường');
        } else if (c.sugar.indexOf('đường') !== -1) {
          p.push(c.sugar);
        } else {
          p.push(c.sugar + ' đường');
        }
      }
      if (c.ice && c.ice !== 'Nhiều đá') {
        p.push(c.ice);
      }
    }
    if (c.toppings && c.toppings.length) {
      var tpStr = c.toppings.map(function (t) {
        return t.name + (t.qty > 1 ? ' x' + t.qty : '');
      }).join(', ');
      p.push(tpStr);
    }
    if (c.note) p.push('"' + c.note + '"');
    return p.join(' · ');
  }

  /* Kiểm tra quyền chỉnh sửa dòng */
  function canEditRow(c) {
    return (!c.uid || c.uid === myUid);
  }

  var lidSeq = 0;
  function newLid() {
    return myUid.slice(0, 5) + '-' + (++lidSeq) + '-' + Date.now().toString(36);
  }
  function touch(c) {
    c.rev = (c.rev || 0) + 1;
    c.by = clientId;
  }
  function tomb(c) {
    c.rev = (c.rev || 0) + 1;
    cartDel[c.lid] = { rev: c.rev, by: clientId };
  }
  function normLine(c) {
    c.toppings = c.toppings || [];
    c.owner = c.owner || c.uname || myUname;
    c.uid = c.uid || myUid;
    c.uname = c.uname || c.owner || myUname;
    c.ucolor = c.ucolor || myUcolor;
    c.sugar = c.sugar || '100%';
    c.ice = c.ice || 'Nhiều đá';
    c.note = c.note || '';
    c.qty = Math.max(1, Number(c.qty) || 1);
    if (!c.lid) c.lid = newLid();
    c.rev = c.rev || 1;
    c.by = c.by || clientId;
    return c;
  }

  /* ================= 4. REALTIME COLLABORATION & PRESENCE ================= */
  var clientId = Math.random().toString(36).slice(2);
  var pushTimer = null, applying = false;
  var bc = null, ws = null, wsOk = false, wsRetry = null;
  var BC_ROOM = 'uu-pos-live';
  var FORCE_WS = 'wss://uu-pos-live.tuanlee-tech.workers.dev';

  var F = {};
  var FKEY = { customer: 'customer', channel: 'channel', payMethod: 'pay', discount: 'disc', shipFee: 'ship', orderNote: 'note' };

  /* Theo dõi trạng thái hoạt động của những người trong bill */
  var onlineUsers = {}; // uid -> { uname, ucolor, lastSeen }
  var remoteFocus = {}; // uid -> { lid, action, uname, ucolor, lastSeen }

  function setSyncSt(t) {
    var s = $('syncSt');
    if (s) s.textContent = t || '';
  }

  function wsUrl() {
    var custom = '';
    try { custom = (localStorage.getItem('pos_ws') || '').trim(); } catch (e) {}
    if (custom) return custom;
    if (FORCE_WS) return FORCE_WS;
    try {
      if (location.hostname) return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.hostname + ':8787';
    } catch (e) {}
    return 'ws://localhost:8787';
  }

  function wsEndpoint() {
    var u = wsUrl().replace(/\/$/, '');
    if (/\/bill\//.test(u)) return u;
    return u + '/bill/' + encodeURIComponent(orderCode);
  }

  function liveStatus() {
    var parts = ['Bill ' + orderCode];
    parts.push(wsOk ? 'Nối' : 'Chờ');
    setSyncSt(parts.join(' · '));
    renderPresenceBar();
  }

  function deviceName() {
    return myUname;
  }

  function initFields() {
    var map = {
      customer: $('customer') ? $('customer').value : '',
      channel: $('channel') ? $('channel').value : 'Ship',
      pay: $('payMethod') ? $('payMethod').value : 'Chuyển khoản',
      disc: $('discount') ? parseMoney($('discount').value) : 0,
      ship: $('shipFee') ? parseMoney($('shipFee').value) : 0,
      note: $('orderNote') ? $('orderNote').value : ''
    };
    Object.keys(map).forEach(function (k) {
      if (!F[k]) F[k] = { v: map[k], rev: 0, by: clientId };
    });
  }

  function writeInputs() {
    if ($('customer')) $('customer').value = F.customer.v || '';
    if ($('channel')) $('channel').value = F.channel.v || 'Ship';
    if ($('payMethod')) $('payMethod').value = F.pay.v || 'Chuyển khoản';
    if ($('discount')) $('discount').value = formatMoneyStr(F.disc ? F.disc.v : 0);
    if ($('shipFee')) $('shipFee').value = formatMoneyStr(F.ship ? F.ship.v : 0);
    if ($('orderNote')) $('orderNote').value = F.note.v || '';
  }

  function fieldChanged(inputId) {
    var k = FKEY[inputId];
    var v = $(inputId) ? $(inputId).value : '';
    if (k === 'disc' || k === 'ship') {
      v = parseMoney(v);
    }
    if (F[k] && F[k].v === v) return;
    F[k] = { v: v, rev: (F[k] ? F[k].rev + 1 : 1), by: clientId };
    renderCart();
    schedulePush();
  }

  function snapshot() {
    return { lines: cart, tomb: cartDel, fields: F, by: clientId, dev: deviceName(), ucolor: myUcolor };
  }

  function schedulePush() {
    if (applying || isInitialSyncing) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(rtSend, 200);
  }

  function rtSend() {
    if (applying || isInitialSyncing) return;
    var snap = snapshot();
    var msg = { kind: 'state', bill: orderCode, wrap: snap, from: clientId };
    try { if (bc) bc.postMessage(msg); } catch (e) {}
    if (ws && wsOk) {
      try {
        ws.send(JSON.stringify({ type: 'state', bill: orderCode, wrap: snap, from: clientId }));
      } catch (e) {
        wsOk = false;
        liveStatus();
      }
    }
  }

  function sendPresence(extra) {
    var p = Object.assign({
      type: 'presence',
      kind: 'presence',
      bill: orderCode,
      uid: myUid,
      uname: myUname,
      ucolor: myUcolor,
      from: clientId,
      ts: Date.now()
    }, extra || {});

    try { if (bc) bc.postMessage(p); } catch (e) {}
    if (ws && wsOk) {
      try { ws.send(JSON.stringify(p)); } catch (e) {}
    }
  }

  function onRemotePresence(d) {
    if (!d || d.from === clientId) return;
    var cid = d.from || d.uid;
    if (!cid) return;

    onlineUsers[cid] = {
      cid: cid,
      uid: d.uid || cid,
      uname: d.uname || 'Bạn',
      ucolor: d.ucolor || '#0A7259',
      lastSeen: Date.now()
    };

    if (d.lid !== undefined) {
      var fKey = d.uid || cid;
      if (d.lid) {
        remoteFocus[fKey] = {
          lid: d.lid,
          action: d.action || 'đang chọn',
          uname: d.uname || 'Bạn bè',
          ucolor: d.ucolor || '#3B82F6',
          lastSeen: Date.now()
        };
      } else {
        delete remoteFocus[fKey];
      }
      renderCartFocusIndicators();
    }
    renderPresenceBar();
  }

  function renderPresenceBar() {
    var bar = $('presenceAvatars');
    var txt = $('presenceText');
    if (!bar || !txt) return;

    var now = Date.now();
    var activeList = [];

    // 1. Luôn bao gồm bản thân
    activeList.push({
      cid: clientId,
      uid: myUid,
      uname: myUname,
      ucolor: myUcolor,
      isMe: true
    });

    // 2. Thêm các peer đang active (lastSeen < 8000ms)
    Object.keys(onlineUsers).forEach(function (cid) {
      var u = onlineUsers[cid];
      if (cid !== clientId && (now - (u.lastSeen || 0) < 8000)) {
        activeList.push(u);
      }
    });

    bar.innerHTML = '';
    activeList.slice(0, 5).forEach(function (u) {
      var div = document.createElement('div');
      div.className = 'p-avatar';
      div.style.backgroundColor = u.ucolor;
      div.textContent = userInitial(u.uname);
      div.title = u.uname + (u.isMe ? ' (Bạn)' : '');
      bar.appendChild(div);
    });

    txt.textContent = activeList.length + ' online';
  }

  function onRemote(wrap, from, dev) {
    if (!wrap || from === clientId) return;
    var authorName = (wrap && wrap.dev) || dev || 'Bạn bè';
    var hostVal = ($('customer') ? $('customer').value.trim() : '') || (F.customer && F.customer.v ? F.customer.v.trim() : '');
    if (hostVal && (authorName === 'Đại Gia Trà Sữa' || FUN_NAMES.indexOf(authorName) !== -1 || (wrap && wrap.by && F.customer && F.customer.by === wrap.by))) {
      authorName = hostVal;
    }
    if (from) {
      if (!onlineUsers[from]) {
        onlineUsers[from] = {
          cid: from,
          uid: (wrap && wrap.by) || from,
          uname: authorName,
          ucolor: '#0A7259',
          lastSeen: Date.now()
        };
      } else {
        onlineUsers[from].lastSeen = Date.now();
        if (authorName && authorName !== 'Bạn bè') onlineUsers[from].uname = authorName;
      }
      renderPresenceBar();
    }
    var m = mergeWrap(wrap);
    if (m.changed) {
      applying = true;
      try {
        writeInputs();
        renderCart();
      } finally {
        applying = false;
      }
      var latestHost = ($('customer') ? $('customer').value.trim() : '') || (F.customer && F.customer.v ? F.customer.v.trim() : '');
      var sender = m.dev || dev || authorName || 'bạn bè';
      if (latestHost && (sender === 'Đại Gia Trà Sữa' || FUN_NAMES.indexOf(sender) !== -1 || (wrap && wrap.by && F.customer && F.customer.by === wrap.by))) {
        sender = latestHost;
      }
      setSyncSt('Cập nhật từ ' + sender);
      if (m.needsPush) schedulePush();
    }
    sendPresence({ active: true });
  }

  function mergeWrap(wrap) {
    var changed = false, needsPush = false, dev = '';
    var lines, tomb, fields;
    if (wrap && wrap.lines) {
      lines = wrap.lines; tomb = wrap.tomb || {}; fields = wrap.fields || {};
      dev = wrap.dev || '';
    } else return { changed: false, needsPush: false, dev: '' };

    Object.keys(tomb).forEach(function (lid) {
      var r = tomb[lid];
      var rr = (r && r.rev) || 0;
      if (!cartDel[lid] || rr > cartDel[lid].rev) {
        cartDel[lid] = { rev: rr, by: (r && r.by) || '' };
        changed = true;
      }
    });

    cart = cart.filter(function (c) {
      var t = cartDel[c.lid];
      if (t && t.rev >= (c.rev || 0)) { changed = true; return false; }
      return true;
    });

    var local = {};
    cart.forEach(function (c) { local[c.lid] = c; });

    lines.forEach(function (rc) {
      normLine(rc);
      var lc = local[rc.lid];
      var t = cartDel[rc.lid];
      if (t && t.rev >= (rc.rev || 0)) return;
      if (!lc) {
        cart.push(rc); local[rc.lid] = rc; changed = true; needsPush = true;
      } else if ((rc.rev || 0) > (lc.rev || 0) || ((rc.rev || 0) === (lc.rev || 0) && (rc.by || '') > (lc.by || ''))) {
        var i = cart.indexOf(lc);
        cart[i] = rc; local[rc.lid] = rc; changed = true;
      }
    });

    Object.keys(fields).forEach(function (k) {
      var r = fields[k];
      if (!r) return;
      var l = F[k];
      if (!l || (r.rev || 0) > (l.rev || 0) || ((r.rev || 0) === (l.rev || 0) && (r.by || '') > (l.by || ''))) {
        F[k] = { v: r.v, rev: r.rev || 0, by: r.by || '' };
        changed = true;
      } else if (l && (l.rev || 0) > (r.rev || 0)) {
        needsPush = true;
      }
    });

    var remoteIds = {};
    lines.forEach(function (rc) { remoteIds[rc.lid] = true; });
    cart.forEach(function (c) {
      if (!remoteIds[c.lid] && !(cartDel[c.lid] && cartDel[c.lid].rev >= (c.rev || 0))) needsPush = true;
    });

    return { changed: changed, needsPush: needsPush, dev: dev };
  }

  function wsConnect() {
    var u = wsEndpoint();
    if (!u) { wsOk = false; liveStatus(); return; }
    try { if (ws) ws.close(); } catch (e) {}
    var s = null;
    try { s = new WebSocket(u); } catch (e) { wsOk = false; liveStatus(); return; }
    ws = s;

    s.onopen = function () {
      wsOk = true;
      liveStatus();
      try {
        s.send(JSON.stringify({
          type: 'hello',
          bill: orderCode,
          from: clientId,
          dev: deviceName(),
          uid: myUid,
          uname: myUname,
          ucolor: myUcolor
        }));
      } catch (e) {}
      sendPresence({ active: true });
    };

    s.onmessage = function (ev) {
      var d = null;
      try { d = JSON.parse(ev.data); } catch (e) { return; }
      if (!d || d.bill !== orderCode || d.from === clientId) return;

      if (d.type === 'state' && d.wrap) {
        isInitialSyncing = false;
        onRemote(d.wrap, d.from);
      } else if (d.type === 'peer_joined') {
        var cid = d.from || d.uid;
        if (cid && cid !== clientId) {
          onlineUsers[cid] = {
            cid: cid,
            uid: d.uid || cid,
            uname: d.uname || d.dev || 'Bạn',
            ucolor: d.ucolor || '#0A7259',
            lastSeen: Date.now()
          };
          renderPresenceBar();
        }
        // Phản hồi presence lập tức cho peer mới
        sendPresence({ active: true, reply: true });
        // Có người mới vào bill chung -> lập tức gửi snapshot hiện tại cho họ nếu cart có món
        if (cart.length > 0) {
          try {
            ws.send(JSON.stringify({ type: 'state', bill: orderCode, wrap: snapshot(), from: clientId }));
          } catch (e) {}
        }
      } else if (d.type === 'presence_list' && d.users) {
        var now = Date.now();
        Object.keys(d.users).forEach(function (cid) {
          var u = d.users[cid];
          if (cid !== clientId && (now - (u.lastSeen || 0) < 12000)) {
            onlineUsers[cid] = {
              cid: cid,
              uid: u.uid || cid,
              uname: u.uname || 'Bạn',
              ucolor: u.ucolor || '#0A7259',
              lastSeen: u.lastSeen || now
            };
          }
        });
        renderPresenceBar();
      } else if (d.type === 'peer_left') {
        var lcid = d.from || d.uid;
        if (lcid && onlineUsers[lcid]) delete onlineUsers[lcid];
        if (d.uid) {
          Object.keys(onlineUsers).forEach(function (k) {
            if (onlineUsers[k].uid === d.uid && (k === d.from || !d.from)) {
              delete onlineUsers[k];
            }
          });
          delete remoteFocus[d.uid];
        }
        renderCartFocusIndicators();
        renderPresenceBar();
      } else if (d.type === 'presence') {
        onRemotePresence(d);
      } else if (d.type === 'reset') {
        cart = [];
        cartDel = {};
        renderCart();
        showToast('Bill đã được làm mới');
      }
    };

    s.onclose = function () {
      wsOk = false;
      liveStatus();
      clearTimeout(wsRetry);
      wsRetry = setTimeout(wsConnect, 4000);
    };

    s.onerror = function () {
      try { s.close(); } catch (e) {}
    };
  }

  function setupLive() {
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel(BC_ROOM);
        bc.onmessage = function (ev) {
          var d = ev.data || {};
          if (d.bill !== orderCode || d.from === clientId) return;
          if (d.kind === 'hello') {
            var cid = d.from || d.uid;
            if (cid && cid !== clientId) {
              onlineUsers[cid] = {
                cid: cid,
                uid: d.uid || cid,
                uname: d.uname || d.dev || 'Bạn',
                ucolor: d.ucolor || '#0A7259',
                lastSeen: Date.now()
              };
              renderPresenceBar();
            }
            sendPresence({ active: true, reply: true });
            if (cart.length > 0) schedulePush();
          } else if (d.kind === 'state' && d.wrap) {
            isInitialSyncing = false;
            onRemote(d.wrap, d.from);
          } else if (d.kind === 'presence') {
            onRemotePresence(d);
          } else if (d.kind === 'peer_left') {
            var lcid = d.from || d.uid;
            if (lcid && onlineUsers[lcid]) delete onlineUsers[lcid];
            if (d.uid) {
              Object.keys(onlineUsers).forEach(function (k) {
                if (onlineUsers[k].uid === d.uid && (k === d.from || !d.from)) {
                  delete onlineUsers[k];
                }
              });
              delete remoteFocus[d.uid];
            }
            renderCartFocusIndicators();
            renderPresenceBar();
          }
        };
      } catch (e) { bc = null; }
    }
    wsConnect();
    try {
      bc && bc.postMessage({
        kind: 'hello',
        bill: orderCode,
        from: clientId,
        dev: deviceName(),
        uid: myUid,
        uname: myUname,
        ucolor: myUcolor
      });
    } catch (e) {}
    sendPresence({ active: true });
    liveStatus();

    window.addEventListener('beforeunload', function () {
      try {
        if (bc) bc.postMessage({ kind: 'peer_left', bill: orderCode, uid: myUid, from: clientId });
        if (ws && wsOk) ws.send(JSON.stringify({ type: 'peer_left', bill: orderCode, uid: myUid, from: clientId }));
      } catch (e) {}
    });

    // Heartbeat định kỳ 2s gửi presence báo online
    setInterval(function () {
      sendPresence({ active: true });
      // Prune remote focus
      var now = Date.now();
      var focusChanged = false;
      Object.keys(remoteFocus).forEach(function (u) {
        if (now - remoteFocus[u].lastSeen > 3500) {
          delete remoteFocus[u];
          focusChanged = true;
        }
      });
      if (focusChanged) renderCartFocusIndicators();
      renderPresenceBar();
    }, 2000);
  }

  /* ================= 5. RENDER MENU ================= */
  function drinkIcon(nhom) {
    if (nhom === 'trasua') return '🧋';
    if (nhom === 'suatuoi') return '🥛';
    if (nhom === 'tra') return '🍃';
    if (nhom === 'traitraicay') return '🍊';
    return '✨';
  }

  function renderMenu() {
    var q = ($('search') ? $('search').value : '').toLowerCase().trim();
    var grid = $('productGrid');
    if (!grid) return;
    grid.innerHTML = '';

    var filtered = MENU.filter(function (m) {
      if (m.nhom !== currentCat) return false;
      if (q && m.ten.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });

    if ($('currentCatTitle')) $('currentCatTitle').textContent = (CAT_INFO[currentCat] && CAT_INFO[currentCat].title) || 'Danh sách món';
    if ($('currentCatSub')) $('currentCatSub').textContent = (CAT_INFO[currentCat] && CAT_INFO[currentCat].sub) || '';
    if ($('currentCatCount')) $('currentCatCount').textContent = filtered.length + ' món';

    filtered.forEach(function (m) {
      var card = document.createElement('div');
      var isTopping = (m.nhom === 'topping');
      card.className = 'product-card' + (isTopping ? ' pcard-topping' : '');

      var imgUrl = isTopping ? (TOPPING_IMGS[m.id] || 'assets/img/opt/logo.webp') : (PRODUCT_IMGS[m.id] || 'assets/img/opt/logo.webp');
      var priceHtml = isTopping ?
        (fmt(m.gia) + (m.note ? ' <span class="subnote">(' + esc(m.note) + ')</span>' : '')) :
        ('M ' + fmtK(m.giaM) + ' · L ' + fmtK(m.giaL) + (m.note ? ' <span class="subnote">(' + esc(m.note) + ')</span>' : ''));
      var btnLabel = isTopping ? '+ Thêm món' : '+ Chọn món';

      card.innerHTML =
        '<div class="pcard-img-wrap">' +
          '<img src="' + imgUrl + '" alt="' + esc(m.ten) + '" loading="lazy" onerror="this.onerror=null;this.src=\'assets/img/opt/logo.webp\'">' +
        '</div>' +
        '<div class="pcard-info">' +
          '<h4>' + esc(m.ten) + '</h4>' +
          '<div class="price-tag">' + priceHtml + '</div>' +
          '<button class="btn-choose" type="button">' + btnLabel + '</button>' +
        '</div>';

      card.onclick = function () {
        openItemCustomizer(m, null, isTopping);
      };
      grid.appendChild(card);
    });

    if (!grid.children.length) {
      grid.innerHTML = '<p class="cart-empty-hint">Không thấy món nào khớp từ khóa "' + esc(q) + '".</p>';
    }
  }

  /* ================= 6. MODAL TÙY CHỌN MÓN (CUSTOMIZER) ================= */
  var curCustomItem = null; // item đang tạo mới
  var curEditingLine = null; // line trong cart đang sửa (nếu có)
  var curSelectedSize = 'M';
  var curSelectedSugar = '100%';
  var curSelectedIce = 'Nhiều đá';
  var curSelectedToppings = []; // [{id, name, price, qty}]

  function openItemCustomizer(menuItem, cartLine, isToppingOnly) {
    curCustomItem = menuItem;
    curEditingLine = cartLine || null;

    var modal = $('itemModal');
    var title = $('modalDrinkName');
    var sub = $('modalDrinkSub');
    var drinker = $('custDrinkerName');
    var note = $('custItemNote');
    var btnConfirm = $('btnConfirmItem');

    if (!modal) return;

    title.textContent = (menuItem ? menuItem.ten : (cartLine ? cartLine.name : 'Tùy chọn'));
    sub.textContent = cartLine ? 'Chỉnh sửa ly của bạn' : 'Tùy chọn ly của bạn';

    // Default or existing values
    if (cartLine) {
      curSelectedSize = cartLine.size || 'M';
      curSelectedSugar = cartLine.sugar || '100%';
      curSelectedIce = cartLine.ice || 'Nhiều đá';
      curSelectedToppings = (cartLine.toppings || []).map(function (t) { return Object.assign({}, t); });
      drinker.value = cartLine.uname || cartLine.owner || myUname;
      note.value = cartLine.note || '';
      btnConfirm.textContent = 'Cập nhật ly này';
      // Broadcast presence focus
      sendPresence({ lid: cartLine.lid, action: 'sửa ly' });
    } else {
      curSelectedSize = isToppingOnly ? 'TP' : 'M';
      curSelectedSugar = '100%';
      curSelectedIce = 'Nhiều đá';
      curSelectedToppings = [];
      drinker.value = myUname;
      note.value = '';
      btnConfirm.textContent = 'Thêm vào bill nhóm';
      // Broadcast presence focus
      sendPresence({ lid: 'new', action: 'chọn ' + (menuItem ? menuItem.ten : 'món') });
    }

    // Hide size/sugar/ice if topping only
    var secSize = $('custSizeSection');
    var secSugar = $('custSugarSection');
    var secIce = $('custIceSection');

    if (isToppingOnly || (menuItem && menuItem.nhom === 'topping') || (cartLine && cartLine.size === 'TP')) {
      if (secSize) secSize.style.display = 'none';
      if (secSugar) secSugar.style.display = 'none';
      if (secIce) secIce.style.display = 'none';
    } else {
      if (secSize) secSize.style.display = 'block';
      if (secSugar) secSugar.style.display = 'block';
      if (secIce) secIce.style.display = 'block';
    }

    // Size buttons
    if (menuItem && menuItem.nhom !== 'topping') {
      var bm = $('btnSizeM');
      var bl = $('btnSizeL');
      if (bm) {
        bm.textContent = 'Size M · ' + fmtK(menuItem.giaM);
        bm.classList.toggle('is-active', curSelectedSize === 'M');
      }
      if (bl) {
        bl.textContent = 'Size L · ' + fmtK(menuItem.giaL);
        bl.classList.toggle('is-active', curSelectedSize === 'L');
      }
    }

    // Sugar chips
    document.querySelectorAll('#custSugarGroup .chip-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.sugar === curSelectedSugar);
    });

    // Ice chips
    document.querySelectorAll('#custIceGroup .chip-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.ice === curSelectedIce);
    });

    // Render Toppings
    renderCustomizerToppings();
    updateCustomizerPrice();

    modal.hidden = false;
  }

  function renderCustomizerToppings() {
    var grid = $('custToppingsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    toppingsList().forEach(function (tp) {
      var found = null;
      curSelectedToppings.forEach(function (t) { if (t.id === tp.id) found = t; });

      var div = document.createElement('div');
      div.className = 'top-chip-card' + (found ? ' is-selected' : '');
      var topImg = TOPPING_IMGS[tp.id] || 'assets/img/opt/logo.webp';

      div.innerHTML =
        '<img class="top-chip-thumb" src="' + topImg + '" alt="' + esc(tp.ten) + '" loading="lazy">' +
        '<div class="top-name-price">' +
          '<b>' + esc(tp.ten) + '</b>' +
          '<span>+' + fmtK(tp.gia) + '</span>' +
        '</div>' +
        '<div class="top-stepper">' +
          (found ? '<button type="button" class="btn-dec">−</button><span>' + found.qty + '</span>' : '') +
          '<button type="button" class="btn-inc">+</button>' +
        '</div>';

      var btnInc = div.querySelector('.btn-inc');
      var btnDec = div.querySelector('.btn-dec');

      btnInc.onclick = function (e) {
        e.stopPropagation();
        if (!found) {
          found = { id: tp.id, name: tp.ten, price: tp.gia, qty: 1 };
          curSelectedToppings.push(found);
        } else {
          found.qty++;
        }
        sendPresence({ lid: curEditingLine ? curEditingLine.lid : 'new', action: 'chọn topping' });
        renderCustomizerToppings();
        updateCustomizerPrice();
      };

      if (btnDec) {
        btnDec.onclick = function (e) {
          e.stopPropagation();
          if (found) {
            found.qty--;
            if (found.qty <= 0) {
              curSelectedToppings = curSelectedToppings.filter(function (t) { return t.id !== tp.id; });
            }
          }
          sendPresence({ lid: curEditingLine ? curEditingLine.lid : 'new', action: 'chọn topping' });
          renderCustomizerToppings();
          updateCustomizerPrice();
        };
      }

      grid.appendChild(div);
    });
  }

  function updateCustomizerPrice() {
    var basePrice = 0;
    if (curCustomItem) {
      if (curCustomItem.nhom === 'topping') basePrice = curCustomItem.gia;
      else basePrice = (curSelectedSize === 'L') ? curCustomItem.giaL : curCustomItem.giaM;
    } else if (curEditingLine) {
      var m = menuById(curEditingLine.id);
      if (m && m.nhom !== 'topping') {
        basePrice = (curSelectedSize === 'L') ? m.giaL : m.giaM;
      } else {
        basePrice = curEditingLine.price;
      }
    }
    var topSumVal = 0;
    curSelectedToppings.forEach(function (t) { topSumVal += (t.price || 0) * (t.qty || 1); });
    var total = basePrice + topSumVal;

    var elPrice = $('modalItemPrice');
    if (elPrice) elPrice.textContent = fmt(total);
  }

  function closeItemCustomizer() {
    var modal = $('itemModal');
    if (modal) modal.hidden = true;
    sendPresence({ lid: null, action: null });
    curCustomItem = null;
    curEditingLine = null;
  }

  /* ================= 7. RENDER CART (10-ITEM SINGLE-LINE VIEWPORT) ================= */
  function totals() {
    var sub = 0;
    var totalCups = 0;
    cart.forEach(function (c) {
      sub += lineTotal(c);
      if (c.size !== 'TP') totalCups += (c.qty || 1);
    });
    var disc = Math.max(0, parseMoney($('discount') ? $('discount').value : 0));
    var ship = Math.max(0, parseMoney($('shipFee') ? $('shipFee').value : 0));
    return {
      sub: sub,
      disc: disc,
      ship: ship,
      grand: Math.max(0, sub - disc + ship),
      totalCups: totalCups
    };
  }

  function renderCart() {
    var ul = $('cartItems');
    if (!ul) return;
    ul.innerHTML = '';

    cart.forEach(function (c, idx) {
      normLine(c);
      var li = document.createElement('li');
      li.className = 'c-row';
      li.dataset.lid = c.lid;

      var isMine = canEditRow(c);
      var shortOpt = shortOptText(c);
      var ucol = (c.uid === myUid ? myUcolor : (c.ucolor || '#0A7259'));

      // 0. Border highlight & clean row style
      li.style.borderLeft = '3.5px solid ' + ucol;
      li.style.background = '#FFFFFF';

      // 1. Cột Món & Tùy chọn (Gộp chung Badge người đặt + Tên món + Tùy chọn trên 1 dòng full width)
      var itemCol = document.createElement('div');
      itemCol.className = 'c-item-col';

      var badge = document.createElement('span');
      badge.className = 'c-badge';
      badge.style.backgroundColor = ucol + '18';
      badge.style.color = ucol;
      badge.style.border = '1.5px solid ' + ucol;
      badge.style.boxShadow = '0 1px 3px ' + ucol + '25';
      badge.textContent = c.uname || c.owner || 'Khách';
      badge.title = 'Ly của ' + (c.uname || c.owner || 'Khách') + (isMine ? ' (Bạn)' : '');
      itemCol.appendChild(badge);

      var desc = document.createElement('div');
      desc.className = 'c-desc';
      desc.title = c.name + (c.size !== 'TP' ? ' (' + c.size + ')' : '') + (shortOpt ? ' · ' + shortOpt : '');
      desc.innerHTML =
        '<strong class="c-name">' + esc(c.name) + '</strong>' +
        (c.size !== 'TP' ? '<span class="c-sz">(' + esc(c.size) + ')</span>' : '') +
        (shortOpt ? '<span class="c-opts">· ' + esc(shortOpt) + '</span>' : '');

      itemCol.appendChild(desc);

      if (isMine) {
        itemCol.onclick = function () {
          var m = menuById(c.id);
          openItemCustomizer(m, c, c.size === 'TP');
        };
      }
      li.appendChild(itemCol);

      // 3. Số lượng (+ / - hoặc khóa)
      var qtyCol = document.createElement('div');
      qtyCol.className = 'c-qty';
      if (isMine) {
        var bm = document.createElement('button');
        bm.className = 'c-qbtn';
        bm.textContent = '−';
        bm.title = 'Giảm số lượng';
        bm.onclick = function (e) {
          e.stopPropagation();
          c.qty--;
          if (c.qty <= 0) {
            tomb(c);
            cart.splice(idx, 1);
          } else {
            touch(c);
          }
          renderCart();
        };

        var qval = document.createElement('span');
        qval.className = 'c-qval';
        qval.textContent = c.qty;

        var bp = document.createElement('button');
        bp.className = 'c-qbtn';
        bp.textContent = '+';
        bp.title = 'Tăng số lượng';
        bp.onclick = function (e) {
          e.stopPropagation();
          c.qty++;
          touch(c);
          renderCart();
        };

        qtyCol.appendChild(bm);
        qtyCol.appendChild(qval);
        qtyCol.appendChild(bp);
      } else {
        var locked = document.createElement('span');
        locked.className = 'c-qlocked';
        locked.title = 'Chỉ ' + (c.uname || 'chủ ly') + ' mới có quyền sửa';
        locked.textContent = '🔒 ' + c.qty + 'x';
        qtyCol.appendChild(locked);
      }
      li.appendChild(qtyCol);

      // 4. Thành tiền
      var priceCol = document.createElement('span');
      priceCol.className = 'c-price';
      priceCol.textContent = fmtK(lineTotal(c));
      li.appendChild(priceCol);

      // 5. Thao tác (Sửa / Xóa hoặc Khóa)
      var actCol = document.createElement('div');
      actCol.className = 'c-acts';
      if (isMine) {
        var btnEdit = document.createElement('button');
        btnEdit.className = 'c-abtn edit';
        btnEdit.title = 'Tùy chọn ly này';
        btnEdit.innerHTML = '✏️';
        btnEdit.onclick = function (e) {
          e.stopPropagation();
          var m = menuById(c.id);
          openItemCustomizer(m, c, c.size === 'TP');
        };

        var btnDel = document.createElement('button');
        btnDel.className = 'c-abtn del';
        btnDel.title = 'Xóa ly này khỏi bill';
        btnDel.innerHTML = '✕';
        btnDel.onclick = function (e) {
          e.stopPropagation();
          tomb(c);
          cart.splice(idx, 1);
          renderCart();
        };

        actCol.appendChild(btnEdit);
        actCol.appendChild(btnDel);
      } else {
        var iconLock = document.createElement('span');
        iconLock.className = 'c-lock-icon';
        iconLock.title = 'Chỉ ' + (c.uname || 'chủ ly') + ' mới có quyền sửa';
        iconLock.textContent = '🔒';
        actCol.appendChild(iconLock);
      }
      li.appendChild(actCol);

      ul.appendChild(li);
    });

    if (!cart.length) {
      ul.innerHTML = '<li class="cart-empty-hint">Chưa có ly nào.<br>Bấm chọn món bên menu để cùng đặt!</li>';
    }

    var t = totals();
    if ($('subTotal')) $('subTotal').textContent = fmt(t.sub);
    if ($('discountVal')) $('discountVal').textContent = t.disc ? '−' + fmt(t.disc) : '0đ';
    if ($('shipFeeVal')) $('shipFeeVal').textContent = t.ship ? '+' + fmt(t.ship) : '0đ';
    if ($('adjTotal')) $('adjTotal').textContent = (t.disc ? '−' + fmtK(t.disc) : '0k') + ' + ' + fmtK(t.ship);
    if ($('grandTotal')) $('grandTotal').textContent = fmt(t.grand);
    if ($('cupCountBadge')) $('cupCountBadge').textContent = t.totalCups + ' ly';

    // Cập nhật thanh Mobile bar
    if ($('mobileCartTotal')) $('mobileCartTotal').textContent = fmt(t.grand);
    if ($('mobileCartCount')) $('mobileCartCount').textContent = t.totalCups + ' ly';

    if ($('orderCode')) $('orderCode').textContent = orderCode;

    renderCartFocusIndicators();
    schedulePush();
  }

  function renderCartFocusIndicators() {
    var rows = document.querySelectorAll('.c-row');
    rows.forEach(function (row) {
      var lid = row.dataset.lid;
      var peerFound = null;
      Object.keys(remoteFocus).forEach(function (u) {
        if (remoteFocus[u].lid === lid && u !== myUid) {
          peerFound = remoteFocus[u];
        }
      });

      var oldPill = row.querySelector('.peer-focus-pill');
      if (oldPill) oldPill.remove();

      if (peerFound) {
        row.classList.add('is-peer-focused');
        row.style.setProperty('--peer-color', peerFound.ucolor || '#3B82F6');
        var pill = document.createElement('span');
        pill.className = 'peer-focus-pill';
        pill.style.backgroundColor = peerFound.ucolor || '#3B82F6';
        pill.textContent = '● ' + peerFound.uname + ' đang ' + peerFound.action + '...';
        row.appendChild(pill);
      } else {
        row.classList.remove('is-peer-focused');
        row.style.removeProperty('--peer-color');
      }
    });
  }

  /* ================= 8. HTML5 CANVAS BILL GENERATOR & BILL SPLITTER ================= */
  function exportCanvasBill() {
    if (!cart.length) {
      showToast('Hóa đơn trống, hãy chọn món trước!');
      return;
    }

    var canvas = $('billCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var t = totals();
    var hostName = ($('customer') ? $('customer').value.trim() : '') ||
                   (F.customer && F.customer.v ? F.customer.v.trim() : '') ||
                   myUname ||
                   'Host';
    var noteVal = ($('orderNote') ? $('orderNote').value.trim() : '');

    // Tính tiền theo từng bạn
    var personMap = {};
    cart.forEach(function (c) {
      var name = c.uname || c.owner || 'Bạn';
      var ucol = (c.uid === myUid ? myUcolor : (c.ucolor || '#0A7259'));
      if (!personMap[name]) {
        personMap[name] = {
          name: name,
          ucolor: ucol,
          cups: 0,
          drinkSub: 0
        };
      }
      var total = lineTotal(c);
      personMap[name].drinkSub += total;
      if (c.size !== 'TP') personMap[name].cups += (c.qty || 1);
    });

    var people = Object.keys(personMap).map(function (k) { return personMap[k]; });
    var netAdj = t.ship - t.disc; // Chênh lệch ship và giảm giá

    // Layout Dimensions (Logical pixels)
    var W = 660;
    var pad = 24;
    var scale = 2; // High-DPI sharpness

    var headerH = 100;
    var tableHeadH = 26;
    var itemH = 26;
    var itemsTotalH = cart.length * itemH;
    var totalsH = 20 + 20 + (t.disc > 0 ? 20 : 0) + (t.ship > 0 ? 20 : 0) + 26;
    var splitHeadH = 34;
    var splitItemH = 25;
    var splitTotalH = people.length * splitItemH;
    var footerH = 46;

    var totalH = headerH + tableHeadH + itemsTotalH + totalsH + splitHeadH + splitTotalH + footerH + (noteVal ? 24 : 0);

    // Setup Canvas Resolution
    canvas.width = W * scale;
    canvas.height = totalH * scale;
    canvas.style.width = W + 'px';
    canvas.style.height = totalH + 'px';

    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, totalH);

    // Card border
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, W - 2, totalH - 2);

    // TOP HEADER
    var curY = 32;
    ctx.fillStyle = '#0A7259';
    ctx.font = '800 18px ' + window.getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'left';
    ctx.fillText('🧋 Ú Ụ MILK TEA · ĐƠN ĐẶT CHUNG', pad, curY);

    curY += 20;
    ctx.fillStyle = '#64748B';
    ctx.font = '600 12px ' + window.getComputedStyle(document.body).fontFamily;
    var nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
    ctx.fillText('Mã: ' + orderCode + ' · ' + nowStr, pad, curY);

    curY += 19;
    ctx.fillStyle = '#1E293B';
    ctx.font = '700 12px ' + window.getComputedStyle(document.body).fontFamily;
    ctx.fillText('Đại diện: ' + hostName + ' · Tổng: ' + t.totalCups + ' ly', pad, curY);

    curY += 14;
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, curY);
    ctx.lineTo(W - pad, curY);
    ctx.stroke();

    // TABLE HEADER (Merged Author & Item)
    curY += 18;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '800 11px ' + window.getComputedStyle(document.body).fontFamily;
    ctx.fillText('MÓN & TÙY CHỌN (KÈM NGƯỜI ĐẶT)', pad, curY);
    ctx.textAlign = 'center';
    ctx.fillText('SL', W - pad - 80, curY);
    ctx.textAlign = 'right';
    ctx.fillText('THÀNH TIỀN', W - pad, curY);

    // ITEMS ROWS (Single horizontal line per item)
    curY += 8;
    cart.forEach(function (c) {
      curY += itemH;

      var authorName = c.uname || c.owner || 'Khách';
      var ucol = (c.uid === myUid ? myUcolor : (c.ucolor || '#0A7259'));

      ctx.font = '800 10px ' + window.getComputedStyle(document.body).fontFamily;
      var nameMeasure = ctx.measureText(authorName).width;
      var badgeW = Math.min(105, nameMeasure + 14);

      // Highlight left bar
      ctx.fillStyle = ucol;
      ctx.fillRect(pad - 6, curY - 14, 3.5, 18);

      // Author Badge
      ctx.fillStyle = ucol;
      drawRoundedRect(ctx, pad, curY - 14, badgeW, 18, 5, true, false);

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      var fitAuthor = fitText(ctx, authorName, badgeW - 6);
      ctx.fillText(fitAuthor, pad + (badgeW / 2), curY - 1);

      // Item Name & Options start immediately right after author badge
      var itemStartX = pad + badgeW + 8;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F172A';
      ctx.font = '700 12px ' + window.getComputedStyle(document.body).fontFamily;
      var itemName = c.name + (c.size !== 'TP' ? ' (' + c.size + ')' : '');
      ctx.fillText(itemName, itemStartX, curY);

      var nameW = ctx.measureText(itemName).width;
      var sOpt = shortOptText(c);
      if (sOpt) {
        ctx.fillStyle = '#64748B';
        ctx.font = '500 11px ' + window.getComputedStyle(document.body).fontFamily;
        var maxOptW = (W - pad - 95) - (itemStartX + nameW + 8);
        var optDisplay = fitText(ctx, '· ' + sOpt, maxOptW);
        ctx.fillText(optDisplay, itemStartX + nameW + 6, curY);
      }

      // SL
      ctx.textAlign = 'center';
      ctx.fillStyle = '#334155';
      ctx.font = '700 12px ' + window.getComputedStyle(document.body).fontFamily;
      ctx.fillText(String(c.qty), W - pad - 80, curY);

      // Thành tiền
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0A7259';
      ctx.font = '700 12px ' + window.getComputedStyle(document.body).fontFamily;
      ctx.fillText(fmt(lineTotal(c)), W - pad, curY);
    });

    // TOTALS SECTION
    curY += 16;
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, curY);
    ctx.lineTo(W - pad, curY);
    ctx.stroke();

    curY += 18;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = '600 12px ' + window.getComputedStyle(document.body).fontFamily;
    ctx.fillText('Tạm tính:', pad, curY);
    ctx.textAlign = 'right';
    ctx.fillText(fmt(t.sub), W - pad, curY);

    if (t.disc > 0) {
      curY += 20;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#DC2626';
      ctx.font = '600 12px ' + window.getComputedStyle(document.body).fontFamily;
      ctx.fillText('Giảm giá:', pad, curY);
      ctx.textAlign = 'right';
      ctx.fillText('−' + fmt(t.disc), W - pad, curY);
    }

    if (t.ship > 0) {
      curY += 20;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#D97706';
      ctx.font = '600 12px ' + window.getComputedStyle(document.body).fontFamily;
      ctx.fillText('Phí ship:', pad, curY);
      ctx.textAlign = 'right';
      ctx.fillText('+' + fmt(t.ship), W - pad, curY);
    }

    curY += 24;
    ctx.fillStyle = '#0A7259';
    ctx.font = '800 15px ' + window.getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'left';
    ctx.fillText('TỔNG THANH TOÁN:', pad, curY);
    ctx.textAlign = 'right';
    ctx.fillText(fmt(t.grand), W - pad, curY);

    if (noteVal) {
      curY += 20;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = 'italic 500 11.5px ' + window.getComputedStyle(document.body).fontFamily;
      ctx.fillText('Ghi chú: ' + noteVal, pad, curY);
    }

    // SPLIT BILL SECTION (Chia tiền từng bạn)
    curY += 24;
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(pad - 8, curY - 14, W - (pad * 2) + 16, splitHeadH + splitTotalH + 4);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(pad - 8, curY - 14, W - (pad * 2) + 16, splitHeadH + splitTotalH + 4);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#D97706';
    ctx.font = '800 12px ' + window.getComputedStyle(document.body).fontFamily;
    ctx.fillText('💰 BẢNG CHIA TIỀN TỪNG BẠN:', pad, curY);

    curY += 8;
    people.forEach(function (p) {
      curY += splitItemH;

      // Tỷ lệ phân bổ ship/giảm giá theo giá trị món
      var share = (t.sub > 0) ? Math.round(netAdj * (p.drinkSub / t.sub)) : 0;
      var finalPay = Math.max(0, p.drinkSub + share);

      ctx.fillStyle = '#1E293B';
      ctx.font = '700 12px ' + window.getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'left';
      ctx.fillText('● ' + p.name + ' (' + p.cups + ' ly): ' + fmt(p.drinkSub), pad, curY);

      var adjStr = '';
      if (share > 0) adjStr = ' (+ship ' + fmt(share) + ')';
      else if (share < 0) adjStr = ' (-giảm ' + fmt(Math.abs(share)) + ')';

      if (adjStr) {
        var preW = ctx.measureText('● ' + p.name + ' (' + p.cups + ' ly): ' + fmt(p.drinkSub)).width;
        ctx.fillStyle = '#64748B';
        ctx.font = '500 11px ' + window.getComputedStyle(document.body).fontFamily;
        ctx.fillText(adjStr, pad + preW, curY);
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0A7259';
      ctx.font = '800 12.5px ' + window.getComputedStyle(document.body).fontFamily;
      ctx.fillText('👉 CẦN TRẢ: ' + fmt(finalPay), W - pad, curY);
    });

    // FOOTER (Chuyển khoản cho [Host] theo bill trên - Host in đậm nổi bật)
    curY += 34;
    var fontFam = window.getComputedStyle(document.body).fontFamily;
    var preTxt = 'Chuyển khoản cho ';
    var postTxt = ' theo bill trên · Chúc bạn ngon miệng! 🧋';

    ctx.font = '500 11.5px ' + fontFam;
    var wPre = ctx.measureText(preTxt).width;
    var wPost = ctx.measureText(postTxt).width;

    ctx.font = '800 12.5px ' + fontFam;
    var wHost = ctx.measureText(hostName).width;

    var totalW = wPre + wHost + wPost;
    var startX = (W - totalW) / 2;

    ctx.textAlign = 'left';

    ctx.font = '500 11.5px ' + fontFam;
    ctx.fillStyle = '#64748B';
    ctx.fillText(preTxt, startX, curY);

    ctx.font = '800 12.5px ' + fontFam;
    ctx.fillStyle = '#0A7259';
    ctx.fillText(hostName, startX + wPre, curY);

    ctx.font = '500 11.5px ' + fontFam;
    ctx.fillStyle = '#64748B';
    ctx.fillText(postTxt, startX + wPre + wHost, curY);

    $('imageExportModal').hidden = false;
  }

  function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function fitText(ctx, text, maxWidth) {
    if (maxWidth <= 0) return '';
    var w = ctx.measureText(text).width;
    if (w <= maxWidth) return text;
    var cur = text;
    while (cur.length > 2 && ctx.measureText(cur + '…').width > maxWidth) {
      cur = cur.slice(0, -1);
    }
    return cur + '…';
  }

  /* ================= 9. LƯU GOOGLE SHEET ================= */
  function fetchMenuFromSheet() {
    var url = api();
    if (!url) return;
    fetch(url + '?action=menu')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.menu && j.menu.length) {
          MENU = j.menu;
          renderMenu();
          var dot = $('statusDot');
          if (dot) dot.className = 'dot on';
          if ($('statusText')) $('statusText').textContent = 'Đã nối Sheet (' + MENU.length + ' món)';
        }
      })
      .catch(function () {});
  }

  function buildOrder() {
    var t = totals();
    return {
      ma_don: orderCode,
      thoi_gian: new Date().toISOString(),
      ten_khach: ($('customer') ? $('customer').value.trim() : '') || myUname,
      kenh: ($('channel') ? $('channel').value : 'Ship'),
      thanh_toan: ($('payMethod') ? $('payMethod').value : 'Chuyển khoản'),
      tam_tinh: t.sub,
      giam_gia: t.disc,
      ship: t.ship,
      tong_cong: t.grand,
      ghi_chu: ($('orderNote') ? $('orderNote').value.trim() : ''),
      items: cart.map(function (c) {
        var unit = lineUnit(c);
        var tp = topText(c);
        return {
          id: c.id,
          ten: c.name,
          size: c.size,
          so_luong: c.qty,
          don_gia: unit,
          thanh_tien: unit * c.qty,
          chu_ly: c.uname || c.owner || '',
          topping: tp,
          duong: c.size === 'TP' ? '' : (c.sugar || ''),
          da: c.size === 'TP' ? '' : (c.ice || ''),
          ghi_chu: c.note || ''
        };
      })
    };
  }

  function saveOrder() {
    if (!cart.length) {
      showToast('Bill trống, hãy chọn món trước!');
      return;
    }
    var order = buildOrder();
    var url = api();

    // Lưu vào lịch sử local
    var hist = JSON.parse(localStorage.getItem('pos_hist') || '[]');
    hist.unshift({
      ma_don: order.ma_don,
      tong: order.tong_cong,
      time: new Date().toLocaleString('vi-VN'),
      synced: false,
      order: order
    });
    localStorage.setItem('pos_hist', JSON.stringify(hist.slice(0, 200)));

    if ($('saveMsg')) $('saveMsg').textContent = 'Đang lưu vào Sheet…';
    fetch(url, { method: 'POST', body: JSON.stringify({ action: 'save', order: order }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) {
          hist[0].synced = true;
          localStorage.setItem('pos_hist', JSON.stringify(hist));
          if ($('saveMsg')) $('saveMsg').textContent = '✓ Đã lưu ' + order.ma_don + ' vào Sheet lúc ' + new Date().toLocaleTimeString('vi-VN');
          showToast('✓ Đã chốt và lưu đơn vào Google Sheet!');
        } else throw 0;
      })
      .catch(function () {
        if ($('saveMsg')) $('saveMsg').textContent = 'Mạng lỗi — đơn đã lưu trên máy.';
        showToast('Đã lưu local. Kiểm tra kết nối Sheet sau!');
      });
  }

  /* ================= 10. PROFILE MODAL SETUP ================= */
  var tempSelectedColor = '';
  function setupProfileModal() {
    tempSelectedColor = myUcolor;
    var pGrid = $('paletteGrid');
    if (!pGrid) return;
    pGrid.innerHTML = '';

    USER_PALETTE.forEach(function (col) {
      var dot = document.createElement('div');
      dot.className = 'color-dot' + (myUcolor === col.bg ? ' is-active' : '');
      dot.style.backgroundColor = col.bg;
      dot.textContent = (myUcolor === col.bg) ? '✓' : '';
      dot.title = col.name;

      dot.onclick = function () {
        document.querySelectorAll('.color-dot').forEach(function (d) {
          d.classList.remove('is-active');
          d.textContent = '';
        });
        dot.classList.add('is-active');
        dot.textContent = '✓';
        tempSelectedColor = col.bg;
        var prevAv = $('profilePreviewAvatar');
        if (prevAv) prevAv.style.backgroundColor = col.bg;
      };
      pGrid.appendChild(dot);
    });

    var inputNm = $('inputProfileName');
    if (inputNm) {
      inputNm.value = myUname;
      var prevNm = $('profilePreviewName');
      var prevAv = $('profilePreviewAvatar');
      if (prevNm) prevNm.textContent = myUname || 'Bạn';
      if (prevAv) {
        prevAv.textContent = userInitial(myUname);
        prevAv.style.backgroundColor = myUcolor;
      }
      inputNm.oninput = function () {
        if (prevNm) prevNm.textContent = inputNm.value.trim() || 'Bạn';
        if (prevAv) prevAv.textContent = userInitial(inputNm.value);
      };
    }
  }

  /* ================= 11. WIRING & EVENTS ================= */
  // Tabs lọc thể loại
  document.querySelectorAll('#tabs .v-tab, #tabs .tab').forEach(function (t) {
    t.onclick = function () {
      document.querySelectorAll('#tabs .v-tab, #tabs .tab').forEach(function (x) { x.classList.remove('is-active'); });
      t.classList.add('is-active');
      currentCat = t.dataset.cat;
      renderMenu();
    };
  });

  // Tìm kiếm
  if ($('search')) $('search').addEventListener('input', renderMenu);

  // Inputs điều chỉnh tiền (tự động phân tách phần nghìn)
  ['discount', 'shipFee'].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('input', function () {
      var raw = el.value;
      var sel = el.selectionEnd;
      var num = parseMoney(raw);
      var formatted = (num === 0 && raw.trim() === '') ? '' : (num > 0 ? num.toLocaleString('vi-VN') : '0');
      el.value = formatted;
      if (sel != null && el.setSelectionRange) {
        var diff = formatted.length - raw.length;
        var newPos = Math.max(0, sel + diff);
        el.setSelectionRange(newPos, newPos);
      }
      fieldChanged(id);
    });
    el.addEventListener('blur', function () {
      var num = parseMoney(el.value);
      el.value = num > 0 ? num.toLocaleString('vi-VN') : '0';
    });
  });
  ['customer', 'orderNote'].forEach(function (id) {
    if ($(id)) {
      $(id).addEventListener('input', function () {
        if (id === 'customer') {
          var val = $('customer').value.trim();
          if (val) {
            myUname = val;
            try {
              sessionStorage.setItem('uu_pos_tab_uname', myUname);
              sessionStorage.setItem(tabSessionId + '_uname', myUname);
              localStorage.setItem('uu_pos_uname', myUname);
            } catch (e) {}
            updateMyProfileUI();
            cart.forEach(function (c) {
              if (c.uid === myUid) {
                c.uname = val;
                c.owner = val;
                touch(c);
              }
            });
          }
        }
        fieldChanged(id);
      });
      $(id).addEventListener('change', function () { fieldChanged(id); });
    }
  });

  // Share bill link
  if ($('btnShare')) {
    $('btnShare').onclick = function () {
      var url = location.href.split('?')[0] + '?bill=' + encodeURIComponent(orderCode);
      try { history.replaceState(null, '', url); } catch (e) {}
      function copyDone() {
        showToast('Đã copy link bill chung! Gửi ngay cho bạn bè.');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(copyDone, function () {
          window.prompt('Copy link bill chung này gửi bạn bè:', url);
        });
      } else {
        window.prompt('Copy link bill chung này gửi bạn bè:', url);
      }
    };
  }

  // Profile Modal
  if ($('myProfileBtn')) {
    $('myProfileBtn').onclick = function () {
      setupProfileModal();
      $('profileModal').hidden = false;
    };
  }
  if ($('btnCloseProfileModal')) $('btnCloseProfileModal').onclick = function () { $('profileModal').hidden = true; };
  if ($('btnCancelProfile')) $('btnCancelProfile').onclick = function () { $('profileModal').hidden = true; };
  if ($('btnSaveProfile')) {
    $('btnSaveProfile').onclick = function () {
      var newName = ($('inputProfileName') ? $('inputProfileName').value.trim() : '') || 'Bạn';
      var oldName = myUname;
      myUname = newName;
      if (tempSelectedColor) {
        myUcolor = tempSelectedColor;
      }
      try {
        sessionStorage.setItem('uu_pos_tab_uname', myUname);
        sessionStorage.setItem('uu_pos_tab_ucolor', myUcolor);
        sessionStorage.setItem(tabSessionId + '_uname', myUname);
        sessionStorage.setItem(tabSessionId + '_ucolor', myUcolor);
        localStorage.setItem('uu_pos_uname', myUname);
        localStorage.setItem('uu_pos_ucolor', myUcolor);
      } catch (e) {}
      updateMyProfileUI();

      if ($('customer')) {
        var curCust = $('customer').value.trim();
        if (!curCust || curCust === oldName || FUN_NAMES.indexOf(curCust) !== -1) {
          $('customer').value = newName;
          fieldChanged('customer');
        }
      }

      cart.forEach(function (c) {
        if (c.uid === myUid || c.uname === oldName || c.owner === oldName) {
          c.uname = newName;
          c.owner = newName;
          c.ucolor = myUcolor;
          touch(c);
        }
      });
      renderCart();

      $('profileModal').hidden = true;
      sendPresence({ active: true, ucolor: myUcolor, uname: myUname });
      schedulePush();
      showToast('Đã lưu thông tin hồ sơ!');
    };
  }

  // More menu dropdown
  if ($('btnMoreMenu')) {
    $('btnMoreMenu').onclick = function (e) {
      e.stopPropagation();
      var p = $('moreDropdown');
      if (p) p.hidden = !p.hidden;
    };
    document.addEventListener('click', function () {
      var p = $('moreDropdown');
      if (p) p.hidden = true;
    });
  }

  // Tạo bill mới
  function createNewOrder() {
    if (cart.length && !confirm('Tạo bill mới? Bill hiện tại sẽ không bị ảnh hưởng.')) return;
    cart = [];
    cartDel = {};
    orderCode = newOrderCode();
    try { history.replaceState(null, '', location.href.split('?')[0] + '?bill=' + encodeURIComponent(orderCode)); } catch (e) {}
    if ($('customer')) $('customer').value = '';
    if ($('orderNote')) $('orderNote').value = '';
    if ($('discount')) $('discount').value = '0';
    if ($('shipFee')) $('shipFee').value = '0';
    initFields();
    renderCart();
    wsConnect();
    showToast('Đã tạo bill mới: ' + orderCode);
  }
  if ($('btnMenuNew')) $('btnMenuNew').onclick = createNewOrder;
  if ($('btnNewInline')) $('btnNewInline').onclick = createNewOrder;

  // Lịch sử đơn
  if ($('btnMenuHistory')) {
    $('btnMenuHistory').onclick = function () {
      var hist = JSON.parse(localStorage.getItem('pos_hist') || '[]');
      var ul = $('historyList');
      if (ul) {
        ul.innerHTML = hist.length ? '' : '<li>Chưa có đơn nào trên máy này.</li>';
        hist.forEach(function (h) {
          var li = document.createElement('li');
          li.textContent = (h.synced ? '✓ ' : '⏳ ') + h.ma_don + ' · ' + Number(h.tong).toLocaleString('vi-VN') + 'đ · ' + h.time;
          ul.appendChild(li);
        });
      }
      $('historyModal').hidden = false;
    };
  }
  if ($('btnCloseHistory')) $('btnCloseHistory').onclick = function () { $('historyModal').hidden = true; };
  if ($('btnCloseHistoryBtn')) $('btnCloseHistoryBtn').onclick = function () { $('historyModal').hidden = true; };

  // Customizer Item Modal events
  if ($('btnCloseItemModal')) $('btnCloseItemModal').onclick = closeItemCustomizer;

  if ($('btnSizeM')) {
    $('btnSizeM').onclick = function () {
      curSelectedSize = 'M';
      $('btnSizeM').classList.add('is-active');
      if ($('btnSizeL')) $('btnSizeL').classList.remove('is-active');
      updateCustomizerPrice();
    };
  }
  if ($('btnSizeL')) {
    $('btnSizeL').onclick = function () {
      curSelectedSize = 'L';
      $('btnSizeL').classList.add('is-active');
      if ($('btnSizeM')) $('btnSizeM').classList.remove('is-active');
      updateCustomizerPrice();
    };
  }

  document.querySelectorAll('#custSugarGroup .chip-btn').forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll('#custSugarGroup .chip-btn').forEach(function (x) { x.classList.remove('is-active'); });
      btn.classList.add('is-active');
      curSelectedSugar = btn.dataset.sugar;
    };
  });

  document.querySelectorAll('#custIceGroup .chip-btn').forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll('#custIceGroup .chip-btn').forEach(function (x) { x.classList.remove('is-active'); });
      btn.classList.add('is-active');
      curSelectedIce = btn.dataset.ice;
    };
  });

  if ($('custItemNote')) {
    $('custItemNote').onfocus = function () {
      sendPresence({ lid: curEditingLine ? curEditingLine.lid : 'new', action: 'gõ ghi chú' });
    };
  }

  // Nút Xác nhận thêm/sửa ly
  if ($('btnConfirmItem')) {
    $('btnConfirmItem').onclick = function () {
      var drinkerName = ($('custDrinkerName') ? $('custDrinkerName').value.trim() : '') || myUname;
      var noteVal = ($('custItemNote') ? $('custItemNote').value.trim() : '');

      if (curEditingLine) {
        // Cập nhật dòng hiện có
        var m = menuById(curEditingLine.id);
        if (m && m.nhom !== 'topping') {
          curEditingLine.size = curSelectedSize;
          curEditingLine.price = (curSelectedSize === 'L') ? m.giaL : m.giaM;
        }
        curEditingLine.sugar = curSelectedSugar;
        curEditingLine.ice = curSelectedIce;
        curEditingLine.toppings = curSelectedToppings.map(function (t) { return Object.assign({}, t); });
        curEditingLine.note = noteVal;
        curEditingLine.uname = drinkerName;
        curEditingLine.owner = drinkerName;
        touch(curEditingLine);
        showToast('Đã cập nhật ly của ' + drinkerName);
      } else if (curCustomItem) {
        // Thêm ly mới
        var isTp = (curCustomItem.nhom === 'topping');
        var price = isTp ? curCustomItem.gia : ((curSelectedSize === 'L') ? curCustomItem.giaL : curCustomItem.giaM);
        var newLineObj = {
          lid: newLid(),
          rev: 1,
          by: clientId,
          uid: myUid,
          uname: drinkerName,
          ucolor: myUcolor,
          owner: drinkerName,
          id: curCustomItem.id,
          name: curCustomItem.ten,
          size: isTp ? 'TP' : curSelectedSize,
          price: price,
          qty: 1,
          toppings: curSelectedToppings.map(function (t) { return Object.assign({}, t); }),
          sugar: isTp ? '' : curSelectedSugar,
          ice: isTp ? '' : curSelectedIce,
          note: noteVal
        };
        cart.push(newLineObj);
        showToast('Đã thêm 1 ly cho ' + drinkerName);
      }

      closeItemCustomizer();
      renderCart();
    };
  }

  // Xuất ảnh Bill Canvas
  if ($('btnExportImage')) $('btnExportImage').onclick = exportCanvasBill;
  if ($('btnCloseImageModal')) $('btnCloseImageModal').onclick = function () { $('imageExportModal').hidden = true; };

  // Canvas Actions (Copy, Download, Share)
  if ($('btnCopyImage')) {
    $('btnCopyImage').onclick = function () {
      var canvas = $('billCanvas');
      if (!canvas) return;
      if (canvas.toBlob && navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
        canvas.toBlob(function (blob) {
          if (!blob) return;
          var item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(function () {
            showToast('📋 Đã copy ảnh vào Clipboard! Dán ngay vào Zalo/Messenger.');
          }).catch(function () {
            // Fallback tải file
            var a = document.createElement('a');
            a.download = orderCode + '-bill.png';
            a.href = canvas.toDataURL('image/png');
            a.click();
            showToast('Đã tải ảnh về máy');
          });
        }, 'image/png');
      } else {
        var a = document.createElement('a');
        a.download = orderCode + '-bill.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
        showToast('Đã tải ảnh về máy');
      }
    };
  }

  if ($('btnDownloadImage')) {
    $('btnDownloadImage').onclick = function () {
      var canvas = $('billCanvas');
      if (!canvas) return;
      var a = document.createElement('a');
      a.download = orderCode + '-bill.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('Đã tải ảnh về máy.');
    };
  }

  if ($('btnShareNative')) {
    $('btnShareNative').onclick = function () {
      var canvas = $('billCanvas');
      if (!canvas) return;
      if (canvas.toBlob && navigator.canShare) {
        canvas.toBlob(function (blob) {
          if (!blob) return;
          var file = new File([blob], orderCode + '-bill.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({
              title: 'Hóa đơn Ú Ụ Milk Tea: ' + orderCode,
              text: 'Đơn đặt trà sữa chung nhóm',
              files: [file]
            }).catch(function () {});
            return;
          }
          // Fallback share url
          var url = location.href.split('?')[0] + '?bill=' + encodeURIComponent(orderCode);
          navigator.share({ title: 'Bill ' + orderCode, url: url }).catch(function () {});
        }, 'image/png');
      } else {
        var url = location.href.split('?')[0] + '?bill=' + encodeURIComponent(orderCode);
        if (navigator.share) navigator.share({ title: 'Bill ' + orderCode, url: url }).catch(function () {});
        else window.prompt('Copy link bill:', url);
      }
    };
  }

  // Lưu Google Sheet
  if ($('btnSave')) $('btnSave').onclick = saveOrder;

  // Mobile Drawer Toggle
  function openMobileDrawer() {
    var sec = $('cartSection');
    var bd = $('drawerBackdrop');
    if (sec) sec.classList.add('is-open');
    if (bd) bd.classList.add('is-active');
  }
  function closeMobileDrawer() {
    var sec = $('cartSection');
    var bd = $('drawerBackdrop');
    if (sec) sec.classList.remove('is-open');
    if (bd) bd.classList.remove('is-active');
  }

  if ($('mobileCartToggle')) $('mobileCartToggle').onclick = openMobileDrawer;
  if ($('mobileOpenCartBtn')) $('mobileOpenCartBtn').onclick = openMobileDrawer;
  if ($('cartDrawerHandle')) $('cartDrawerHandle').onclick = closeMobileDrawer;
  if ($('drawerBackdrop')) $('drawerBackdrop').onclick = closeMobileDrawer;

  /* ================= 12. KHỞI TẠO HỆ THỐNG ================= */
  updateMyProfileUI();
  initFields();
  renderMenu();

  // Kiểm tra link URL: ?bill=MÃ
  (function () {
    var m = null;
    try { m = (location.search || '').match(/[?&]bill=([^&]+)/); } catch (e) {}
    if (m && decodeURIComponent(m[1])) {
      orderCode = decodeURIComponent(m[1]);
      isInitialSyncing = true; // Chờ sync từ server/peer, không đè cart rỗng
      setTimeout(function () { isInitialSyncing = false; }, 2000);
    }
    renderCart();
    fetchMenuFromSheet();
    setupLive();
  })();

})();
