/* POS Ú Ụ Milk Tea — bấm bill nhanh, lưu Google Sheet qua Apps Script, xuất PDF */
(function(){
'use strict';
var $ = function(id){ return document.getElementById(id); };

/* Menu mặc định (khớp index.html + menu.jpg). Khi đã nối Sheet, giá tự lấy từ Sheet. */
var DEFAULT_MENU = [
  {id:'ts01', ten:'Ú ụ full topping', nhom:'trasua', giaM:30000, giaL:38000, note:'M 30-32 / L 38-40 tùy topping'},
  {id:'ts02', ten:'Trà sữa truyền thống', nhom:'trasua', giaM:18000, giaL:22000},
  {id:'ts03', ten:'Trà sữa thái xanh', nhom:'trasua', giaM:18000, giaL:22000},
  {id:'ts04', ten:'Trà sữa thái đỏ', nhom:'trasua', giaM:18000, giaL:22000},
  {id:'ts05', ten:'Trà sữa khoai môn', nhom:'trasua', giaM:18000, giaL:22000},
  {id:'ts06', ten:'Trà sữa olong lài', nhom:'trasua', giaM:20000, giaL:25000},
  {id:'ts07', ten:'Trà sữa chocomint', nhom:'trasua', giaM:20000, giaL:25000},
  {id:'ts08', ten:'Trà sữa socola', nhom:'trasua', giaM:20000, giaL:25000},
  {id:'ts09', ten:'Trà sữa gạo rang', nhom:'trasua', giaM:20000, giaL:25000},
  {id:'st01', ten:'Sữa tươi cf sương sáo', nhom:'suatuoi', giaM:25000, giaL:30000},
  {id:'st02', ten:'Sữa tươi tc đường đen', nhom:'suatuoi', giaM:25000, giaL:30000},
  {id:'st03', ten:'Matcha latte', nhom:'suatuoi', giaM:27000, giaL:32000},
  {id:'st04', ten:'Khoai môn latte', nhom:'suatuoi', giaM:27000, giaL:32000},
  {id:'st05', ten:'Cacao latte', nhom:'suatuoi', giaM:27000, giaL:32000},
  {id:'tr01', ten:'Hồng trà', nhom:'tra', giaM:12000, giaL:17000},
  {id:'tr02', ten:'Hồng trà tắc', nhom:'tra', giaM:12000, giaL:17000},
  {id:'tr03', ten:'Trà tắc thái xanh', nhom:'tra', giaM:12000, giaL:17000},
  {id:'tr04', ten:'Lục trà lài', nhom:'tra', giaM:12000, giaL:17000},
  {id:'tr05', ten:'Lục trà tắc', nhom:'tra', giaM:12000, giaL:17000},
  {id:'tc01', ten:'Trà ổi hồng', nhom:'traitraicay', giaM:25000, giaL:30000},
  {id:'tc02', ten:'Trà đào', nhom:'traitraicay', giaM:25000, giaL:30000},
  {id:'tc03', ten:'Trà vải', nhom:'traitraicay', giaM:25000, giaL:30000},
  {id:'tc04', ten:'Trà xoài chanh dây', nhom:'traitraicay', giaM:25000, giaL:30000},
  {id:'tc05', ten:'Trà nhiệt đới', nhom:'traitraicay', giaM:25000, giaL:30000},
  {id:'tc06', ten:'Trà tắc xí muội', nhom:'traitraicay', giaM:15000, giaL:20000},
  {id:'tc07', ten:'Trà dưa lưới', nhom:'traitraicay', giaM:25000, giaL:30000},
  {id:'tc08', ten:'Trà dâu', nhom:'traitraicay', giaM:25000, giaL:30000},
  {id:'tc09', ten:'Trà đặc thơm (dứa)', nhom:'traitraicay', giaM:27000, giaL:32000},
  {id:'tp01', ten:'Trân châu dừa', nhom:'topping', gia:6000},
  {id:'tp02', ten:'Trân châu đen', nhom:'topping', gia:6000},
  {id:'tp03', ten:'Trân châu trắng', nhom:'topping', gia:6000},
  {id:'tp04', ten:'Trân châu phô mai', nhom:'topping', gia:1000, note:'1k/viên'},
  {id:'tp05', ten:'Trân châu củ năng', nhom:'topping', gia:6000},
  {id:'tp06', ten:'Khoai dẻo', nhom:'topping', gia:5000},
  {id:'tp07', ten:'Sương sáo', nhom:'topping', gia:5000},
  {id:'tp08', ten:'Rau câu phô mai', nhom:'topping', gia:6000, note:'6k/4 viên'},
  {id:'tp09', ten:'Pudding socola', nhom:'topping', gia:5000},
  {id:'tp10', ten:'Pudding trứng', nhom:'topping', gia:5000},
  {id:'tp11', ten:'Khúc bạch tảng', nhom:'topping', gia:5000, note:'5k/3 viên'},
  {id:'tp12', ten:'Khúc bạch', nhom:'topping', gia:6000, note:'6k/3 viên'},
  {id:'tp13', ten:'Khúc bạch bảy màu', nhom:'topping', gia:6000},
  {id:'tp14', ten:'Khúc bạch donut', nhom:'topping', gia:14000},
  {id:'tp15', ten:'Khúc bạch chân mèo', nhom:'topping', gia:6000, note:'4k/6k/8k — mặc định 6k'},
  {id:'tp16', ten:'Khúc bạch jerry', nhom:'topping', gia:6000, note:'6k/8k — mặc định 6k'},
  {id:'tp17', ten:'Kem trứng', nhom:'topping', gia:6000},
  {id:'tp18', ten:'Kem cheese', nhom:'topping', gia:6000},
  {id:'tp19', ten:'Khoai môn tươi', nhom:'topping', gia:6000}
];

var MENU = DEFAULT_MENU.slice();
var cart = [];
var cat = 'trasua';
var orderCode = newOrderCode();

function newOrderCode(){
  var d = new Date();
  function p(n){ return String(n).padStart(2,'0'); }
  return 'UU-' + d.getFullYear().toString().slice(2) + p(d.getMonth()+1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}
function fmt(n){ return (Number(n)||0).toLocaleString('vi-VN') + 'đ'; }
function fmtK(n){ var v=Number(n)||0; return (v>=1000 ? (v/1000).toLocaleString('vi-VN')+'k' : v+'đ'); }
var DEFAULT_API = 'https://script.google.com/macros/s/AKfycby39xudP9BTqvHS4XOmS2zHq78LanddGF_7sqEfGgkoATDpkU9nFlfvGGh-__zbe9E/exec';
function api(){ return ((localStorage.getItem('pos_api')||'').trim() || DEFAULT_API); }

function setStatus(mode, text){
  var dot = $('statusDot');
  dot.className = 'dot' + (mode==='on' ? ' on' : mode==='warn' ? ' warn' : '');
  $('statusText').textContent = text;
}

/* ---------- render menu ---------- */
function renderMenu(){
  var q = ($('search').value||'').toLowerCase().trim();
  var grid = $('productGrid'); grid.innerHTML = '';
  MENU.filter(function(m){
    if(m.nhom !== cat) return false;
    if(q && m.ten.toLowerCase().indexOf(q) < 0) return false;
    return true;
  }).forEach(function(m){
    var d = document.createElement('div'); d.className = 'pcard';
    if(m.nhom === 'topping'){
      d.innerHTML = '<h4></h4><div class="price"></div>';
      d.querySelector('h4').textContent = m.ten;
      d.querySelector('.price').textContent = fmt(m.gia) + (m.note ? ' · ' + m.note : '');
      var b = document.createElement('button'); b.className='btn-add'; b.textContent='+ Thêm ' + fmtK(m.gia);
      b.onclick = function(){ addLine({id:m.id, name:m.ten, size:'TP', price:m.gia}); };
      d.appendChild(b);
    } else {
      d.innerHTML = '<h4></h4><div class="price"></div><div class="row"></div>';
      d.querySelector('h4').textContent = m.ten;
      d.querySelector('.price').textContent = 'M ' + fmtK(m.giaM) + ' · L ' + fmtK(m.giaL) + (m.note ? ' · ' + m.note : '');
      var row = d.querySelector('.row');
      var bm = document.createElement('button'); bm.className='btn-m'; bm.textContent='M · ' + fmtK(m.giaM);
      var bl = document.createElement('button'); bl.className='btn-l'; bl.textContent='L · ' + fmtK(m.giaL);
      bm.onclick = function(){ addLine({id:m.id, name:m.ten, size:'M', price:m.giaM}); };
      bl.onclick = function(){ addLine({id:m.id, name:m.ten, size:'L', price:m.giaL}); };
      row.appendChild(bm); row.appendChild(bl);
    }
    grid.appendChild(d);
  });
  if(!grid.children.length) grid.innerHTML = '<p class="pos-hint">Không thấy món. Thử từ khác.</p>';
}

var SUGARS = ['100%','70%','50%','30%','Không đường'];
var ICES = ['Nhiều đá','Ít đá','Không đá','Đá riêng'];

function toppings(){ return MENU.filter(function(m){ return m.nhom==='topping'; }); }
function menuById(id){ var f=null; MENU.forEach(function(m){ if(m.id===id) f=m; }); return f; }
function topSum(c){ var s=0; (c.toppings||[]).forEach(function(t){ s += t.price*t.qty; }); return s; }
function lineUnit(c){ return c.price + topSum(c); }
function lineTotal(c){ return lineUnit(c)*c.qty; }
function topText(c){
  if(!c.toppings || !c.toppings.length) return '';
  return c.toppings.map(function(t){ return t.name + (t.qty>1 ? ' x'+t.qty : ''); }).join(', ');
}
function optText(c){
  var parts = [];
  if(c.size!=='TP'){
    if(c.sugar && c.sugar!=='100%') parts.push('Đường ' + c.sugar);
    if(c.ice && c.ice!=='Nhiều đá') parts.push(c.ice);
  }
  var tp = topText(c);
  if(tp) parts.push('+' + tp);
  if(c.note) parts.push('Ghi chú: ' + c.note);
  return parts.join(' · ');
}
function lineTitle(c){
  var t = (c.owner ? c.owner + ': ' : '') + c.name + (c.size!=='TP' ? ' (' + c.size + ')' : '');
  var o = optText(c);
  return o ? t + '\n' + o : t;
}

function newLine(o){
  return {lid:newLid(), rev:1, by:clientId, key:o.id+'|'+o.size+'|'+o.price, id:o.id, name:o.name, size:o.size, price:o.price,
    qty:1, toppings:[], owner:'', sugar:'100%', ice:'Nhiều đá', note:'', open:false};
}
function isDefault(c){
  return (!c.toppings||!c.toppings.length) && !c.owner && !c.note && c.sugar==='100%' && c.ice==='Nhiều đá';
}

function addLine(o){
  var found = null;
  cart.forEach(function(c){ if(c.id===o.id && c.size===o.size && c.price===o.price && isDefault(c)) found=c; });
  if(found){ found.qty++; touch(found); }
  else cart.push(newLine(o));
  renderCart();
}

function setSize(idx, size){
  var c = cart[idx], m = menuById(c.id);
  if(!m || m.nhom==='topping') return;
  c.size = size;
  c.price = (size==='L') ? m.giaL : m.giaM;
  touch(c);
  renderCart();
}

/* ---------- render cart ---------- */
function totals(){
  var sub = 0;
  cart.forEach(function(c){ sub += lineTotal(c); });
  var disc = Math.max(0, Number($('discount').value)||0);
  var ship = Math.max(0, Number($('shipFee').value)||0);
  return {sub:sub, disc:disc, ship:ship, grand: Math.max(0, sub - disc + ship)};
}
/* Panel tùy chọn từng ly: owner (text) / size (radio) / topping (checkbox) / đường (radio) / đá (radio) / ghi chú (text) */
function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
function buildOpts(box, c, idx, tops){
  box.innerHTML = '';
  var m = menuById(c.id);
  /* tên người uống */
  var g1 = el('div','opt-group');
  g1.appendChild(el('p','opt-t','Tên ly (optional)'));
  var ow = el('input','opt-input'); ow.type='text'; ow.placeholder='Vd: An, Ly 1…'; ow.value=c.owner||'';
  ow.onchange=function(){ c.owner = ow.value.trim(); touch(c); renderCart(); };
  g1.appendChild(ow); box.appendChild(g1);
  /* size radio */
  if(m && m.nhom!=='topping'){
    var g2 = el('div','opt-group');
    g2.appendChild(el('p','opt-t','Size'));
    [['M',m.giaM],['L',m.giaL]].forEach(function(pr){
      var lb = el('label','opt-radio');
      var r = el('input'); r.type='radio'; r.name='size'+idx; r.checked = (c.size===pr[0]);
      r.onchange=function(){ setSize(idx, pr[0]); };
      lb.appendChild(r);
      lb.appendChild(el('span',null, pr[0]+' · '+fmtK(pr[1])));
      g2.appendChild(lb);
    });
    box.appendChild(g2);
  }
  /* topping checkbox */
  var g3 = el('div','opt-group');
  g3.appendChild(el('p','opt-t','Topping (chọn nhiều)'));
  var tw = el('div','opt-tops'); g3.appendChild(tw);
  tops.forEach(function(tp){
    var has = null;
    (c.toppings||[]).forEach(function(t){ if(t.id===tp.id) has=t; });
    var lb = el('label','opt-check');
    var cb = el('input'); cb.type='checkbox'; cb.checked = !!has;
    cb.onchange=function(){
      if(cb.checked && !has) c.toppings.push({id:tp.id, name:tp.ten, price:tp.gia, qty:1});
      if(!cb.checked && has) c.toppings = c.toppings.filter(function(t){ return t.id!==tp.id; });
      touch(c); renderCart();
    };
    lb.appendChild(cb);
    lb.appendChild(el('span',null, tp.ten+' '+fmtK(tp.gia)));
    if(has){
      var q = el('span','opt-qty');
      var bm = el('button',null,'−'); bm.type='button';
      var n = el('b',null,'x'+has.qty);
      var bp = el('button',null,'+'); bp.type='button';
      bm.onclick=function(e){ e.preventDefault(); has.qty--; if(has.qty<=0) c.toppings=c.toppings.filter(function(t){return t.id!==tp.id;}); touch(c); renderCart(); };
      bp.onclick=function(e){ e.preventDefault(); has.qty++; touch(c); renderCart(); };
      q.appendChild(bm); q.appendChild(n); q.appendChild(bp); lb.appendChild(q);
    }
    tw.appendChild(lb);
  });
  box.appendChild(g3);
  /* đường radio */
  var g4 = el('div','opt-group');
  g4.appendChild(el('p','opt-t','Lượng đường'));
  SUGARS.forEach(function(s){
    var lb = el('label','opt-radio');
    var r = el('input'); r.type='radio'; r.name='sugar'+idx; r.checked = (c.sugar===s);
    r.onchange=function(){ c.sugar = s; touch(c); renderCart(); };
    lb.appendChild(r); lb.appendChild(el('span',null,s)); g4.appendChild(lb);
  });
  box.appendChild(g4);
  /* đá radio */
  var g5 = el('div','opt-group');
  g5.appendChild(el('p','opt-t','Đá'));
  ICES.forEach(function(s){
    var lb = el('label','opt-radio');
    var r = el('input'); r.type='radio'; r.name='ice'+idx; r.checked = (c.ice===s);
    r.onchange=function(){ c.ice = s; touch(c); renderCart(); };
    lb.appendChild(r); lb.appendChild(el('span',null,s)); g5.appendChild(lb);
  });
  box.appendChild(g5);
  /* ghi chú ly */
  var g6 = el('div','opt-group');
  g6.appendChild(el('p','opt-t','Ghi chú cho quán'));
  var nt = el('input','opt-input'); nt.type='text'; nt.placeholder='Ít ngọt, thêm đá…'; nt.value=c.note||'';
  nt.onchange=function(){ c.note = nt.value.trim(); touch(c); renderCart(); };
  g6.appendChild(nt); box.appendChild(g6);
}

function renderCart(){
  var ul = $('cartItems'); ul.innerHTML='';
  var tops = toppings();
  cart.forEach(function(c, idx){
    var li = document.createElement('li'); li.className='citem';
    li.innerHTML = '<div class="l1"><span></span><span></span></div><div class="l2"></div><div class="opt-sum"></div><div class="opts" hidden></div>';
    var title = li.querySelector('.l1 span:first-child');
    title.textContent = (c.owner ? c.owner + ': ' : '') + c.name + (c.size!=='TP' ? ' (' + c.size + ')' : '');
    title.style.whiteSpace = 'pre-line';
    li.querySelector('.l1 span:last-child').textContent = fmt(lineTotal(c));
    var l2 = li.querySelector('.l2');
    var q = document.createElement('div'); q.className='qty';
    var bm=document.createElement('button'); bm.textContent='−';
    var n=document.createElement('b'); n.textContent=c.qty;
    var bp=document.createElement('button'); bp.textContent='+';
    bm.onclick=function(){ c.qty--; if(c.qty<=0){ tomb(c); cart.splice(idx,1); } else touch(c); renderCart(); };
    bp.onclick=function(){ c.qty++; touch(c); renderCart(); };
    q.appendChild(bm); q.appendChild(n); q.appendChild(bp);
    var rm=document.createElement('button'); rm.className='rm'; rm.textContent='Xóa';
    rm.onclick=function(){ tomb(c); cart.splice(idx,1); renderCart(); };
    l2.appendChild(q); l2.appendChild(rm);
    /* dòng tóm tắt tùy chọn */
    var sum = li.querySelector('.opt-sum');
    var ot = optText(c);
    if(ot){ sum.textContent = ot; } else { sum.textContent = ''; }
    /* nút collapsed — chỉ món nước */
    if(c.size !== 'TP'){
      var tg = document.createElement('button'); tg.className='tops-toggle'; tg.type='button';
      var nOpt = (c.toppings?c.toppings.length:0) + ((!isDefault(c))?1:0);
      tg.textContent = (c.open ? '▾ Thu gọn tùy chọn' : '⚙ Tùy chọn ly này' + (nOpt? ' ('+nOpt+')' : ''));
      var box = li.querySelector('.opts');
      tg.onclick = function(){ c.open = !c.open; renderCart(); };
      sum.appendChild(document.createElement('br'));
      sum.appendChild(tg);
      if(c.open){
        box.hidden = false;
        buildOpts(box, c, idx, tops);
      }
    }
    ul.appendChild(li);
  });
  if(!cart.length) ul.innerHTML = '<li class="pos-hint">Bill trống — bấm món bên trái để thêm.</li>';
  var t = totals();
  $('subTotal').textContent = fmt(t.sub);
  $('adjTotal').textContent = (t.disc? '−'+fmt(t.disc):'0đ') + ' + ' + fmt(t.ship);
  $('grandTotal').textContent = fmt(t.grand);
  $('orderCode').textContent = orderCode;
  schedulePush();
}

/* ---------- sheet ---------- */
function fetchMenuFromSheet(){
  var url = api();
  if(!url){ setStatus('', 'Chưa kết nối Sheet — dùng giá mặc định'); return; }
  setStatus('warn', 'Đang tải menu từ Sheet…');
  fetch(url + '?action=menu').then(function(r){ return r.json(); }).then(function(j){
    if(j && j.menu && j.menu.length){ MENU = j.menu; renderMenu(); setStatus('on', 'Đã nối Sheet · ' + MENU.length + ' món'); }
    else setStatus('warn', 'Sheet chưa có menu — dùng giá mặc định');
  }).catch(function(){ setStatus('warn', 'Không tải được Sheet — dùng giá mặc định (vẫn bán được)'); });
}

function buildOrder(){
  var t = totals();
  return {
    ma_don: orderCode,
    thoi_gian: new Date().toISOString(),
    ten_khach: $('customer').value.trim(),
    kenh: $('channel').value,
    thanh_toan: $('payMethod').value,
    tam_tinh: t.sub, giam_gia: t.disc, ship: t.ship, tong_cong: t.grand,
    ghi_chu: $('orderNote').value.trim(),
    items: cart.map(function(c){
      var unit = lineUnit(c);
      var tp = topText(c);
      return {id:c.id, ten:c.name, size:c.size, so_luong:c.qty, don_gia:unit, thanh_tien:unit*c.qty,
        chu_ly:c.owner||'', topping:tp, duong:c.size==='TP'?'':(c.sugar||''), da:c.size==='TP'?'':(c.ice||''), ghi_chu:c.note||''};
    })
  };
}

function saveOrder(){
  if(!cart.length){ $('saveMsg').textContent = 'Bill trống, chưa lưu được.'; return; }
  var order = buildOrder();
  var url = api();
  // Luôn lưu local để không mất đơn
  var hist = JSON.parse(localStorage.getItem('pos_hist')||'[]');
  hist.unshift({ma_don:order.ma_don, tong:order.tong_cong, time:new Date().toLocaleString('vi-VN'), synced:false, order:order});
  localStorage.setItem('pos_hist', JSON.stringify(hist.slice(0,200)));

  $('saveMsg').textContent = 'Đang lưu vào Sheet…';
  fetch(url, {method:'POST', body: JSON.stringify({action:'save', order:order})})
    .then(function(r){ return r.json(); })
    .then(function(j){
      if(j && j.ok){
        hist[0].synced = true; localStorage.setItem('pos_hist', JSON.stringify(hist));
        $('saveMsg').textContent = 'Đã lưu ' + order.ma_don + ' vào Sheet lúc ' + new Date().toLocaleTimeString('vi-VN') + '.';
      } else throw 0;
    })
    .catch(function(){ $('saveMsg').textContent = 'Mạng lỗi — đơn đã giữ trên máy, bấm Lưu lại sau.'; });
}

function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------- PDF ---------- */
function exportPDF(){
  if(!cart.length){ $('saveMsg').textContent = 'Bill trống, chưa xuất PDF được.'; return; }
  var o = buildOrder();
  var s = JSON.parse(localStorage.getItem('pos_shop')||'{}');
  $('bShop').textContent = (s.name||'Ú Ụ MILK TEA').toUpperCase();
  $('bAddr').textContent = s.addr||'349 Huỳnh Thị Hai, Trung Mỹ Tây, TP.HCM';
  $('bPhone').textContent = s.phone||'0981.328.096 · 0585.202.705';
  $('bThanks').textContent = s.thanks||'Cảm ơn bạn đã ủng hộ trà sữa nhà làm!';
  $('bCode').textContent = o.ma_don;
  $('bTime').textContent = new Date().toLocaleString('vi-VN');
  $('bCustomer').textContent = o.ten_khach || '—';
  $('bChannel').textContent = o.kenh; $('bPay').textContent = o.thanh_toan;
  var tb = $('bItems'); tb.innerHTML='';
  o.items.forEach(function(it){
    var tr = document.createElement('tr');
    tr.innerHTML = '<td></td><td></td><td></td><td></td>';
    var cell = tr.children[0];
    var html = '<span class="bn">' + esc(it.ten) + '</span>';
    if(it.size!=='TP') html += ' <span class="bsz">(' + esc(it.size) + ')</span>';
    var det = [];
    if(it.size!=='TP' && it.duong && it.duong!=='100%') det.push('Đường ' + esc(it.duong));
    if(it.size!=='TP' && it.da && it.da!=='Nhiều đá') det.push(esc(it.da));
    if(it.topping) det.push('+' + esc(it.topping));
    if(det.length) html += '<div class="bdt">' + det.join(' · ') + '</div>';
    var notes = [];
    if(it.chu_ly) notes.push('Ly của: ' + esc(it.chu_ly));
    if(it.ghi_chu) notes.push('Ghi chú: ' + esc(it.ghi_chu));
    if(notes.length) html += '<div class="bnt">' + notes.join(' · ') + '</div>';
    cell.innerHTML = html;
    tr.children[1].textContent = it.so_luong;
    tr.children[2].textContent = Number(it.don_gia).toLocaleString('vi-VN');
    tr.children[3].textContent = Number(it.thanh_tien).toLocaleString('vi-VN');
    tb.appendChild(tr);
  });
  $('bSub').textContent = o.tam_tinh.toLocaleString('vi-VN');
  $('bDisc').textContent = o.giam_gia ? '−' + o.giam_gia.toLocaleString('vi-VN') : '0';
  $('bShip').textContent = (o.ship || 0).toLocaleString('vi-VN');
  $('bGrand').textContent = o.tong_cong.toLocaleString('vi-VN') + 'đ';
  $('bNote').textContent = o.ghi_chu ? ('Ghi chú: ' + o.ghi_chu) : '';
  window.print();
}

/* ===== LIVE SYNC client-side (không realtime với Sheet) =====
   - BroadcastChannel: các tab cùng trình duyệt, tức thì.
   - WebSocket: nhiều máy văn phòng (chạy server.js kèm theo).
   - Sheet chỉ chạm tới 2 lúc: tải menu lúc mở + bấm Lưu bill. */
var clientId = Math.random().toString(36).slice(2);
var pushTimer = null, applying = false;
var cartDel = {};
var lidSeq = 0;
var bc = null, ws = null, wsOk = false, wsRetry = null;
var BC_ROOM = 'uu-pos-live';
/* Nhúng cứng URL relay cloud (wss://...) để khỏi điền tay. '' = tự đoán. */
var FORCE_WS = 'wss://uu-pos-live.tuanlee-tech.workers.dev';
var F = {};
var FKEY = {customer:'customer', channel:'channel', payMethod:'pay', discount:'disc', shipFee:'ship', orderNote:'note'};
function setSyncSt(t){ var s = $('syncSt'); if(s) s.textContent = t || ''; }
function wsUrl(){
  var custom = '';
  try{ custom = (localStorage.getItem('pos_ws') || '').trim(); }catch(e){}
  if(custom) return custom;
  if(FORCE_WS) return FORCE_WS;
  /* auto: mở qua http(s) → WS cùng host; mở file:// → localhost */
  try{
    if(location.hostname) return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.hostname + ':8787';
  }catch(e){}
  return 'ws://localhost:8787';
}
function wsEndpoint(){
  var u = wsUrl().replace(/\/$/, '');
  if(/\/bill\//.test(u)) return u;
  return u + '/bill/' + encodeURIComponent(orderCode);
}
function liveStatus(){
  var parts = ['Bill ' + orderCode];
  parts.push(wsOk ? 'WS: nối' : (wsUrl() ? 'WS: chờ…' : 'WS: tắt'));
  setSyncSt('Live — ' + parts.join(' · '));
}
function deviceName(){
  var d = '';
  try{ d = localStorage.getItem('pos_device') || ''; }catch(e){}
  if(!d){
    d = 'Máy-' + clientId.slice(0, 4).toUpperCase();
    try{ localStorage.setItem('pos_device', d); }catch(e){}
  }
  return d;
}
function newLid(){ return clientId.slice(0, 4) + '-' + (++lidSeq) + '-' + Date.now().toString(36); }
function touch(c){ c.rev = (c.rev || 0) + 1; c.by = clientId; }
function tomb(c){ c.rev = (c.rev || 0) + 1; cartDel[c.lid] = {rev:c.rev, by:clientId}; }
function normLine(c){
  c.toppings = c.toppings || []; c.owner = c.owner || '';
  c.sugar = c.sugar || '100%'; c.ice = c.ice || 'Nhiều đá';
  c.note = c.note || ''; c.open = false; c.qty = Math.max(1, Number(c.qty) || 1);
  if(!c.lid) c.lid = newLid();
  c.rev = c.rev || 1; c.by = c.by || clientId;
  return c;
}
function initFields(){
  var map = {customer:$('customer').value, channel:$('channel').value, pay:$('payMethod').value,
    disc:$('discount').value, ship:$('shipFee').value, note:$('orderNote').value};
  Object.keys(map).forEach(function(k){ if(!F[k]) F[k] = {v:map[k], rev:0, by:clientId}; });
}
function readInputs(){
  return {customer:$('customer').value, channel:$('channel').value, pay:$('payMethod').value,
    disc:$('discount').value, ship:$('shipFee').value, note:$('orderNote').value};
}
function writeInputs(){
  $('customer').value = F.customer.v || ''; $('channel').value = F.channel.v || 'Tại quán';
  $('payMethod').value = F.pay.v || 'Tiền mặt';
  $('discount').value = F.disc.v || 0; $('shipFee').value = F.ship.v || 0;
  $('orderNote').value = F.note.v || '';
}
function fieldChanged(inputId){
  var k = FKEY[inputId];
  var v = $(inputId).value;
  if(F[k] && F[k].v === v) return;
  F[k] = {v:v, rev:(F[k] ? F[k].rev + 1 : 1), by:clientId};
  renderCart();
}
function snapshot(){
  return {lines:cart, tomb:cartDel, fields:F, by:clientId, dev:deviceName()};
}
function liveOn(){ var c = $('syncOn'); return !c || c.checked; }
function schedulePush(){
  if(applying || !liveOn()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(rtSend, 250);
}
function rtSend(){
  if(applying || !liveOn()) return;
  var msg = {kind:'state', bill:orderCode, wrap:snapshot(), from:clientId};
  try{ if(bc) bc.postMessage(msg); }catch(e){}
  if(ws && wsOk){
    try{ ws.send(JSON.stringify({type:'state', bill:orderCode, wrap:msg.wrap, from:clientId})); }
    catch(e){ wsOk = false; liveStatus(); }
  }
  liveStatus();
}
function onRemote(wrap, from, dev){
  if(!wrap || from === clientId || !liveOn()) return;
  var m = mergeWrap(wrap);
  if(m.changed){
    applying = true;
    try{ writeInputs(); renderCart(); }finally{ applying = false; }
    setSyncSt('Vừa nhận sửa từ ' + (m.dev || dev || 'máy khác'));
    if(m.needsPush) schedulePush();
  }
}
function wsConnect(){
  var u = wsEndpoint();
  if(!u){ wsOk = false; liveStatus(); return; }
  try{ if(ws) ws.close(); }catch(e){}
  var s = null;
  try{ s = new WebSocket(u); }catch(e){ wsOk = false; liveStatus(); return; }
  ws = s;
  s.onopen = function(){
    wsOk = true; liveStatus();
    try{ s.send(JSON.stringify({type:'hello', bill:orderCode, from:clientId, dev:deviceName()})); }catch(e){}
  };
  s.onmessage = function(ev){
    var d = null;
    try{ d = JSON.parse(ev.data); }catch(e){ return; }
    if(!d || d.bill !== orderCode || d.from === clientId) return;
    if(d.type === 'state' && d.wrap) onRemote(d.wrap, d.from);
  };
  s.onclose = function(){
    wsOk = false; liveStatus();
    clearTimeout(wsRetry);
    wsRetry = setTimeout(wsConnect, 5000);
  };
  s.onerror = function(){ try{ s.close(); }catch(e){} };
}
/* Gộp remote vào local. Trả về {changed, needsPush, dev}. */
function mergeWrap(wrap){
  var changed = false, needsPush = false, dev = '';
  var lines, tomb, fields;
  if(wrap && wrap.lines){
    lines = wrap.lines; tomb = wrap.tomb || {}; fields = wrap.fields || {};
    dev = wrap.dev || '';
  } else if(wrap && wrap.snap){
    /* định dạng cũ {snap,lock}: nhận 1 lần rev 1 */
    lines = (wrap.snap.cart || []).map(function(c){ c.lid = c.lid || newLid(); c.rev = c.rev || 1; c.by = c.by || 'old'; return normLine(c); });
    tomb = {};
    fields = {};
    var sm = {customer:wrap.snap.customer, channel:wrap.snap.channel, pay:wrap.snap.pay,
      disc:wrap.snap.disc, ship:wrap.snap.ship, note:wrap.snap.note};
    Object.keys(sm).forEach(function(k){ fields[k] = {v:(sm[k]==null?'':sm[k]), rev:1, by:wrap.snap.by || 'old'}; });
    dev = wrap.snap.dev || '';
  } else return {changed:false, needsPush:false, dev:''};
  /* tombstones: giữ rev cao nhất, xóa dòng local bị phủ */
  Object.keys(tomb).forEach(function(lid){
    var r = tomb[lid];
    var rr = (r && r.rev) || 0;
    if(!cartDel[lid] || rr > cartDel[lid].rev){
      cartDel[lid] = {rev:rr, by:(r && r.by) || ''};
      changed = true;
    }
  });
  cart = cart.filter(function(c){
    var t = cartDel[c.lid];
    if(t && t.rev >= (c.rev || 0)){ changed = true; return false; }
    return true;
  });
  /* dòng: rev cao thắng, bằng rev thì id writer lớn thắng */
  var local = {};
  cart.forEach(function(c){ local[c.lid] = c; });
  lines.forEach(function(rc){
    normLine(rc);
    var lc = local[rc.lid];
    var t = cartDel[rc.lid];
    if(t && t.rev >= (rc.rev || 0)) return;
    if(!lc){
      cart.push(rc); local[rc.lid] = rc; changed = true; needsPush = true;
    } else if((rc.rev || 0) > (lc.rev || 0) || ((rc.rev || 0) === (lc.rev || 0) && (rc.by || '') > (lc.by || ''))){
      var i = cart.indexOf(lc);
      cart[i] = rc; local[rc.lid] = rc; changed = true;
    }
  });
  /* ô form: rev cao thắng */
  Object.keys(fields).forEach(function(k){
    var r = fields[k];
    if(!r) return;
    var l = F[k];
    if(!l || (r.rev || 0) > (l.rev || 0) || ((r.rev || 0) === (l.rev || 0) && (r.by || '') > (l.by || ''))){
      F[k] = {v:r.v, rev:r.rev || 0, by:r.by || ''};
      changed = true;
    } else if(l && (l.rev || 0) > (r.rev || 0)){
      needsPush = true;
    }
  });
  /* dòng chỉ local có mà remote chưa thấy → cần đẩy */
  var remoteIds = {};
  lines.forEach(function(rc){ remoteIds[rc.lid] = true; });
  cart.forEach(function(c){
    if(!remoteIds[c.lid] && !(cartDel[c.lid] && cartDel[c.lid].rev >= (c.rev || 0))) needsPush = true;
  });
  return {changed:changed, needsPush:needsPush, dev:dev};
}
function setupLive(){
  if('BroadcastChannel' in window){
    try{
      bc = new BroadcastChannel(BC_ROOM);
      bc.onmessage = function(ev){
        var d = ev.data || {};
        if(d.bill !== orderCode || d.from === clientId) return;
        if(d.kind === 'hello'){
          schedulePush();
        } else if(d.kind === 'state' && d.wrap){
          onRemote(d.wrap, d.from);
        }
      };
    }catch(e){ bc = null; }
  }
  wsConnect();
  try{ bc && bc.postMessage({kind:'hello', bill:orderCode, from:clientId, dev:deviceName()}); }catch(e){}
  liveStatus();
}

/* ---------- wiring ---------- */
document.querySelectorAll('#tabs .tab').forEach(function(t){
  t.onclick = function(){
    document.querySelectorAll('#tabs .tab').forEach(function(x){ x.classList.remove('is-active'); });
    t.classList.add('is-active'); cat = t.dataset.cat; renderMenu();
  };
});
$('search').addEventListener('input', renderMenu);
$('discount').addEventListener('input', function(){ fieldChanged('discount'); });
$('shipFee').addEventListener('input', function(){ fieldChanged('shipFee'); });
['customer','channel','payMethod','orderNote'].forEach(function(id){
  $(id).addEventListener('input', function(){ fieldChanged(id); });
  $(id).addEventListener('change', function(){ fieldChanged(id); });
});
$('syncOn').addEventListener('change', function(){
  liveStatus();
});
$('btnShare').onclick = function(){
  var url = location.href.split('?')[0] + '?bill=' + encodeURIComponent(orderCode);
  try{ history.replaceState(null, '', url); }catch(e){}
  function done(){ setSyncSt('Đã copy link bill chung'); }
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function(){ window.prompt('Copy link bill chung:', url); });
  else window.prompt('Copy link bill chung:', url);
};
$('btnSave').onclick = saveOrder;
$('btnPDF').onclick = exportPDF;
$('btnNew').onclick = function(){
  if(cart.length && !confirm('Xóa bill hiện tại, tạo bill mới?')) return;
  cart=[]; cartDel={}; orderCode=newOrderCode();
  try{ history.replaceState(null, '', location.href.split('?')[0]); }catch(e){}
  $('customer').value=''; $('orderNote').value='';
  $('discount').value=0; $('shipFee').value=0; $('saveMsg').textContent='Bill mới. Bấm món để thêm.';
  initFields();
  renderCart();
};
$('btnSettings').onclick = function(){
  $('setApi').value = api();
  $('setWs').value = wsUrl();
  var s = JSON.parse(localStorage.getItem('pos_shop')||'{}');
  $('setName').value=s.name||'Ú Ụ Milk Tea'; $('setPhone').value=s.phone||'0981.328.096 · 0585.202.705';
  $('setAddr').value=s.addr||'349 Huỳnh Thị Hai, Trung Mỹ Tây, TP.HCM';
  $('setThanks').value=s.thanks||'Cảm ơn bạn đã ủng hộ trà sữa nhà làm!';
  $('settingsModal').hidden=false;
};
$('btnCloseSettings').onclick=function(){ $('settingsModal').hidden=true; };
$('btnSaveSettings').onclick=function(){
  localStorage.setItem('pos_api', $('setApi').value.trim());
  localStorage.setItem('pos_ws', $('setWs').value.trim());
  localStorage.setItem('pos_shop', JSON.stringify({name:$('setName').value, phone:$('setPhone').value, addr:$('setAddr').value, thanks:$('setThanks').value}));
  $('settingsModal').hidden=true; fetchMenuFromSheet(); wsConnect();
};
$('btnHistory').onclick=function(){
  var hist = JSON.parse(localStorage.getItem('pos_hist')||'[]');
  var ul=$('historyList'); ul.innerHTML = hist.length? '' : '<li>Chưa có đơn nào.</li>';
  hist.forEach(function(h){
    var li=document.createElement('li');
    li.textContent=(h.synced?'✓ ':'⏳ ')+h.ma_don+' · '+Number(h.tong).toLocaleString('vi-VN')+'đ · '+h.time;
    ul.appendChild(li);
  });
  $('historyModal').hidden=false;
};
$('btnCloseHistory').onclick=function(){ $('historyModal').hidden=true; };

initFields();
renderMenu(); renderCart(); fetchMenuFromSheet();
/* ?bill=MÃ → cùng phòng bill đó. Live qua tab + WebSocket, Sheet chỉ lúc Lưu. */
(function(){
  var m = null;
  try{ m = (location.search || '').match(/[?&]bill=([^&]+)/); }catch(e){}
  if(m && decodeURIComponent(m[1])){ orderCode = decodeURIComponent(m[1]); }
  renderCart();
  setupLive();
})();
})();
