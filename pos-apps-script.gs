/**
 * POS Ú Ụ Milk Tea — backend Google Sheet.
 * Cài 1 lần duy nhất, dùng cho pos.html.
 *
 * SHEETS TỰ TẠO:
 *  - MENU    : id | ten | nhom | giaM | giaL | gia | note | active
 *  - DONHANG : ma_don | thoi_gian | ten_khach | kenh | thanh_toan | tam_tinh | giam_gia | ship | tong_cong | ghi_chu
 *  - CHITIET : ma_don | ten | size | so_luong | don_gia | thanh_tien
 */

var MENU_DEFAULT = [
  ['ts01','Ú ụ full topping','trasua',30000,38000,'','M 30-32 / L 38-40',1],
  ['ts02','Trà sữa truyền thống','trasua',18000,22000,'','',1],
  ['ts03','Trà sữa thái xanh','trasua',18000,22000,'','',1],
  ['ts04','Trà sữa thái đỏ','trasua',18000,22000,'','',1],
  ['ts05','Trà sữa khoai môn','trasua',18000,22000,'','',1],
  ['ts06','Trà sữa olong lài','trasua',20000,25000,'','',1],
  ['ts07','Trà sữa chocomint','trasua',20000,25000,'','',1],
  ['ts08','Trà sữa socola','trasua',20000,25000,'','',1],
  ['ts09','Trà sữa gạo rang','trasua',20000,25000,'','',1],
  ['st01','Sữa tươi cf sương sáo','suatuoi',25000,30000,'','',1],
  ['st02','Sữa tươi tc đường đen','suatuoi',25000,30000,'','',1],
  ['st03','Matcha latte','suatuoi',27000,32000,'','',1],
  ['st04','Khoai môn latte','suatuoi',27000,32000,'','',1],
  ['st05','Cacao latte','suatuoi',27000,32000,'','',1],
  ['tr01','Hồng trà','tra',12000,17000,'','',1],
  ['tr02','Hồng trà tắc','tra',12000,17000,'','',1],
  ['tr03','Trà tắc thái xanh','tra',12000,17000,'','',1],
  ['tr04','Lục trà lài','tra',12000,17000,'','',1],
  ['tr05','Lục trà tắc','tra',12000,17000,'','',1],
  ['tc01','Trà ổi hồng','traitraicay',25000,30000,'','',1],
  ['tc02','Trà đào','traitraicay',25000,30000,'','',1],
  ['tc03','Trà vải','traitraicay',25000,30000,'','',1],
  ['tc04','Trà xoài chanh dây','traitraicay',25000,30000,'','',1],
  ['tc05','Trà nhiệt đới','traitraicay',25000,30000,'','',1],
  ['tc06','Trà tắc xí muội','traitraicay',15000,20000,'','',1],
  ['tc07','Trà dưa lưới','traitraicay',25000,30000,'','',1],
  ['tc08','Trà dâu','traitraicay',25000,30000,'','',1],
  ['tc09','Trà đặc thơm (dứa)','traitraicay',27000,32000,'','',1],
  ['tp01','Trân châu dừa','topping','','',6000,'',1],
  ['tp02','Trân châu đen','topping','','',6000,'',1],
  ['tp03','Trân châu trắng','topping','','',6000,'',1],
  ['tp04','Trân châu phô mai','topping','','',1000,'1k/viên',1],
  ['tp05','Trân châu củ năng','topping','','',6000,'',1],
  ['tp06','Khoai dẻo','topping','','',5000,'',1],
  ['tp07','Sương sáo','topping','','',5000,'',1],
  ['tp08','Rau câu phô mai','topping','','',6000,'6k/4 viên',1],
  ['tp09','Pudding socola','topping','','',5000,'',1],
  ['tp10','Pudding trứng','topping','','',5000,'',1],
  ['tp11','Khúc bạch tảng','topping','','',5000,'5k/3 viên',1],
  ['tp12','Khúc bạch','topping','','',6000,'6k/3 viên',1],
  ['tp13','Khúc bạch bảy màu','topping','','',6000,'',1],
  ['tp14','Khúc bạch donut','topping','','',14000,'',1],
  ['tp15','Khúc bạch chân mèo','topping','','',6000,'4k/6k/8k',1],
  ['tp16','Khúc bạch jerry','topping','','',6000,'6k/8k',1],
  ['tp17','Kem trứng','topping','','',6000,'',1],
  ['tp18','Kem cheese','topping','','',6000,'',1],
  ['tp19','Khoai môn tươi','topping','','',6000,'',1]
];

function sheet_(name, header) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
  }
  return sh;
}

function ensure_() {
  var m = sheet_( 'MENU',    ['id','ten','nhom','giaM','giaL','gia','note','active']);
  var d = sheet_('DONHANG',  ['ma_don','thoi_gian','ten_khach','kenh','thanh_toan','tam_tinh','giam_gia','ship','tong_cong','ghi_chu']);
  var c = sheet_('CHITIET',  ['ma_don','ten','size','so_luong','don_gia','thanh_tien','chu_ly','topping','duong','da','ghi_chu']);
  ensureCols_(c, ['ma_don','ten','size','so_luong','don_gia','thanh_tien','chu_ly','topping','duong','da','ghi_chu']);
  if (m.getLastRow() === 1) {
    MENU_DEFAULT.forEach(function(r){ m.appendRow(r); });
  }
  return {menu:m, don:d, ct:c};
}

/* Thêm cột thiếu vào sheet cũ (giữ dữ liệu, chỉ gắn header mới) */
function ensureCols_(sh, header) {
  var lastCol = sh.getLastColumn();
  if (lastCol < 1) return;
  var cur = sh.getRange(1, 1, 1, Math.max(lastCol, 1)).getValues()[0];
  for (var i = cur.length; i < header.length; i++) {
    sh.getRange(1, i + 1).setValue(header[i]);
  }
}

/* ===== BILL CHUNG REALTIME (bản web văn phòng, ?bill=MÃ) ===== */

function stateSheet_() {
  return sheet_('STATE', ['key','value','updated']);
}

function getState_(key) {
  var sh = stateSheet_();
  var n = sh.getLastRow();
  if (n <= 1) return null;
  var rows = sh.getRange(2, 1, n - 1, 3).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(key)) {
      var up = rows[i][2];
      return {value: String(rows[i][1] || ''), updatedMs: up ? new Date(up).getTime() : 0};
    }
  }
  return null;
}

function setState_(key, value) {
  var sh = stateSheet_();
  var n = sh.getLastRow();
  var now = new Date();
  if (n > 1) {
    var rows = sh.getRange(2, 1, n - 1, 1).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(key)) {
        sh.getRange(i + 2, 2, 1, 2).setValues([[String(value).slice(0, 45000), now]]);
        return now.getTime();
      }
    }
  }
  sh.appendRow([String(key), String(value).slice(0, 45000), now]);
  return now.getTime();
}

function doGet(e) {
  ensure_();
  var action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'menu') {
    return json_({ok:true, menu: getMenuList_()});
  }
  if (action === 'state') {
    var st = getState_((e.parameter && e.parameter.key) || '');
    return json_({ok:true, state: st, serverNow: new Date().getTime()});
  }
  return json_({ok:true, msg:'POS UU online. Dung ?action=menu'});
}

function doPost(e) {
  ensure_();
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'save') return saveOrder_(body.order);
    if (body.action === 'state') {
      var t = setState_(body.key || '', body.value || '');
      return json_({ok:true, serverNow: t});
    }
    return json_({ok:false, error:'unknown action'});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function getMenuList_() {
  var rows = sheet_('MENU', []).getDataRange().getValues();
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    if (Number(rows[i][7]) === 0) continue; // active=0 là ẩn
    out.push({
      id: String(rows[i][0]),
      ten: String(rows[i][1]),
      nhom: String(rows[i][2]),
      giaM: Number(rows[i][3]) || 0,
      giaL: Number(rows[i][4]) || 0,
      gia: Number(rows[i][5]) || 0,
      note: String(rows[i][6] || '')
    });
  }
  return out;
}

/* ===== POS chạy NGAY TRONG SHEET (sidebar / dialog, không cần deploy) ===== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🧋 POS Ú Ụ')
    .addItem('Mở POS bán hàng', 'showPOS')
    .addItem('Mở POS cửa sổ lớn', 'showPOSDialog')
    .addToUi();
}

function showPOS() {
  ensure_();
  var html = HtmlService.createHtmlOutputFromFile('POS')
    .setTitle('POS Ú Ụ Milk Tea')
    .setWidth(500);
  SpreadsheetApp.getUi().showSidebar(html);
}

function showPOSDialog() {
  ensure_();
  var html = HtmlService.createHtmlOutputFromFile('POS')
    .setWidth(1100).setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'POS Ú Ụ Milk Tea');
}

/* Gọi từ POS trong Sheet qua google.script.run */
function getMenu() {
  ensure_();
  return getMenuList_();
}

function ctRow_(ma_don, it) {
  return [ma_don, it.ten, it.size, Number(it.so_luong)||0, Number(it.don_gia)||0, Number(it.thanh_tien)||0,
    it.chu_ly||'', it.topping||'', it.duong||'', it.da||'', it.ghi_chu||''];
}

function saveOrder(order) {
  ensure_();
  var s = ensure_();
  s.don.appendRow([order.ma_don, new Date(order.thoi_gian), order.ten_khach||'', order.kenh||'', order.thanh_toan||'',
    Number(order.tam_tinh)||0, Number(order.giam_gia)||0, Number(order.ship)||0, Number(order.tong_cong)||0, order.ghi_chu||'']);
  (order.items||[]).forEach(function(it){
    s.ct.appendRow(ctRow_(order.ma_don, it));
  });
  return {ok:true, ma_don: order.ma_don};
}

function getRecentOrders(limit) {
  ensure_();
  var sh = sheet_('DONHANG', []);
  var n = sh.getLastRow();
  if (n <= 1) return [];
  var take = Math.min(limit || 20, n - 1);
  var rows = sh.getRange(n - take + 1, 1, take, 10).getValues().reverse();
  return rows.map(function(r){ return {ma_don:r[0], thoi_gian:r[1], ten_khach:r[2], tong_cong:r[8]}; });
}
function saveOrder_(o) {
  var s = ensure_();
  s.don.appendRow([o.ma_don, new Date(o.thoi_gian), o.ten_khach||'', o.kenh||'', o.thanh_toan||'',
    Number(o.tam_tinh)||0, Number(o.giam_gia)||0, Number(o.ship)||0, Number(o.tong_cong)||0, o.ghi_chu||'']);
  (o.items||[]).forEach(function(it){
    s.ct.appendRow(ctRow_(o.ma_don, it));
  });
  return json_({ok:true, ma_don:o.ma_don});
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
