/* Ú Ụ Milk Tea — Web Đặt Trà Sữa Chung Nhóm (Live Collaboration)
 * Realtime sync qua Cloudflare Workers + Durable Objects / BroadcastChannel
 * HTML5 Canvas Bill Generator & Automatic Bill Splitter
 */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* ================= 1. MENU DỮ LIỆU GỐC & ĐA QUÁN (MULTI-STORE) ================= */
  var STORE_UU = {
    id: 'uu-milktea',
    name: 'Ú Ụ Milk Tea',
    tagline: 'Trà sữa nhà làm · Chuẩn vị đậm trà',
    icon: '🧋',
    category: 'trasua',
    itemUnit: 'ly',
    isBuiltin: true,
    options: { hasSize: true, hasSugar: true, hasIce: true, hasToppings: true },
    noteChips: [],
    bankInfo: { bank: '', account: '', owner: '' },
    categories: [
      { id: 'trasua', name: 'Trà sữa', icon: '🧋', title: 'Trà sữa đậm vị', sub: 'Hương trà mộc đậm đà hòa quyện cùng sữa thơm béo hảo hạng' },
      { id: 'suatuoi', name: 'Sữa tươi', icon: '🥛', title: 'Sữa tươi & Latte', sub: 'Sữa tươi thanh trùng nguyên chất thơm ngậy dinh dưỡng' },
      { id: 'tra', name: 'Trà mộc', icon: '🍃', title: 'Trà nguyên chất thanh mát', sub: 'Lá trà tươi chọn lọc, ủ lạnh giữ trọn vị thanh tao tự nhiên' },
      { id: 'traitraicay', name: 'Trái cây', icon: '🍊', title: 'Trà trái cây tươi mát', sub: 'Trái cây tự nhiên nhiệt đới ngọt ngào sảng khoái mát lạnh' },
      { id: 'topping', name: 'Topping', icon: '✨', title: 'Topping tươi ngon', sub: 'Topping được chọn lọc kỹ lưỡng, tươi ngon mỗi ngày' }
    ],
    items: [
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
      { id: 'tc09', ten: 'Trà đặc thơm (dứa)', nhom: 'traitraicay', giaM: 27000, giaL: 32000 }
    ],
    toppings: [
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
    ]
  };

  var STORE_VUATRON = {
    id: 'vua-tron',
    name: 'Vua Trộn',
    tagline: 'Mì Quảng · Bún nước tương · Bún mắm nêm · Bánh ướt',
    icon: '🍜',
    category: 'anvat',
    itemUnit: 'phần',
    isBuiltin: true,
    options: { hasSize: true, hasSugar: false, hasIce: false, hasToppings: false },
    noteChips: [
      'không giá (đỗ)',
      'không rau',
      'không dưa leo',
      'không đậu phụ',
      'không tai heo',
      'không ớt',
      'không hành phi',
      'không đậu phộng'
    ],
    bankInfo: { bank: '', account: '', owner: '' },
    categories: [
      {
        id: 'Món trộn',
        name: 'Món trộn',
        icon: '🍜',
        title: 'Món ngon Vua Trộn',
        sub: 'Đồng giá 25k · Tùy chọn 30k / 35k · Ghi chú điều chỉnh topping theo ý'
      }
    ],
    items: [
      {
        id: 'vt01',
        ten: 'Mì Quảng',
        nhom: 'Món trộn',
        giaM: 25000,
        giaL: 30000,
        giaXL: 35000,
        img: 'assets/img/vua-tron/mi-quang.webp',
        note: 'Đồng giá 25k (tùy chọn 30k · 35k)'
      },
      {
        id: 'vt02',
        ten: 'Bún nước tương',
        nhom: 'Món trộn',
        giaM: 25000,
        giaL: 30000,
        giaXL: 35000,
        img: 'assets/img/vua-tron/bun-nuoc-tuong.webp',
        note: 'Đồng giá 25k (tùy chọn 30k · 35k)'
      },
      {
        id: 'vt03',
        ten: 'Bún mắm nêm',
        nhom: 'Món trộn',
        giaM: 25000,
        giaL: 30000,
        giaXL: 35000,
        img: 'assets/img/vua-tron/bun-mam-nem.webp',
        note: 'Đồng giá 25k (tùy chọn 30k · 35k)'
      },
      {
        id: 'vt04',
        ten: 'Bánh ướt',
        nhom: 'Món trộn',
        giaM: 25000,
        giaL: 30000,
        giaXL: 35000,
        img: 'assets/img/vua-tron/banh-uot.webp',
        note: 'Đồng giá 25k (tùy chọn 30k · 35k)'
      }
    ],
    toppings: []
  };

  var BUILTIN_STORES = [ STORE_UU, STORE_VUATRON ];
  var STORE_UU_ITEMS_DEFAULT = (STORE_UU.items || []).slice();
  var STORE_UU_TOPPINGS_DEFAULT = (STORE_UU.toppings || []).slice();
  var currentStore = STORE_UU;
  var MENU = (STORE_UU.items || []).concat(STORE_UU.toppings || []);
  var cart = [];
  var cartDel = {};
  var currentCat = 'trasua';
  var orderCode = newOrderCode();
  var isInitialSyncing = false; // Flag to prevent pushing empty cart on initial load

  var urlBillCode = '';
  var urlStoreId = '';
  try {
    var search = location.search || '';
    var mBill = search.match(/[?&]bill=([^&]+)/);
    if (mBill && decodeURIComponent(mBill[1])) urlBillCode = decodeURIComponent(mBill[1]);
    var mStore = search.match(/[?&]store=([^&]+)/);
    if (mStore && decodeURIComponent(mStore[1])) urlStoreId = decodeURIComponent(mStore[1]);
  } catch (e) {}

  if (urlBillCode) {
    orderCode = urlBillCode;
  }

  function getShareUrl() {
    var base = location.href.split('?')[0];
    var params = [];
    if (orderCode) params.push('bill=' + encodeURIComponent(orderCode));
    if (currentStore && currentStore.id) params.push('store=' + encodeURIComponent(currentStore.id));
    return base + (params.length ? '?' + params.join('&') : '');
  }

  function updateUrlParams() {
    try {
      history.replaceState(null, '', getShareUrl());
    } catch (e) {}
  }

  /* ================= STORE MANAGER LOGIC ================= */
  function sanitizeStore(store) {
    if (!store) return store;
    if (!Array.isArray(store.categories)) store.categories = [];
    if (!Array.isArray(store.items)) store.items = [];
    if (!Array.isArray(store.toppings)) store.toppings = [];
    if (!store.options) {
      store.options = { hasSize: true, hasSugar: true, hasIce: true, hasToppings: true };
    }

    if (store.id === 'uu-milktea') {
      if (!store.items.length && typeof STORE_UU_ITEMS_DEFAULT !== 'undefined') {
        store.items = STORE_UU_ITEMS_DEFAULT.slice();
      }
      if (!store.toppings.length && typeof STORE_UU_TOPPINGS_DEFAULT !== 'undefined') {
        store.toppings = STORE_UU_TOPPINGS_DEFAULT.slice();
      }
      store.options = Object.assign({ hasSize: true, hasSugar: true, hasIce: true, hasToppings: true }, store.options || {});
      store.options.hasToppings = true;
    }

    // Kiểm tra và xử lý quán Vua Trộn hoặc quán có lẫn 'monchinh' và 'Món trộn'
    var catNames = store.categories.map(function (c) { return (c.name || '').trim().toLowerCase(); });
    var catIds = store.categories.map(function (c) { return (c.id || '').trim().toLowerCase(); });

    var hasMonTron = catNames.indexOf('món trộn') !== -1 || catIds.indexOf('món trộn') !== -1 || catIds.indexOf('montron') !== -1;
    var hasMonChinh = catIds.indexOf('monchinh') !== -1 || catNames.indexOf('monchinh') !== -1;

    if (hasMonTron && hasMonChinh) {
      // Loại bỏ category ảo 'monchinh'
      store.categories = store.categories.filter(function (c) {
        var cid = (c.id || '').toLowerCase();
        var cname = (c.name || '').toLowerCase();
        return cid !== 'monchinh' && cname !== 'monchinh';
      });
      // Đưa toàn bộ món có nhom 'monchinh' về 'Món trộn'
      store.items.forEach(function (it) {
        if ((it.nhom || '').toLowerCase() === 'monchinh') {
          it.nhom = 'Món trộn';
        }
      });
    } else if (!hasMonTron && hasMonChinh && (store.id === 'vua-tron' || store.name === 'Vua Trộn')) {
      store.categories.forEach(function (c) {
        if ((c.id || '').toLowerCase() === 'monchinh' || (c.name || '').toLowerCase() === 'monchinh') {
          c.id = 'Món trộn';
          c.name = 'Món trộn';
          c.title = 'Món ngon Vua Trộn';
          c.sub = 'Đồng giá 25k · Tùy chọn 30k / 35k · Ghi chú điều chỉnh topping theo ý';
          c.icon = '🍜';
        }
      });
      store.items.forEach(function (it) {
        if ((it.nhom || '').toLowerCase() === 'monchinh') {
          it.nhom = 'Món trộn';
        }
      });
    }

    // Khử trùng lặp danh mục (theo tên hoặc ID)
    var seen = {};
    var cleanCats = [];
    store.categories.forEach(function (c) {
      var key = (c.name || c.id || '').trim().toLowerCase();
      if (!key) return;
      if (!seen[key]) {
        seen[key] = true;
        cleanCats.push(c);
      }
    });
    store.categories = cleanCats;

    // Đảm bảo mọi item đều thuộc về 1 category hợp lệ
    if (store.categories.length > 0) {
      var validCatKeys = store.categories.map(function (c) { return (c.name || c.id || '').trim().toLowerCase(); });
      store.items.forEach(function (it) {
        var k = (it.nhom || '').trim().toLowerCase();
        if (k !== 'topping' && validCatKeys.indexOf(k) === -1) {
          it.nhom = store.categories[0].name || store.categories[0].id;
        }
      });
    }

    return store;
  }

  function getCustomStores() {
    try {
      var raw = localStorage.getItem('office_order_custom_stores');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          var needResave = false;
          parsed = parsed.map(function (st) {
            var rawBefore = JSON.stringify({ c: st.categories || [], i: (st.items || []).map(function (x) { return x.nhom; }), t: st.toppings || [], opt: st.options || {} });
            sanitizeStore(st);
            var rawAfter = JSON.stringify({ c: st.categories || [], i: (st.items || []).map(function (x) { return x.nhom; }), t: st.toppings || [], opt: st.options || {} });
            if (rawBefore !== rawAfter) needResave = true;
            return st;
          });
          if (needResave) {
            saveCustomStores(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  }

  function saveCustomStores(list) {
    try {
      localStorage.setItem('office_order_custom_stores', JSON.stringify(list));
    } catch (e) {}
  }

  var PENDING_STORE_TTL_MS = 25000;

  function getPendingMap(storageKey) {
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      var map = JSON.parse(raw) || {};
      var now = Date.now();
      var changed = false;
      Object.keys(map).forEach(function (k) {
        if (now - (Number(map[k]) || 0) > PENDING_STORE_TTL_MS) {
          delete map[k];
          changed = true;
        }
      });
      if (changed) localStorage.setItem(storageKey, JSON.stringify(map));
      return map;
    } catch (e) {
      return {};
    }
  }

  function markStorePendingDelete(storeId) {
    if (!storeId) return;
    try {
      var m = getPendingMap('office_order_pending_deletes');
      m[storeId] = Date.now();
      localStorage.setItem('office_order_pending_deletes', JSON.stringify(m));
      var s = getPendingMap('office_order_pending_saves');
      if (s[storeId]) {
        delete s[storeId];
        localStorage.setItem('office_order_pending_saves', JSON.stringify(s));
      }
    } catch (e) {}
  }

  function clearStorePendingDelete(storeId) {
    if (!storeId) return;
    try {
      var m = getPendingMap('office_order_pending_deletes');
      if (m[storeId]) {
        delete m[storeId];
        localStorage.setItem('office_order_pending_deletes', JSON.stringify(m));
      }
    } catch (e) {}
  }

  function isStorePendingDelete(storeId) {
    var m = getPendingMap('office_order_pending_deletes');
    return !!m[storeId];
  }

  function markStorePendingSave(storeId) {
    if (!storeId) return;
    try {
      var m = getPendingMap('office_order_pending_saves');
      m[storeId] = Date.now();
      localStorage.setItem('office_order_pending_saves', JSON.stringify(m));
      clearStorePendingDelete(storeId);
    } catch (e) {}
  }

  function clearStorePendingSave(storeId) {
    if (!storeId) return;
    try {
      var m = getPendingMap('office_order_pending_saves');
      if (m[storeId]) {
        delete m[storeId];
        localStorage.setItem('office_order_pending_saves', JSON.stringify(m));
      }
    } catch (e) {}
  }

  function isStorePendingSave(storeId) {
    var m = getPendingMap('office_order_pending_saves');
    return !!m[storeId];
  }

  function getDeletedBuiltins() {
    try {
      var raw = localStorage.getItem('office_order_deleted_builtins');
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveDeletedBuiltins(arr) {
    try {
      localStorage.setItem('office_order_deleted_builtins', JSON.stringify(arr || []));
    } catch (e) {}
  }

  /* Đồng bộ danh sách quán từ Google Sheet (2 chiều: bao gồm cả xóa từ Sheet và xóa từ Client) */
  function syncStoresFromSheet(isSilent) {
    var apiUrl = (typeof api === 'function' ? api() : (typeof DEFAULT_API !== 'undefined' ? DEFAULT_API : ''));
    if (!apiUrl) return;
    var fetchUrl = apiUrl + (apiUrl.indexOf('?') === -1 ? '?' : '&') + 'action=stores&t=' + Date.now();
    fetch(fetchUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.ok && Array.isArray(data.stores)) {
          var localCustoms = getCustomStores();
          var localCustomMap = {};
          localCustoms.forEach(function (st) {
            if (st && st.id) localCustomMap[st.id] = st;
          });

          // Lọc các quán hợp lệ trên Sheet (bỏ qua quán đã đánh dấu xóa hoặc đang chờ xóa từ client)
          var validSheetStores = data.stores.filter(function (st) {
            if (!st || !st.id) return false;
            if (st.deleted || st.active === 0 || st.name === '__DELETED__' || st.category === '__DELETED__') return false;
            if (isStorePendingDelete(st.id)) return false;
            return true;
          });

          var sheetStoreMap = {};
          var nextCustoms = [];
          var deletedBuiltins = getDeletedBuiltins();

          validSheetStores.forEach(function (sheetStore) {
            var hadMonChinh = JSON.stringify(sheetStore).indexOf('monchinh') !== -1;
            sanitizeStore(sheetStore);
            if (hadMonChinh && sheetStore.id === 'vua-tron') {
              pushStoreToSheet(sheetStore);
            }
            sheetStoreMap[sheetStore.id] = sheetStore;

            var bIdx = -1;
            for (var i = 0; i < BUILTIN_STORES.length; i++) {
              if (BUILTIN_STORES[i].id === sheetStore.id) { bIdx = i; break; }
            }
            if (bIdx !== -1) {
              var oldItems = BUILTIN_STORES[bIdx].items || [];
              var oldToppings = BUILTIN_STORES[bIdx].toppings || [];
              var oldNoteChips = BUILTIN_STORES[bIdx].noteChips || [];
              Object.assign(BUILTIN_STORES[bIdx], sheetStore);
              if ((!sheetStore.items || !sheetStore.items.length) && oldItems.length) {
                BUILTIN_STORES[bIdx].items = oldItems;
              }
              if ((!sheetStore.toppings || !sheetStore.toppings.length) && oldToppings.length) {
                BUILTIN_STORES[bIdx].toppings = oldToppings;
              }
              if ((!sheetStore.noteChips || !sheetStore.noteChips.length) && oldNoteChips.length) {
                BUILTIN_STORES[bIdx].noteChips = oldNoteChips;
              }
              // Nếu quán builtin có mặt trên Sheet (và không nằm trong pending delete), gỡ khỏi danh sách đã xóa
              var dIdx = deletedBuiltins.indexOf(sheetStore.id);
              if (dIdx !== -1) deletedBuiltins.splice(dIdx, 1);
            } else {
              var prevCustom = localCustomMap[sheetStore.id];
              if (prevCustom && !isStorePendingSave(sheetStore.id)) {
                var oldCItems = prevCustom.items || [];
                var oldCToppings = prevCustom.toppings || [];
                var oldCNoteChips = prevCustom.noteChips || [];
                var merged = Object.assign({}, prevCustom, sheetStore);
                if ((!sheetStore.items || !sheetStore.items.length) && oldCItems.length) {
                  merged.items = oldCItems;
                }
                if ((!sheetStore.toppings || !sheetStore.toppings.length) && oldCToppings.length) {
                  merged.toppings = oldCToppings;
                }
                if ((!sheetStore.noteChips || !sheetStore.noteChips.length) && oldCNoteChips.length) {
                  merged.noteChips = oldCNoteChips;
                }
                nextCustoms.push(merged);
              } else if (prevCustom && isStorePendingSave(sheetStore.id)) {
                nextCustoms.push(prevCustom);
              } else {
                nextCustoms.push(sheetStore);
              }
            }

            // Cập nhật ngay store đang active nếu trùng id
            if (currentStore && currentStore.id === sheetStore.id) {
              var oldActiveItems = currentStore.items || [];
              var oldActiveToppings = currentStore.toppings || [];
              var oldActiveChips = currentStore.noteChips || [];
              Object.assign(currentStore, sheetStore);
              if ((!sheetStore.items || !sheetStore.items.length) && oldActiveItems.length) {
                currentStore.items = oldActiveItems;
              }
              if ((!sheetStore.toppings || !sheetStore.toppings.length) && oldActiveToppings.length) {
                currentStore.toppings = oldActiveToppings;
              }
              if ((!sheetStore.noteChips || !sheetStore.noteChips.length) && oldActiveChips.length) {
                currentStore.noteChips = oldActiveChips;
              }
              if (currentStore.id === 'uu-milktea') {
                if (!currentStore.items || !currentStore.items.length) currentStore.items = STORE_UU_ITEMS_DEFAULT.slice();
                if (!currentStore.toppings || !currentStore.toppings.length) currentStore.toppings = STORE_UU_TOPPINGS_DEFAULT.slice();
                if (!currentStore.options) currentStore.options = { hasSize: true, hasSugar: true, hasIce: true, hasToppings: true };
                currentStore.options.hasToppings = true;
                MENU = (currentStore.items || []).concat(currentStore.toppings || []);
              }
              updateStoreBranding();
            }
          });

          // Giữ lại các quán vừa mới lưu trên máy nhưng request POST lên Sheet chưa kịp hoàn tất
          localCustoms.forEach(function (st) {
            if (!st || !st.id) return;
            if (!sheetStoreMap[st.id] && isStorePendingSave(st.id) && !isStorePendingDelete(st.id)) {
              nextCustoms.push(st);
            }
          });

          // Kiểm tra quán builtin phụ (như vua-tron): nếu bị xóa khỏi Sheet thì đánh dấu ẩn
          BUILTIN_STORES.forEach(function (bst) {
            if (bst.id !== 'uu-milktea' && !sheetStoreMap[bst.id] && !isStorePendingSave(bst.id)) {
              if (deletedBuiltins.indexOf(bst.id) === -1) {
                deletedBuiltins.push(bst.id);
              }
            }
          });
          saveDeletedBuiltins(deletedBuiltins);

          saveCustomStores(nextCustoms);
          renderStoreListGrid();

          // Nếu quán đang mở đã bị xóa từ Sheet -> quay về quán mặc định uu-milktea
          var allNow = getAllStores();
          var activeStillExists = currentStore && allNow.some(function (s) { return s.id === currentStore.id; });
          if (!activeStillExists) {
            switchStore('uu-milktea', false);
          } else if (urlStoreId && (!currentStore || currentStore.id !== urlStoreId)) {
            var target = getStoreById(urlStoreId);
            if (target && target.id === urlStoreId) {
              switchStore(target, false);
            }
          } else if (currentStore && (!MENU || !MENU.length)) {
            switchStore(currentStore.id, false);
          }

          if (!isSilent) showToast('✓ Đã đồng bộ ' + allNow.length + ' quán từ Google Sheet!');
        }
      })
      .catch(function (err) {
        if (!isSilent) showToast('Không thể kết nối Google Sheet: ' + (err.message || 'Lỗi mạng'));
      });
  }

  /* Đẩy quán mới / cập nhật lên Google Sheet */
  function pushStoreToSheet(storeObj) {
    var apiUrl = (typeof api === 'function' ? api() : (typeof DEFAULT_API !== 'undefined' ? DEFAULT_API : ''));
    if (!apiUrl || !storeObj || !storeObj.id) return;
    markStorePendingSave(storeObj.id);
    var delBuiltins = getDeletedBuiltins();
    var dbIdx = delBuiltins.indexOf(storeObj.id);
    if (dbIdx !== -1) {
      delBuiltins.splice(dbIdx, 1);
      saveDeletedBuiltins(delBuiltins);
    }
    try {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'save_store', store: storeObj })
      })
        .then(function () { clearStorePendingSave(storeObj.id); })
        .catch(function () {});
    } catch (e) {}
  }

  /* Xóa quán trên Google Sheet (hỗ trợ cả bản Apps Script mới và fallback bản cũ) */
  function deleteStoreFromSheet(storeId) {
    if (!storeId || storeId === 'uu-milktea') return;
    markStorePendingDelete(storeId);
    var delBuiltins = getDeletedBuiltins();
    if (delBuiltins.indexOf(storeId) === -1) {
      delBuiltins.push(storeId);
      saveDeletedBuiltins(delBuiltins);
    }
    var apiUrl = (typeof api === 'function' ? api() : (typeof DEFAULT_API !== 'undefined' ? DEFAULT_API : ''));
    if (!apiUrl) return;
    try {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete_store', id: storeId })
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.ok) {
            clearStorePendingDelete(storeId);
          } else {
            // Fallback cho trường hợp Google Apps Script chưa redeploy action delete_store
            return fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'save_store',
                store: { id: storeId, name: '__DELETED__', category: '__DELETED__', deleted: true, active: 0, categories: [], items: [], toppings: [] }
              })
            }).then(function () { clearStorePendingDelete(storeId); });
          }
        })
        .catch(function () {});
    } catch (e) {}
  }

  function getAllStores() {
    var customs = getCustomStores();
    var delBuiltins = getDeletedBuiltins();
    var map = {};
    BUILTIN_STORES.forEach(function (st) {
      if (st.id !== 'uu-milktea' && (delBuiltins.indexOf(st.id) !== -1 || isStorePendingDelete(st.id))) return;
      sanitizeStore(st);
      map[st.id] = Object.assign({}, st);
    });
    customs.forEach(function (st) {
      if (!st || !st.id) return;
      if (st.deleted || st.name === '__DELETED__' || st.category === '__DELETED__' || isStorePendingDelete(st.id)) return;
      if (st.id !== 'uu-milktea' && delBuiltins.indexOf(st.id) !== -1) return;
      sanitizeStore(st);
      map[st.id] = Object.assign(map[st.id] || {}, st);
      if (st.id === 'uu-milktea') {
        if (!map[st.id].toppings || !map[st.id].toppings.length) {
          map[st.id].toppings = STORE_UU_TOPPINGS_DEFAULT.slice();
        }
        if (!map[st.id].items || !map[st.id].items.length) {
          map[st.id].items = STORE_UU_ITEMS_DEFAULT.slice();
        }
        if (!map[st.id].options) map[st.id].options = {};
        map[st.id].options.hasToppings = true;
      }
    });
    var list = [];
    Object.keys(map).forEach(function (k) { list.push(map[k]); });
    return list;
  }

  function getStoreById(id) {
    var stores = getAllStores();
    for (var i = 0; i < stores.length; i++) {
      if (stores[i].id === id) return stores[i];
    }
    return STORE_UU;
  }

  function switchStore(storeOrId, broadcast) {
    var store = typeof storeOrId === 'string' ? getStoreById(storeOrId) : storeOrId;
    if (!store) store = STORE_UU;
    sanitizeStore(store);

    currentStore = store;
    try {
      localStorage.setItem('office_order_active_store_id', currentStore.id);
    } catch (e) {}

    // Nếu là quán Ú Ụ mà items hoặc toppings bị rỗng thì lấy fallback gốc
    if (currentStore.id === 'uu-milktea') {
      if (!currentStore.items || !currentStore.items.length) {
        currentStore.items = STORE_UU_ITEMS_DEFAULT.slice();
      }
      if (!currentStore.toppings || !currentStore.toppings.length) {
        currentStore.toppings = STORE_UU_TOPPINGS_DEFAULT.slice();
      }
      if (!currentStore.options) currentStore.options = { hasSize: true, hasSugar: true, hasIce: true, hasToppings: true };
      currentStore.options.hasToppings = true;
    }

    var allItems = (currentStore.items || []).concat(currentStore.toppings || []);
    MENU = allItems.slice();

    if (currentStore.categories && currentStore.categories.length) {
      var foundCat = currentStore.categories.find(function (c) {
        return c.id === currentCat || c.name === currentCat;
      });
      if (foundCat) {
        currentCat = foundCat.id;
      } else {
        currentCat = currentStore.categories[0].id;
      }
    } else {
      currentCat = 'all';
    }

    updateStoreBranding();
    renderCategoryTabs();
    renderMenu();
    updateUrlParams();

    if (currentStore.id === 'uu-milktea') {
      fetchMenuFromSheet();
    }

    if (broadcast) {
      schedulePush();
    }
  }

  function getCategorySvg(catId, catName, catIcon, size) {
    var sz = size || 18;
    if (catIcon && typeof catIcon === 'string' && catIcon.indexOf('<svg') !== -1) return catIcon;

    var id = (catId || '').toLowerCase();
    var name = (catName || '').toLowerCase();
    var ic = (catIcon || '');

    if (id === 'trasua' || name.indexOf('trà sữa') !== -1 || ic === '🧋') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="currentColor"><path d="M7 6l1.2 13.2c.1 1.5 1.4 2.8 3 2.8h1.6c1.6 0 2.9-1.3 3-2.8L17 6H7zm7.5 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 5h14v2H5V5zm8-4h-2l-1 4h4l-1-4z"/></svg>';
    }
    if (id === 'suatuoi' || name.indexOf('sữa tươi') !== -1 || ic === '🥛') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8v4H8z"/><path d="M6 6h12l1 15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 6z"/><line x1="6" y1="11" x2="18" y2="11"/></svg>';
    }
    if (id === 'tra' || name.indexOf('trà') !== -1 || ic === '🍃') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>';
    }
    if (id === 'traitraicay' || name.indexOf('trái cây') !== -1 || name.indexOf('nước') !== -1 || ic === '🍊' || ic === '🥤') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 5V2"/><path d="M12 5c2-1 4-1 6 0"/></svg>';
    }
    if (id === 'topping' || name.indexOf('topping') !== -1 || ic === '✨') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 5.6L20 10l-4.2 4 1.2 5.8-5-3-5 3 1.2-5.8L4 10l5.6-2.4L12 2z"/></svg>';
    }
    if (name.indexOf('cơm') !== -1 || ic === '🍱') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M7 20h10"/><path d="M9 11a3 3 0 0 1 6 0"/><line x1="19" y1="3" x2="15" y2="9"/><line x1="21" y1="5" x2="17" y2="10"/></svg>';
    }
    if (name.indexOf('bún') !== -1 || name.indexOf('phở') !== -1 || name.indexOf('mì') !== -1 || name.indexOf('hủ tiếu') !== -1 || ic === '🍜') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M6 19h12"/><path d="M8 8V4"/><path d="M12 8V3"/><path d="M16 8V5"/></svg>';
    }
    if (name.indexOf('cà phê') !== -1 || name.indexOf('cafe') !== -1 || ic === '☕') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>';
    }
    if (name.indexOf('bánh') !== -1 || ic === '🥖' || ic === '🫓') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6"/><path d="M7 10c1 1 3 1 4 0"/><path d="M13 10c1 1 3 1 4 0"/></svg>';
    }
    if (name.indexOf('ăn vặt') !== -1 || ic === '🥢' || ic === '🍗') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="3"/><circle cx="12" cy="14" r="3"/><line x1="12" y1="2" x2="12" y2="22"/></svg>';
    }
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 5.6L20 10l-4.2 4 1.2 5.8-5-3-5 3 1.2-5.8L4 10l5.6-2.4L12 2z"/></svg>';
  }

  function getStoreSvg(st, size) {
    var sz = size || 26;
    if (!st) return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
    var cat = st.category || '';
    var name = (st.name || '').toLowerCase();
    var icon = st.icon || '';

    if (typeof icon === 'string' && icon.indexOf('<svg') !== -1) return icon;

    if (st.id === 'uu-milktea' || cat === 'trasua' || name.indexOf('trà sữa') !== -1 || icon === '🧋') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="currentColor"><path d="M7 6l1.2 13.2c.1 1.5 1.4 2.8 3 2.8h1.6c1.6 0 2.9-1.3 3-2.8L17 6H7zm7.5 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 5h14v2H5V5zm8-4h-2l-1 4h4l-1-4z"/></svg>';
    }
    if (cat === 'bunpho' || name.indexOf('trộn') !== -1 || name.indexOf('bún') !== -1 || name.indexOf('phở') !== -1 || name.indexOf('mì') !== -1 || icon === '🍜') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M6 19h12"/><path d="M8 8V4"/><path d="M12 8V3"/><path d="M16 8V5"/></svg>';
    }
    if (cat === 'comtrua' || name.indexOf('cơm') !== -1 || icon === '🍱') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M7 20h10"/><path d="M9 11a3 3 0 0 1 6 0"/><line x1="19" y1="3" x2="15" y2="9"/><line x1="21" y1="5" x2="17" y2="10"/></svg>';
    }
    if (cat === 'cafe' || name.indexOf('cà phê') !== -1 || name.indexOf('cafe') !== -1 || icon === '☕') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>';
    }
    if (name.indexOf('bánh') !== -1 || icon === '🥖' || icon === '🫓') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6"/><path d="M7 10c1 1 3 1 4 0"/><path d="M13 10c1 1 3 1 4 0"/></svg>';
    }
    if (cat === 'anvat' || name.indexOf('ăn vặt') !== -1 || icon === '🍗' || icon === '🥢') {
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="3"/><circle cx="12" cy="14" r="3"/><line x1="12" y1="2" x2="12" y2="22"/></svg>';
    }
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  }

  function updateStoreBranding() {
    if (!currentStore) return;

    var sbLogo = $('sidebarLogoImg');
    var sbEmoji = $('sidebarEmojiIcon');
    var sbName = $('sidebarStoreName');
    var sbTagline = $('sidebarStoreTagline');

    if (currentStore.id === 'uu-milktea') {
      if (sbLogo) { sbLogo.style.display = 'block'; sbLogo.src = 'assets/img/opt/logo.webp'; }
      if (sbEmoji) sbEmoji.style.display = 'none';
    } else {
      if (sbLogo) sbLogo.style.display = 'none';
      if (sbEmoji) {
        sbEmoji.style.display = 'flex';
        sbEmoji.innerHTML = getStoreSvg(currentStore, 26);
      }
    }
    if (sbName) sbName.textContent = currentStore.name;
    if (sbTagline) sbTagline.textContent = currentStore.tagline || (currentStore.category === 'comtrua' ? 'Cơm văn phòng' : 'Ăn uống thả ga');

    var bpEmoji = $('bannerStoreEmoji');
    var bpName = $('bannerStoreName');
    if (bpEmoji) bpEmoji.innerHTML = getStoreSvg(currentStore, 16);
    if (bpName) bpName.textContent = currentStore.name;

    document.title = currentStore.name + ' · Office Order';
  }

  function renderCategoryTabs() {
    var nav = $('tabs');
    if (!nav || !currentStore) return;
    nav.innerHTML = '';

    var cats = currentStore.categories || [];
    var foundActive = cats.some(function (c) { return c.id === currentCat || c.name === currentCat; });
    if (!foundActive && cats.length) {
      currentCat = cats[0].id;
    }

    cats.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'tab';
      var isActive = (cat.id === currentCat || cat.name === currentCat);
      btn.className = 'v-tab' + (isActive ? ' is-active' : '');
      btn.dataset.cat = cat.id;

      var iconSvg = getCategorySvg(cat.id, cat.name, cat.icon, 18);
      btn.innerHTML =
        '<span class="v-tab-icon">' + iconSvg + '</span>' +
        '<span class="v-tab-text">' + esc(cat.name) + '</span>';

      btn.onclick = function () {
        document.querySelectorAll('#tabs .v-tab').forEach(function (x) { x.classList.remove('is-active'); });
        btn.classList.add('is-active');
        currentCat = cat.id;
        renderMenu();
      };
      nav.appendChild(btn);
    });
  }

  function parseMenuText(text, defaultCategory) {
    if (!text || !text.trim()) return [];
    var lines = text.split('\n');
    var items = [];
    var curCategory = defaultCategory || 'Món chính';
    var counter = 1;

    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;

      var catHeader = line.match(/^\[(.*?)\]$/) || line.match(/^={2,}\s*(.*?)\s*={2,}$/) || line.match(/^(.*?):$/) || line.match(/^#+\s*(.*?)$/);
      if (catHeader) {
        curCategory = catHeader[1].trim();
        return;
      }

      var priceMatch = line.match(/(\d+[\.,]?\d*)\s*(k|K|đ|d|dong|nghìn|ngan)?(?:\s*[-–\/]\s*(\d+[\.,]?\d*)\s*(k|K|đ)?)?$/i);
      var itemName = line;
      var priceM = 0;
      var priceL = 0;

      if (priceMatch) {
        var p1Raw = priceMatch[1].replace(/[\.,]/g, '');
        var num1 = parseInt(p1Raw, 10) || 0;
        if (priceMatch[2] && priceMatch[2].toLowerCase() === 'k' || num1 < 1000) num1 = num1 * 1000;
        priceM = num1;

        if (priceMatch[3]) {
          var p2Raw = priceMatch[3].replace(/[\.,]/g, '');
          var num2 = parseInt(p2Raw, 10) || 0;
          if (num2 < 1000) num2 = num2 * 1000;
          priceL = num2;
        }

        itemName = line.substring(0, priceMatch.index).trim();
        itemName = itemName.replace(/[-–—:]+$/, '').trim();
      }

      if (!itemName) return;

      items.push({
        id: 'item_' + Date.now().toString(36) + '_' + (counter++),
        ten: itemName,
        nhom: curCategory,
        giaM: priceM,
        giaL: priceL
      });
    });

    return items;
  }

  function parseToppingsText(text) {
    if (!text || !text.trim()) return [];
    var lines = text.split('\n');
    var toppings = [];
    var counter = 1;

    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;

      var match = line.match(/^(.*?)\s*[-–—:]?\s*(\d+[\.,]?\d*)\s*(k|K|đ)?$/i);
      if (match) {
        var name = match[1].trim();
        var rawNum = match[2].replace(/[\.,]/g, '');
        var num = parseInt(rawNum, 10) || 0;
        if (match[3] || num < 1000) num = num * 1000;
        if (name && num > 0) {
          toppings.push({
            id: 'tp_' + Date.now().toString(36) + '_' + (counter++),
            ten: name,
            nhom: 'topping',
            gia: num
          });
        }
      }
    });

    return toppings;
  }

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
    'tc09': 'assets/img/products/28._Trà_đắc_thơm_v3_20261014152238.jpg',
    'vt01': 'assets/img/vua-tron/mi-quang.webp',
    'vt02': 'assets/img/vua-tron/bun-nuoc-tuong.webp',
    'vt03': 'assets/img/vua-tron/bun-mam-nem.webp',
    'vt04': 'assets/img/vua-tron/banh-uot.webp',
    'item_mwvu29ew_1': 'assets/img/banh-trang-34/banh-trang-tron.webp',
    'item_mwvu29ew_2': 'assets/img/banh-trang-34/banh-trang-cham.webp',
    'item_mwvu29ew_3': 'assets/img/banh-trang-34/banh-trang-mo-hanh.webp',
    'item_mwvu29ew_4': 'assets/img/banh-trang-34/banh-trang-cuon.webp',
    'item_mwvu29ew_5': 'assets/img/banh-trang-34/banh-trang-deo-tron.webp',
    'item_mwvu29ew_6': 'assets/img/banh-trang-34/banh-trang-deo-cuon-lac-kho-bo.webp',
    'item_mwvu29ew_7': 'assets/img/banh-trang-34/banh-trang-deo-mo-hanh-sate-top-mo.webp',
    'item_mwvu29ew_8': 'assets/img/banh-trang-34/tra-tac.webp',
    'item_mwvu29ew_9': 'assets/img/banh-trang-34/tra-chanh.webp',
    'item_mwvu29ew_10': 'assets/img/banh-trang-34/cam-vat.webp',
    'item_mwvu29ew_11': 'assets/img/banh-trang-34/da-me.webp',
    'item_mwvu29ew_12': 'assets/img/banh-trang-34/sting.webp'
  };

  var PRODUCT_NAME_IMGS = {
    'banh trang tron': 'assets/img/banh-trang-34/banh-trang-tron.webp',
    'banh trang cham': 'assets/img/banh-trang-34/banh-trang-cham.webp',
    'banh trang mo hanh': 'assets/img/banh-trang-34/banh-trang-mo-hanh.webp',
    'banh trang cuon': 'assets/img/banh-trang-34/banh-trang-cuon.webp',
    'banh trang deo tron': 'assets/img/banh-trang-34/banh-trang-deo-tron.webp',
    'banh trang deo cuon lac kho bo': 'assets/img/banh-trang-34/banh-trang-deo-cuon-lac-kho-bo.webp',
    'banh trang deo mo hanh sate top mo': 'assets/img/banh-trang-34/banh-trang-deo-mo-hanh-sate-top-mo.webp',
    'tra tac': 'assets/img/banh-trang-34/tra-tac.webp',
    'tra chanh': 'assets/img/banh-trang-34/tra-chanh.webp',
    'cam vat': 'assets/img/banh-trang-34/cam-vat.webp',
    'da me': 'assets/img/banh-trang-34/da-me.webp',
    'sting': 'assets/img/banh-trang-34/sting.webp'
  };

  function normalizeImgKey(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function resolveItemImg(m, isTopping) {
    if (!m) return '';
    if (isTopping) return m.img || TOPPING_IMGS[m.id] || '';
    return m.img || PRODUCT_IMGS[m.id] || PRODUCT_NAME_IMGS[normalizeImgKey(m.ten)] || '';
  }

  /* ================= CLIENT IMAGE UPLOAD (CLOUDFLARE WORKER + KV) ================= */
  function getWorkerHttpOrigin() {
    var wsUrl = (typeof FORCE_WS !== 'undefined' && FORCE_WS) ? FORCE_WS : 'wss://uu-pos-live.tuanlee-tech.workers.dev';
    return String(wsUrl).replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:').replace(/\/+$/, '');
  }

  function isUploadedWorkerImgUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return /\/img\/m_[a-z0-9_]+\.(?:webp|jpg|png)(?:\?.*)?$/i.test(url.trim());
  }

  function deleteUploadedImagesFromWorker(urls) {
    var list = (Array.isArray(urls) ? urls : [urls]).filter(isUploadedWorkerImgUrl);
    if (!list.length) return;
    try {
      fetch(getWorkerHttpOrigin() + '/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: list })
      }).catch(function () {});
    } catch (e) {}
  }

  function compressAndCropSquareWebp(file, targetSize) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image/') !== 0) {
        reject(new Error('Vui lòng chọn file ảnh (JPG, PNG, WebP).'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Ảnh gốc quá lớn (tối đa 5MB).'));
        return;
      }
      var size = Number(targetSize) || 800;
      var objUrl = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          URL.revokeObjectURL(objUrl);
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          if (!w || !h) {
            reject(new Error('Không đọc được kích thước ảnh.'));
            return;
          }
          var side = Math.min(w, h);
          var sx = Math.floor((w - side) / 2);
          var sy = Math.floor((h - side) / 2);
          var outSize = Math.min(size, side);
          var canvas = document.createElement('canvas');
          canvas.width = outSize;
          canvas.height = outSize;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, outSize, outSize);
          ctx.drawImage(img, sx, sy, side, side, 0, 0, outSize, outSize);

          canvas.toBlob(function (blob) {
            if (blob && blob.size > 0 && blob.type === 'image/webp') {
              resolve({ blob: blob, contentType: 'image/webp' });
              return;
            }
            canvas.toBlob(function (jpgBlob) {
              if (!jpgBlob || !jpgBlob.size) {
                reject(new Error('Trình duyệt không thể nén ảnh này.'));
                return;
              }
              resolve({ blob: jpgBlob, contentType: 'image/jpeg' });
            }, 'image/jpeg', 0.85);
          }, 'image/webp', 0.82);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(objUrl);
        reject(new Error('Không thể đọc file ảnh này.'));
      };
      img.src = objUrl;
    });
  }

  function uploadMenuItemImage(file, itemObj) {
    return compressAndCropSquareWebp(file, 800).then(function (compressed) {
      var storeId = ($('editStoreId') && $('editStoreId').value) ? $('editStoreId').value : 'new';
      var oldUrl = (itemObj && isUploadedWorkerImgUrl(itemObj.img)) ? itemObj.img : '';
      var qs = '?store=' + encodeURIComponent(storeId) + (oldUrl ? '&old=' + encodeURIComponent(oldUrl) : '');
      return fetch(getWorkerHttpOrigin() + '/api/upload-image' + qs, {
        method: 'POST',
        headers: { 'Content-Type': compressed.contentType },
        body: compressed.blob
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || !res.ok || !res.url) {
            throw new Error((res && res.error) || 'Upload ảnh thất bại.');
          }
          return res;
        });
    });
  }

  // Quản lý Identity người dùng: Bền vững qua localStorage để tắt tab mở lại vẫn sửa được món của mình
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
  var myUids = [];
  try {
    var savedListRaw = localStorage.getItem('uu_pos_uids');
    if (savedListRaw) {
      var parsedUids = JSON.parse(savedListRaw);
      if (Array.isArray(parsedUids)) myUids = parsedUids.filter(Boolean);
    }
    myUid = localStorage.getItem('uu_pos_uid') || sessionStorage.getItem(tabSessionId + '_uid') || '';
  } catch (e) {}
  if (!myUid) {
    myUid = 'u_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }
  if (myUids.indexOf(myUid) === -1) myUids.push(myUid);
  try {
    var tabUid = sessionStorage.getItem(tabSessionId + '_uid');
    if (tabUid && myUids.indexOf(tabUid) === -1) myUids.push(tabUid);
    localStorage.setItem('uu_pos_uid', myUid);
    localStorage.setItem('uu_pos_uids', JSON.stringify(myUids.slice(-20)));
    sessionStorage.setItem(tabSessionId + '_uid', myUid);
  } catch (e) {}

  var myUname = '';
  try {
    myUname = localStorage.getItem('uu_pos_uname') || sessionStorage.getItem(tabSessionId + '_uname') || '';
  } catch (e) {}
  if (!myUname || /^Bạn #?\d+$/.test(myUname)) {
    myUname = getRandomFunName();
    try {
      localStorage.setItem('uu_pos_uname', myUname);
      sessionStorage.setItem(tabSessionId + '_uname', myUname);
    } catch (e) {}
  } else {
    try {
      localStorage.setItem('uu_pos_uname', myUname);
      sessionStorage.setItem(tabSessionId + '_uname', myUname);
    } catch (e) {}
  }

  var myUcolor = '';
  try {
    myUcolor = localStorage.getItem('uu_pos_ucolor') || sessionStorage.getItem(tabSessionId + '_ucolor') || '';
  } catch (e) {}
  if (!myUcolor) {
    myUcolor = USER_PALETTE[Math.floor(Math.random() * USER_PALETTE.length)].bg;
    try {
      localStorage.setItem('uu_pos_ucolor', myUcolor);
      sessionStorage.setItem(tabSessionId + '_ucolor', myUcolor);
    } catch (e) {}
  } else {
    try {
      localStorage.setItem('uu_pos_ucolor', myUcolor);
      sessionStorage.setItem(tabSessionId + '_ucolor', myUcolor);
    } catch (e) {}
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
    var chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    var tail = '';
    for (var i = 0; i < 4; i++) {
      tail += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'U' + tail;
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
    var tops = MENU.filter(function (m) { return m.nhom === 'topping'; });
    if (!tops.length && currentStore && Array.isArray(currentStore.toppings) && currentStore.toppings.length) {
      tops = currentStore.toppings;
    }
    if (!tops.length && currentStore && currentStore.id === 'uu-milktea') {
      tops = STORE_UU_TOPPINGS_DEFAULT || [];
    }
    return tops;
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

  function formatSizeLabel(size, store) {
    if (!size || size === 'TP') return '';
    var st = store || currentStore;
    var isFood = (st && (st.itemUnit === 'phần' || st.category === 'anvat' || st.category === 'comtrua'));
    if (isFood) {
      if (size === 'M') return 'Thường';
      if (size === 'L') return 'Lớn';
      if (size === 'XL') return 'Đặc biệt';
    }
    return size;
  }

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

  /* Kiểm tra quyền chỉnh sửa dòng: chỉ chính chủ (uid thuộc trình duyệt/máy này) mới được sửa hoặc xóa */
  function canEditRow(c) {
    if (!c.uid || c.uid === myUid) return true;
    return myUids.indexOf(c.uid) !== -1;
  }

  var lidSeq = 0;
  function newLid() {
    return myUid.slice(0, 5) + '-' + (++lidSeq) + '-' + Date.now().toString(36);
  }
  function touch(c) {
    isInitialSyncing = false;
    c.rev = (c.rev || 0) + 1;
    c.by = clientId;
  }
  function tomb(c) {
    isInitialSyncing = false;
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

  function wsHttpOrigin() {
    var u = wsUrl().replace(/\/$/, '').replace(/\/bill\/.*$/, '');
    if (u.indexOf('wss://') === 0) return 'https://' + u.slice(6);
    if (u.indexOf('ws://') === 0) return 'http://' + u.slice(5);
    if (/^https?:\/\//.test(u)) return u;
    return '';
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
      note: $('orderNote') ? $('orderNote').value : '',
      hostUid: '',
      hostQr: '',
      hostQrNote: '',
      hostQrs: [],
      hostBank: { bank: '', account: '', owner: '' },
      orderSubmitted: false,
      savedDisc: null,
      savedShip: null,
      paidMap: {},
      payClaimMap: {}
    };
    Object.keys(map).forEach(function (k) {
      if (!F[k]) F[k] = { v: map[k], rev: 0, by: clientId };
    });
  }

  var MAX_HOST_QR_SLOTS = 1;

  function toAsciiTransferName(rawName) {
    if (!rawName) return '';
    return String(rawName)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 26);
  }

  function needsSevqrPrefix(bankCode) {
    var b = String(bankCode || '').trim().toUpperCase();
    return b === 'ICB' || b === 'VIETINBANK' || b === 'CTG' || b === '970415';
  }

  function applyBankMemoPrefix(memoText, bankCode) {
    var des = String(memoText || '').trim();
    if (needsSevqrPrefix(bankCode)) {
      if (!/(^|\s)SEVQR(\s|$)/i.test(des)) {
        des = des ? ('SEVQR ' + des) : 'SEVQR';
      }
    }
    return des;
  }

  function buildMemberTransferMemo(memberName, bankCode) {
    var code = String(orderCode || '').trim().toUpperCase();
    var cleanName = toAsciiTransferName(memberName);
    var base = (code + (cleanName ? (' ' + cleanName) : '')).trim();
    return applyBankMemoPrefix(base, bankCode !== undefined ? bankCode : (getHostBankInfo().bank || ''));
  }

  function buildSePayQrUrl(bankCode, accountNo, amount, memoText) {
    var bank = String(bankCode || '').trim().toUpperCase();
    var acc = String(accountNo || '').replace(/\s+/g, '');
    if (!bank || !acc) return '';
    var params = [
      'acc=' + encodeURIComponent(acc),
      'bank=' + encodeURIComponent(bank)
    ];
    var amt = Math.round(Number(amount) || 0);
    if (amt > 0) params.push('amount=' + encodeURIComponent(String(amt)));
    var des = applyBankMemoPrefix(memoText, bank);
    if (des) params.push('des=' + encodeURIComponent(des));
    params.push('template=compact');
    return 'https://qr.sepay.vn/img?' + params.join('&');
  }

  function normalizeHostBankInfo(rawBank) {
    if (!rawBank || typeof rawBank !== 'object') return { bank: '', account: '', owner: '' };
    var bank = String(rawBank.bank || '').trim().toUpperCase();
    var account = String(rawBank.account || '').replace(/\s+/g, '');
    var owner = toAsciiTransferName(rawBank.owner || '');
    if (!bank || !account) return { bank: '', account: '', owner: '' };
    return { bank: bank, account: account, owner: owner };
  }

  function getHostBankInfo() {
    var hb = (F.hostBank && F.hostBank.v && typeof F.hostBank.v === 'object')
      ? normalizeHostBankInfo(F.hostBank.v)
      : { bank: '', account: '', owner: '' };
    if (hb.bank && hb.account) return hb;
    var slots = (F.hostQrs && Array.isArray(F.hostQrs.v)) ? F.hostQrs.v : [];
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      if (s && s.bank && s.account) {
        return normalizeHostBankInfo({ bank: s.bank, account: s.account, owner: s.owner || '' });
      }
    }
    return { bank: '', account: '', owner: '' };
  }

  function formatHostBankSummary(hb) {
    var info = hb || getHostBankInfo();
    if (!info || !info.bank || !info.account) return '';
    return info.bank + ' - ' + info.account + (info.owner ? (' - ' + info.owner) : '');
  }

  function getQrForMember(memberObj, overrideAmount) {
    var hb = getHostBankInfo();
    var memberName = (memberObj && memberObj.name) ? memberObj.name : '';
    var amt = overrideAmount !== undefined
      ? Math.round(Number(overrideAmount) || 0)
      : Math.round(Number(memberObj && memberObj.finalPay) || 0);
    var memo = buildMemberTransferMemo(memberName);
    if (hb.bank && hb.account) {
      var sepayUrl = buildSePayQrUrl(hb.bank, hb.account, amt, memo);
      return {
        isSePay: true,
        qr: sepayUrl,
        bank: hb.bank,
        account: hb.account,
        owner: hb.owner || '',
        label: hb.bank,
        note: formatHostBankSummary(hb),
        memo: memo,
        amount: amt
      };
    }
    var slots = getHostQrSlots();
    var first = slots[0] || null;
    return {
      isSePay: false,
      qr: first ? first.qr : '',
      bank: '',
      account: '',
      owner: '',
      label: first ? (first.label || 'QR') : 'QR',
      note: first ? (first.note || '') : '',
      memo: memo,
      amount: amt
    };
  }

  function normalizeQrSlotList(rawList, fallbackQr, fallbackNote) {
    var out = [];
    if (Array.isArray(rawList)) {
      rawList.forEach(function (item, idx) {
        if (out.length >= MAX_HOST_QR_SLOTS) return;
        if (!item) return;
        var bInfo = normalizeHostBankInfo({ bank: item.bank, account: item.account, owner: item.owner });
        var qrSrc = String(item.qr || '');
        if (bInfo.bank && bInfo.account) {
          qrSrc = buildSePayQrUrl(bInfo.bank, bInfo.account, 0, orderCode);
        }
        if (!qrSrc) return;
        out.push({
          id: String(item.id || ('qr_' + idx)),
          label: String(item.label || bInfo.bank || '').trim(),
          qr: qrSrc,
          note: String(item.note || (bInfo.bank ? formatHostBankSummary(bInfo) : '') || '').trim(),
          bank: bInfo.bank,
          account: bInfo.account,
          owner: bInfo.owner
        });
      });
    }
    if (!out.length && fallbackQr) {
      out.push({
        id: 'qr_0',
        label: '',
        qr: String(fallbackQr),
        note: String(fallbackNote || '').trim(),
        bank: '',
        account: '',
        owner: ''
      });
    }
    return out;
  }

  function getHostQrSlots() {
    var list = (F.hostQrs && Array.isArray(F.hostQrs.v)) ? F.hostQrs.v : [];
    var fallbackQr = (F.hostQr && F.hostQr.v) ? String(F.hostQr.v) : '';
    var fallbackNote = (F.hostQrNote && F.hostQrNote.v) ? String(F.hostQrNote.v).trim() : '';
    var hb = (F.hostBank && F.hostBank.v && typeof F.hostBank.v === 'object')
      ? normalizeHostBankInfo(F.hostBank.v)
      : { bank: '', account: '', owner: '' };
    if (list.length > 0) {
      return normalizeQrSlotList(list, fallbackQr, fallbackNote);
    }
    if (!fallbackQr && hb.bank && hb.account) {
      return [{
        id: 'qr_0',
        label: hb.bank,
        qr: buildSePayQrUrl(hb.bank, hb.account, 0, orderCode),
        note: formatHostBankSummary(hb),
        bank: hb.bank,
        account: hb.account,
        owner: hb.owner
      }];
    }
    return normalizeQrSlotList([], fallbackQr, fallbackNote);
  }

  function applyHostQrSlots(rawSlots, keepRevOnlyFromSheet) {
    var clean = normalizeQrSlotList(rawSlots, '', '');
    var first = clean[0] || null;
    var bInfo = first ? normalizeHostBankInfo({ bank: first.bank, account: first.account, owner: first.owner }) : { bank: '', account: '', owner: '' };
    if (keepRevOnlyFromSheet) {
      F.hostQrs = { v: clean, rev: Math.max(1, (F.hostQrs && F.hostQrs.rev) || 0), by: 'sheet' };
      F.hostQr = { v: first ? first.qr : '', rev: Math.max(1, (F.hostQr && F.hostQr.rev) || 0), by: 'sheet' };
      F.hostQrNote = { v: first ? first.note : '', rev: Math.max(1, (F.hostQrNote && F.hostQrNote.rev) || 0), by: 'sheet' };
      if (bInfo.bank && bInfo.account) {
        F.hostBank = { v: bInfo, rev: Math.max(1, (F.hostBank && F.hostBank.rev) || 0), by: 'sheet' };
      }
    } else {
      setSyncedField('hostQrs', clean);
      setSyncedField('hostQr', first ? first.qr : '');
      setSyncedField('hostQrNote', first ? first.note : '');
      setSyncedField('hostBank', bInfo);
    }
    return clean;
  }

  function formatQrSlotDisplayName(slot, idx) {
    if (slot && slot.label && slot.label.trim()) return slot.label.trim();
    return 'QR #' + (idx + 1);
  }

  function setSyncedField(k, v, extra) {
    isInitialSyncing = false;
    var cur = F[k];
    var rev = cur ? ((cur.rev || 0) + 1) : 1;
    F[k] = Object.assign({ v: v, rev: rev, by: clientId }, extra || {});
  }

  function isMyUid(uid) {
    if (!uid) return false;
    return uid === myUid || myUids.indexOf(uid) !== -1;
  }

  function getHostUid() {
    return (F.hostUid && F.hostUid.v) ? String(F.hostUid.v).trim() : '';
  }

  function getHostName() {
    return (F.customer && F.customer.v ? String(F.customer.v).trim() : '') || ($('customer') ? $('customer').value.trim() : '');
  }

  function hasHostAssigned() {
    return !!(getHostUid() || getHostName());
  }

  function isCurrentHost() {
    var huid = getHostUid();
    if (huid) return isMyUid(huid);
    var hname = getHostName();
    if (hname && myUname && hname.toLowerCase() === myUname.trim().toLowerCase()) return true;
    return false;
  }

  function canActAsHostOrOpen() {
    return !hasHostAssigned() || isCurrentHost();
  }

  function isOrderSubmitted() {
    return !!(F.orderSubmitted && F.orderSubmitted.v === true);
  }

  function hasPendingHostFeeChanges() {
    if (!isOrderSubmitted()) return false;
    var curDisc = Math.max(0, Number(F.disc && F.disc.v !== undefined ? F.disc.v : ($('discount') ? parseMoney($('discount').value) : 0)) || 0);
    var curShip = Math.max(0, Number(F.ship && F.ship.v !== undefined ? F.ship.v : ($('shipFee') ? parseMoney($('shipFee').value) : 0)) || 0);
    var sDisc = (F.savedDisc && F.savedDisc.v !== null && F.savedDisc.v !== undefined) ? Math.max(0, Number(F.savedDisc.v) || 0) : null;
    var sShip = (F.savedShip && F.savedShip.v !== null && F.savedShip.v !== undefined) ? Math.max(0, Number(F.savedShip.v) || 0) : null;
    if (sDisc === null && sShip === null) return false;
    return (sDisc !== null && curDisc !== sDisc) || (sShip !== null && curShip !== sShip);
  }

  function buildSheetQrPayloadString(slots) {
    if (!slots || !slots.length) return '';
    var hb = getHostBankInfo();
    return JSON.stringify({
      hostQr: slots[0].qr || '',
      hostQrNote: slots[0].note || '',
      hostBank: hb,
      hostQrs: slots
    });
  }

  function applySheetQrValue(rawVal, fallbackNote, fromAsyncChunk) {
    if (!rawVal || getHostQrSlots().length > 0) return false;
    var str = String(rawVal);
    var parsedSlots = null;
    if (str.charAt(0) === '{') {
      try {
        var obj = JSON.parse(str);
        if (obj && obj.hostBank && obj.hostBank.bank && obj.hostBank.account) {
          var hbNorm = normalizeHostBankInfo(obj.hostBank);
          F.hostBank = { v: hbNorm, rev: Math.max(1, (F.hostBank && F.hostBank.rev) || 0), by: 'sheet' };
        }
        if (obj && (Array.isArray(obj.hostQrs) || obj.hostQr)) {
          parsedSlots = normalizeQrSlotList(obj.hostQrs || [], obj.hostQr || '', obj.hostQrNote || fallbackNote || '');
        }
      } catch (e) {}
    }
    if (!parsedSlots || !parsedSlots.length) {
      parsedSlots = normalizeQrSlotList([], str, fallbackNote || ((F.hostQrNote && F.hostQrNote.v) || ''));
    }
    if (!parsedSlots.length) return false;
    applyHostQrSlots(parsedSlots, true);
    if (fromAsyncChunk) {
      renderCart();
      renderSplitBillIfOpen();
      if (typeof renderPayReminderPanel === 'function') renderPayReminderPanel(false);
      updateHostDropdownUI();
    }
    return true;
  }

  function syncBillServerStateToSheet(submittedFlag) {
    var apiUrl = api();
    if (!apiUrl || !orderCode) return;
    try {
      var qrSlots = getHostQrSlots();
      var qrVal = buildSheetQrPayloadString(qrSlots);
      var qrChunkSize = 44000;
      var useChunks = (qrVal && qrVal.length > qrChunkSize && qrVal.length <= 750000);
      var chunkCount = useChunks ? Math.ceil(qrVal.length / qrChunkSize) : 0;
      var primaryNote = (qrSlots[0] && qrSlots[0].note) ? qrSlots[0].note : ((F.hostQrNote && F.hostQrNote.v) ? String(F.hostQrNote.v) : '');
      var hbInfo = getHostBankInfo();
      var payload = {
        bill: orderCode,
        submitted: !!submittedFlag,
        submittedRev: (F.orderSubmitted && F.orderSubmitted.rev) ? Number(F.orderSubmitted.rev) : (submittedFlag ? 1 : 0),
        hostUid: getHostUid(),
        hostName: getHostName(),
        storeName: currentStore ? currentStore.name : '',
        hostBank: hbInfo,
        hostQrNote: primaryNote,
        hostQr: (!useChunks && qrVal && qrVal.length <= qrChunkSize) ? qrVal : '',
        hostQrChunks: chunkCount,
        paidMap: (F.paidMap && F.paidMap.v && typeof F.paidMap.v === 'object') ? F.paidMap.v : {},
        payClaimMap: (F.payClaimMap && F.payClaimMap.v && typeof F.payClaimMap.v === 'object') ? F.payClaimMap.v : {},
        savedDisc: (F.savedDisc && F.savedDisc.v !== null && F.savedDisc.v !== undefined) ? Number(F.savedDisc.v) : null,
        savedShip: (F.savedShip && F.savedShip.v !== null && F.savedShip.v !== undefined) ? Number(F.savedShip.v) : null,
        updatedAt: Date.now()
      };
      if (useChunks) {
        for (var ci = 0; ci < chunkCount; ci++) {
          var part = qrVal.slice(ci * qrChunkSize, (ci + 1) * qrChunkSize);
          fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
              action: 'state',
              key: 'BILLQR_' + orderCode + '_' + ci,
              value: part
            })
          }).catch(function () {});
        }
      }
      fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'state',
          key: 'BILL_' + orderCode,
          value: JSON.stringify(payload)
        })
      }).catch(function () {});
    } catch (e) {}
  }

  function applyLoadedSheetHostQr(qrDataUrl, fallbackNote) {
    applySheetQrValue(qrDataUrl, fallbackNote, true);
  }

  function fetchBillServerStateFromSheet() {
    var apiUrl = api();
    if (!apiUrl || !orderCode) return;
    var targetBill = orderCode;
    var sep = apiUrl.indexOf('?') === -1 ? '?' : '&';
    fetch(apiUrl + sep + 'action=state&key=' + encodeURIComponent('BILL_' + targetBill) + '&t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (orderCode !== targetBill) return;
        if (!res || !res.ok || !res.state || !res.state.value) return;
        var s = null;
        try { s = JSON.parse(res.state.value); } catch (e) { return; }
        if (!s || typeof s !== 'object') return;
        if (s.bill && s.bill !== targetBill) return;

        var changed = false;
        var sheetSubRev = Number(s.submittedRev) || (s.submitted ? 1 : 0);
        var curSubRev = (F.orderSubmitted && F.orderSubmitted.rev) ? Number(F.orderSubmitted.rev) : 0;
        var curSubVal = isOrderSubmitted();

        if (sheetSubRev > curSubRev || (sheetSubRev === 0 && s.submitted && !curSubVal)) {
          F.orderSubmitted = {
            v: !!s.submitted,
            rev: Math.max(1, sheetSubRev),
            by: 'sheet'
          };
          changed = true;
        }
        if (s.savedDisc !== undefined && s.savedDisc !== null && (!F.savedDisc || F.savedDisc.v === null || F.savedDisc.v === undefined)) {
          F.savedDisc = { v: Number(s.savedDisc) || 0, rev: Math.max(1, (F.savedDisc && F.savedDisc.rev) || 0), by: 'sheet' };
          changed = true;
        } else if (isOrderSubmitted() && (!F.savedDisc || F.savedDisc.v === null || F.savedDisc.v === undefined)) {
          var initD = Math.max(0, Number(F.disc && F.disc.v !== undefined ? F.disc.v : ($('discount') ? parseMoney($('discount').value) : 0)) || 0);
          F.savedDisc = { v: initD, rev: 1, by: 'sheet' };
        }
        if (s.savedShip !== undefined && s.savedShip !== null && (!F.savedShip || F.savedShip.v === null || F.savedShip.v === undefined)) {
          F.savedShip = { v: Number(s.savedShip) || 0, rev: Math.max(1, (F.savedShip && F.savedShip.rev) || 0), by: 'sheet' };
          changed = true;
        } else if (isOrderSubmitted() && (!F.savedShip || F.savedShip.v === null || F.savedShip.v === undefined)) {
          var initS = Math.max(0, Number(F.ship && F.ship.v !== undefined ? F.ship.v : ($('shipFee') ? parseMoney($('shipFee').value) : 0)) || 0);
          F.savedShip = { v: initS, rev: 1, by: 'sheet' };
        }
        if (s.hostUid && (!F.hostUid || !F.hostUid.v)) {
          F.hostUid = { v: s.hostUid, rev: Math.max(1, (F.hostUid && F.hostUid.rev) || 0), by: 'sheet' };
          changed = true;
        }
        if (s.hostName && (!F.customer || !F.customer.v)) {
          F.customer = { v: s.hostName, rev: Math.max(1, (F.customer && F.customer.rev) || 0), by: 'sheet' };
          if ($('customer')) $('customer').value = s.hostName;
          changed = true;
        }
        if (s.hostQrNote && (!F.hostQrNote || !F.hostQrNote.v)) {
          F.hostQrNote = { v: s.hostQrNote, rev: Math.max(1, (F.hostQrNote && F.hostQrNote.rev) || 0), by: 'sheet' };
          changed = true;
        }
        if (s.hostBank && s.hostBank.bank && s.hostBank.account && (!F.hostBank || !F.hostBank.v || !F.hostBank.v.account)) {
          F.hostBank = { v: normalizeHostBankInfo(s.hostBank), rev: Math.max(1, (F.hostBank && F.hostBank.rev) || 0), by: 'sheet' };
          changed = true;
        }
        if (s.hostQr && getHostQrSlots().length === 0) {
          if (applySheetQrValue(s.hostQr, s.hostQrNote || '', false)) {
            changed = true;
          }
        } else if (Number(s.hostQrChunks) > 0 && getHostQrSlots().length === 0) {
          var cnt = Math.min(18, Number(s.hostQrChunks));
          var chunkPromises = [];
          for (var i = 0; i < cnt; i++) {
            chunkPromises.push(
              fetch(apiUrl + sep + 'action=state&key=' + encodeURIComponent('BILLQR_' + targetBill + '_' + i) + '&t=' + Date.now())
                .then(function (r) { return r.json(); })
                .then(function (cr) { return (cr && cr.ok && cr.state && cr.state.value) ? String(cr.state.value) : ''; })
                .catch(function () { return ''; })
            );
          }
          Promise.all(chunkPromises).then(function (parts) {
            if (orderCode !== targetBill) return;
            if (parts.length === cnt && parts.every(function (p) { return !!p; })) {
              applyLoadedSheetHostQr(parts.join(''), s.hostQrNote || '');
            }
          });
        }
        if (s.paidMap && typeof s.paidMap === 'object') {
          var curPm = (F.paidMap && F.paidMap.v && typeof F.paidMap.v === 'object')
            ? Object.assign({}, F.paidMap.v) : {};
          var pmRev = (F.paidMap && F.paidMap.rev) ? Number(F.paidMap.rev) : 0;
          var pmChanged = false;
          Object.keys(s.paidMap).forEach(function (k) {
            if (pmRev === 0 || curPm[k] === undefined) {
              if (curPm[k] !== s.paidMap[k]) {
                curPm[k] = s.paidMap[k];
                pmChanged = true;
              }
            }
          });
          if (pmChanged) {
            F.paidMap = { v: curPm, rev: Math.max(1, pmRev), by: 'sheet' };
            changed = true;
          }
        }
        if (s.payClaimMap && typeof s.payClaimMap === 'object') {
          var curCm = (F.payClaimMap && F.payClaimMap.v && typeof F.payClaimMap.v === 'object')
            ? Object.assign({}, F.payClaimMap.v) : {};
          var cmRev = (F.payClaimMap && F.payClaimMap.rev) ? Number(F.payClaimMap.rev) : 0;
          var cmChanged = false;
          Object.keys(s.payClaimMap).forEach(function (k) {
            if (cmRev === 0 || curCm[k] === undefined) {
              if (JSON.stringify(curCm[k]) !== JSON.stringify(s.payClaimMap[k])) {
                curCm[k] = s.payClaimMap[k];
                cmChanged = true;
              }
            }
          });
          if (cmChanged) {
            F.payClaimMap = { v: curCm, rev: Math.max(1, cmRev), by: 'sheet' };
            changed = true;
          }
        }

        tryRestoreMyHostQr(false);
        if (changed) {
          applying = true;
          try {
            writeInputs();
            renderCart();
            renderSplitBillIfOpen();
            if (typeof renderPayReminderPanel === 'function') renderPayReminderPanel(false);
          } finally {
            applying = false;
          }
          if (cart.length > 0 && ws && wsOk) {
            try {
              ws.send(JSON.stringify({ type: 'state', bill: orderCode, wrap: snapshot(), from: clientId }));
            } catch (e) {}
          }
        }
      })
      .catch(function () {});
  }

  function getMyQrStorageKey() {
    return 'uu_host_qr_' + (myUid || 'default');
  }

  function loadMySavedHostQr() {
    try {
      var raw = localStorage.getItem(getMyQrStorageKey());
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (parsed.bank && parsed.account && !parsed.qr && (!Array.isArray(parsed.slots) || !parsed.slots.length)) {
        var bNorm = normalizeHostBankInfo(parsed);
        if (bNorm.bank && bNorm.account) {
          var sUrl = buildSePayQrUrl(bNorm.bank, bNorm.account, 0, orderCode);
          var sSlot = [{
            id: 'qr_0',
            label: bNorm.bank,
            qr: sUrl,
            note: formatHostBankSummary(bNorm),
            bank: bNorm.bank,
            account: bNorm.account,
            owner: bNorm.owner
          }];
          return { qr: sUrl, note: sSlot[0].note, label: bNorm.bank, bank: bNorm.bank, account: bNorm.account, owner: bNorm.owner, slots: sSlot };
        }
      }
      if (Array.isArray(parsed.slots) && parsed.slots.length) {
        var norm = normalizeQrSlotList(parsed.slots, parsed.qr || '', parsed.note || '');
        if (!norm.length) return null;
        return {
          qr: norm[0].qr,
          note: norm[0].note || '',
          label: norm[0].label || '',
          bank: norm[0].bank || '',
          account: norm[0].account || '',
          owner: norm[0].owner || '',
          slots: norm
        };
      }
      if (parsed.qr) {
        var single = [{
          id: 'qr_0',
          label: String(parsed.label || '').trim(),
          qr: String(parsed.qr),
          note: String(parsed.note || '').trim(),
          bank: String(parsed.bank || '').trim(),
          account: String(parsed.account || '').trim(),
          owner: String(parsed.owner || '').trim()
        }];
        return { qr: single[0].qr, note: single[0].note, label: single[0].label, bank: single[0].bank, account: single[0].account, owner: single[0].owner, slots: single };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function tryRestoreMyHostQr(pushAfter) {
    if (!isCurrentHost()) return;
    if (getHostQrSlots().length > 0) return;
    var saved = loadMySavedHostQr();
    if (saved && saved.slots && saved.slots.length) {
      applyHostQrSlots(saved.slots, false);
      if (pushAfter) schedulePush();
    } else if (saved && saved.qr) {
      applyHostQrSlots([{ id: 'qr_0', label: saved.label || '', qr: saved.qr, note: saved.note || '' }], false);
      if (pushAfter) schedulePush();
    }
  }

  function writeInputs() {
    if ($('customer')) $('customer').value = (F.customer && F.customer.v) || '';
    if ($('channel')) $('channel').value = (F.channel && F.channel.v) || 'Ship';
    if ($('payMethod')) $('payMethod').value = (F.pay && F.pay.v) || 'Chuyển khoản';
    if ($('discount')) $('discount').value = formatMoneyStr(F.disc ? F.disc.v : 0);
    if ($('shipFee')) $('shipFee').value = formatMoneyStr(F.ship ? F.ship.v : 0);
    if ($('orderNote')) $('orderNote').value = (F.note && F.note.v) || '';
    updateHostDropdownUI();
  }

  /* Cập nhật giao diện Checkbox Dropdown Người đại diện nhận đơn */
  function getOrderParticipants() {
    var map = {};
    var unitStr = (currentStore && currentStore.itemUnit) || 'món';
    var now = Date.now();

    function upsertParticipant(uid, name, ucolor, opts) {
      var nm = (name || '').trim();
      if (!nm) return;
      var key = uid ? ('u:' + uid) : ('n:' + nm.toLowerCase());
      if (uid && !map[key]) {
        var nameOnlyKey = 'n:' + nm.toLowerCase();
        if (map[nameOnlyKey] && !map[nameOnlyKey].uid) {
          map[key] = map[nameOnlyKey];
          map[key].uid = uid;
          delete map[nameOnlyKey];
        }
      }
      if (!map[key]) {
        map[key] = {
          uid: uid || '',
          name: nm,
          ucolor: ucolor || '#0A7259',
          count: 0,
          isMe: false,
          isOnline: false
        };
      }
      if (opts) {
        if (opts.countAdd) map[key].count += opts.countAdd;
        if (opts.isMe) map[key].isMe = true;
        if (opts.isOnline) map[key].isOnline = true;
        if (ucolor) map[key].ucolor = ucolor;
        if (nm) map[key].name = nm;
      }
    }

    // 1. Những người đã đặt món trong giỏ hàng
    cart.forEach(function (c) {
      var nm = (c.uname || c.owner || '').trim();
      if (!nm) return;
      var isMeRow = isMyUid(c.uid) || (!c.uid && myUname && nm.toLowerCase() === myUname.trim().toLowerCase());
      var col = isMeRow ? myUcolor : (c.ucolor || '#0A7259');
      var addN = (c.size !== 'TP') ? (c.qty || 1) : 1;
      upsertParticipant(c.uid || '', nm, col, { countAdd: addN, isMe: isMeRow });
    });

    // 2. Bản thân người dùng hiện tại
    if (myUname && myUname.trim()) {
      upsertParticipant(myUid, myUname.trim(), myUcolor || '#0A7259', { isMe: true, isOnline: true });
    }

    // 3. Những người đang online trong phòng bill
    Object.keys(onlineUsers).forEach(function (cid) {
      var u = onlineUsers[cid];
      if (!u || !u.uname || (now - (u.lastSeen || 0) > 12000)) return;
      var uUid = u.uid || '';
      upsertParticipant(uUid, u.uname.trim(), u.ucolor || '#0A7259', { isOnline: true, isMe: isMyUid(uUid) });
    });

    // 4. Nếu đang có tên đại diện đã chọn từ trước mà chưa nằm trong map thì vẫn hiển thị
    var curHostUid = getHostUid();
    var curHost = getHostName();
    if (curHost || curHostUid) {
      var hk = curHostUid ? ('u:' + curHostUid) : ('n:' + curHost.toLowerCase());
      if (!map[hk] && curHost) {
        var matchedKey = Object.keys(map).find(function (k) {
          return map[k].name.toLowerCase() === curHost.toLowerCase();
        });
        if (!matchedKey) {
          upsertParticipant(curHostUid, curHost, '#0A7259', {});
        }
      }
    }

    return Object.keys(map).map(function (k) {
      var item = map[k];
      var metaParts = [];
      if (item.isMe) metaParts.push('Bạn');
      if (item.count > 0) metaParts.push(item.count + ' ' + unitStr);
      else if (!item.isMe) metaParts.push('Đang xem');
      item.metaText = metaParts.join(' · ');
      return item;
    });
  }

  function updateHostDropdownUI() {
    var lbl = $('hostDropdownLabel');
    var btn = $('hostDropdownBtn');
    var wrap = $('hostDropdownWrap');
    var titleEl = $('hostDropdownTitle');
    var subEl = $('hostDropdownSub');
    var toolsBar = $('hostToolsBar');
    var statusBadge = $('orderSubmittedBadge');
    var hostOnlyActions = $('hostOnlyActions');
    var btnQrLbl = $('btnHostQrLabel');
    var btnQr = $('btnOpenHostQr');
    var btnPayTracker = $('btnTogglePayTracker');
    var btnPayTrackerLbl = $('btnPayTrackerLabel');
    var payTrackerBox = $('hostPayTracker');
    var btnUrgePay = $('btnOpenUrgePay');
    var btnSave = $('btnSave');
    var btnSaveTxt = $('btnSaveText');
    var btnQuickQr = $('btnQuickHostQr');
    var btnQuickQrTxt = $('btnQuickHostQrText');
    var btnModalPay = $('btnModalUrgePay');
    var btnMemberQr = $('btnViewHostQrsMember');
    var btnMemberQrLbl = $('btnMemberQrLabel');

    var hostUid = getHostUid();
    var hostName = getHostName();
    var assigned = !!(hostUid || hostName);
    var amHost = isCurrentHost();
    var submitted = isOrderSubmitted();
    var qrSlots = getHostQrSlots();
    var hasQr = qrSlots.length > 0;

    var paidCnt = 0;
    var pendingClaimsCnt = 0;
    var totalPeopleCnt = 0;
    var unpaidCnt = 0;
    var unpaidDebtorsCnt = 0;
    if (cart.length > 0 && typeof computeBillSplit === 'function') {
      var sp = computeBillSplit();
      totalPeopleCnt = sp.people.length;
      paidCnt = sp.people.filter(function (p) { return p.paid; }).length;
      pendingClaimsCnt = sp.people.filter(function (p) { return !p.paid && p.claimed; }).length;
      unpaidCnt = sp.people.filter(function (p) { return !p.paid && p.finalPay > 0; }).length;
      unpaidDebtorsCnt = sp.people.filter(function (p) { return !p.isHost && !p.paid && p.finalPay > 0; }).length;
    }
    var allPaid = !!(submitted && totalPeopleCnt > 0 && unpaidCnt === 0);
    var allDebtorsPaid = !!(submitted && totalPeopleCnt > 0 && unpaidDebtorsCnt === 0);

    if (lbl) {
      if (hostName) {
        lbl.textContent = 'Đại diện: ' + hostName + (amHost ? ' (Bạn)' : '');
        lbl.classList.remove('is-placeholder');
      } else {
        lbl.textContent = 'Chọn đại diện nhóm…';
        lbl.classList.add('is-placeholder');
      }
    }

    // Nếu đã có đại diện -> chỉ đại diện hiện tại được chuyển key
    var canChangeHost = !assigned || amHost;
    if (btn) {
      btn.classList.toggle('is-locked', !canChangeHost);
      btn.title = canChangeHost
        ? (assigned ? 'Bạn đang là Đại diện — bấm để chuyển key cho thành viên khác' : 'Chọn 1 thành viên làm người đại diện nhận đơn')
        : ('Chỉ Đại diện hiện tại (' + (hostName || 'Host') + ') mới được chuyển key');
    }
    if (wrap) wrap.classList.toggle('is-host-me', assigned && amHost);
    if (titleEl) {
      titleEl.textContent = assigned ? 'Chuyển key người đại diện' : 'Chọn người đại diện nhận đơn';
    }
    if (subEl) {
      subEl.textContent = assigned
        ? ('Hiện tại: ' + (hostName || 'Đại diện') + ' · Tồn tại duy nhất 1 người')
        : 'Tồn tại duy nhất 1 người đại diện';
    }

    if (toolsBar) {
      toolsBar.hidden = (!assigned && !submitted && !hasQr);
    }
    if (statusBadge) {
      statusBadge.classList.toggle('is-submitted', submitted);
      var iconLockSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
      var iconClockSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
      statusBadge.innerHTML = (submitted ? iconLockSvg : iconClockSvg) +
        '<span id="orderSubmittedBadgeText">' + (submitted ? 'Đã chốt & lưu Sheet' : 'Đang đặt món') + '</span>';
    }
    if (hostOnlyActions) {
      hostOnlyActions.hidden = !(assigned && amHost);
    }
    var hbActive = getHostBankInfo();
    if (btnMemberQr) {
      btnMemberQr.hidden = !(hasQr && !(assigned && amHost));
      if (btnMemberQrLbl) {
        btnMemberQrLbl.textContent = (hbActive.bank && hbActive.account) ? 'Quét QR trả tiền' : 'Xem QR đại diện';
      }
    }
    var btnUrgeFin = $('btnUrgeFinalize');
    if (btnUrgeFin) {
      var showUrgeFin = !!(assigned && !amHost && !submitted && cart.length > 0);
      btnUrgeFin.hidden = !showUrgeFin;
      if (showUrgeFin && typeof updateUrgeFinalizeCooldownUI === 'function') {
        updateUrgeFinalizeCooldownUI();
      }
    }
    if (submitted && typeof hideHostFinalizeBanner === 'function') {
      hideHostFinalizeBanner();
    }
    if (btnQrLbl) {
      btnQrLbl.textContent = hasQr
        ? ((hbActive.bank && hbActive.account) ? ('SePay ' + hbActive.bank + ' ✓') : 'Đã có QR ✓')
        : 'Thêm TK / QR';
    }
    if (btnQr) {
      btnQr.classList.toggle('has-qr', hasQr);
    }
    if (btnQuickQr) {
      btnQuickQr.hidden = !(assigned && amHost);
      if (btnQuickQrTxt) btnQuickQrTxt.textContent = hasQr ? 'Sửa TK / QR' : 'Thêm TK / QR';
    }

    // Nút Hối trả tiền & Thu tiền: chỉ hiện khi đã Chốt & Lưu Sheet; tự disable khi không còn thành viên nào chưa trả
    if (btnUrgePay) {
      btnUrgePay.hidden = !(assigned && amHost && submitted);
      btnUrgePay.disabled = allDebtorsPaid;
      btnUrgePay.classList.remove('is-disabled');
      btnUrgePay.title = allDebtorsPaid
        ? 'Tất cả thành viên đã thanh toán đủ'
        : 'Gửi thông báo riêng tới những thành viên chưa trả tiền';
      var urgePayLbl = $('btnUrgePayLabel');
      if (urgePayLbl) {
        urgePayLbl.textContent = allDebtorsPaid ? 'Đã thu đủ ✓' : 'Hối trả tiền';
      }
    }
    if (btnPayTracker) {
      var showTrackerBtn = !!(assigned && amHost && submitted && cart.length > 0);
      btnPayTracker.hidden = !showTrackerBtn;
      btnPayTracker.classList.toggle('is-all-paid', allPaid);
      btnPayTracker.classList.toggle('has-pending-claim', showTrackerBtn && pendingClaimsCnt > 0);
      if (!showTrackerBtn && payTrackerBox) payTrackerBox.hidden = true;
      if (showTrackerBtn && btnPayTrackerLbl) {
        btnPayTrackerLbl.textContent = pendingClaimsCnt > 0
          ? ('Thu tiền (' + paidCnt + '/' + totalPeopleCnt + ' · ' + pendingClaimsCnt + ' chờ duyệt)')
          : ('Thu tiền (' + paidCnt + '/' + totalPeopleCnt + (allPaid ? ' ✓' : '') + ')');
      }
      if (payTrackerBox) {
        btnPayTracker.classList.toggle('is-open', !payTrackerBox.hidden);
      }
    }
    if (payTrackerBox && !payTrackerBox.hidden && typeof renderHostPayTracker === 'function') {
      renderHostPayTracker();
    }
    if (btnModalPay) {
      btnModalPay.hidden = !(assigned && amHost && submitted);
      btnModalPay.disabled = allDebtorsPaid;
      btnModalPay.title = allDebtorsPaid ? 'Tất cả thành viên đã thanh toán đủ' : 'Hối các bạn chưa trả tiền';
    }

    // Khóa nút Chốt & Lưu Sheet khi non-host HOẶC đơn đã chốt xong (trừ khi Đại diện vừa sửa Giảm giá / Phí ship cần cập nhật lại)
    var canHostUpdateFees = !!(submitted && assigned && amHost && hasPendingHostFeeChanges());
    if (btnSave) {
      var lockNonHost = assigned && !amHost;
      var disableSaveBtn = lockNonHost || (submitted && !canHostUpdateFees);
      btnSave.disabled = disableSaveBtn;
      btnSave.classList.toggle('is-host-locked', lockNonHost);
      btnSave.classList.toggle('is-locked-member', lockNonHost);
      btnSave.classList.toggle('is-submitted-done', submitted && !canHostUpdateFees);
      btnSave.classList.toggle('is-dirty-update', canHostUpdateFees);
      if (btnSaveTxt) {
        btnSaveTxt.textContent = canHostUpdateFees
          ? 'Cập nhật lại vào Sheet'
          : (submitted ? 'Đã chốt & lưu Sheet' : 'Chốt & Lưu Sheet');
      }
      btnSave.title = canHostUpdateFees
        ? 'Giảm giá / Phí ship vừa thay đổi — bấm để cập nhật lại lên Google Sheet'
        : (submitted
          ? 'Đơn đã chốt & lưu lên Google Sheet'
          : (lockNonHost
            ? ('Chỉ Đại diện (' + (hostName || 'Host') + ') mới được Chốt & Lưu Sheet')
            : 'Chốt đơn hiện tại & lưu vào Google Sheet'));
    }

    // Vô hiệu hóa nút Hối đặt hàng sau khi đơn đã Chốt & Lưu Sheet
    if ($('btnUrgeTopbar')) {
      $('btnUrgeTopbar').disabled = submitted;
      if (submitted) $('btnUrgeTopbar').title = 'Đơn đã chốt & lưu Sheet';
    }
    if ($('mobileUrgeBtn')) {
      $('mobileUrgeBtn').disabled = submitted;
    }

    // Khóa UI chỉnh sửa giỏ hàng và ô điều chỉnh khi đơn đã chốt (Đại diện vẫn được sửa Giảm giá & Phí ship)
    var cartSec = $('cartSection');
    if (cartSec) {
      cartSec.classList.toggle('is-order-submitted', submitted);
    }
    ['discount', 'shipFee'].forEach(function (fid) {
      var el = $(fid);
      if (!el) return;
      var lockFee = (assigned && !amHost) || (submitted && !amHost);
      el.disabled = lockFee;
      el.title = lockFee
        ? ('Chỉ Đại diện (' + (hostName || 'Host') + ') mới chỉnh được Giảm giá / Phí ship')
        : (submitted ? 'Đại diện có thể chỉnh sửa Giảm giá / Phí ship rồi bấm Cập nhật lại vào Sheet' : '');
    });
    ['channel', 'payMethod', 'orderNote'].forEach(function (fid) {
      var el = $(fid);
      if (el) el.disabled = submitted;
    });

    var panel = $('hostDropdownPanel');
    if (panel && !panel.hidden) {
      renderHostParticipantsList();
    }
  }

  function renderHostPayTracker() {
    var box = $('hostPayTracker');
    var list = $('hostPayTrackerList');
    if (!box || !list) return;
    if (!hasHostAssigned() || !isCurrentHost() || !isOrderSubmitted() || !cart.length) {
      box.hidden = true;
      return;
    }
    var split = computeBillSplit();
    var paidCnt = split.people.filter(function (p) { return p.paid; }).length;
    var pendingCnt = split.people.filter(function (p) { return !p.paid && p.claimed; }).length;
    var allPaidNow = (split.people.length > 0 && paidCnt === split.people.length);
    if ($('btnPayTrackerLabel')) {
      $('btnPayTrackerLabel').textContent = pendingCnt > 0
        ? ('Thu tiền (' + paidCnt + '/' + split.people.length + ' · ' + pendingCnt + ' chờ duyệt)')
        : ('Thu tiền (' + paidCnt + '/' + split.people.length + (allPaidNow ? ' ✓' : '') + ')');
    }
    list.innerHTML = '';
    split.people.forEach(function (p) {
      var isClaimed = !!(!p.paid && p.claimed);
      var row = document.createElement('div');
      row.className = 'host-pay-tracker-row' + (p.paid ? ' is-row-paid' : (isClaimed ? ' is-row-claimed' : ''));

      var u = document.createElement('div');
      u.className = 'host-pay-tracker-user';
      var dot = document.createElement('span');
      dot.className = 'host-p-avatar';
      dot.style.backgroundColor = p.ucolor;
      dot.textContent = userInitial(p.name);
      var nm = document.createElement('span');
      nm.className = 'hp-name';
      nm.textContent = p.name + (isClaimed ? ' (đã báo CK)' : '');
      u.appendChild(dot);
      u.appendChild(nm);

      var amt = document.createElement('span');
      amt.className = 'host-pay-tracker-amt';
      amt.textContent = fmt(p.finalPay);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-paid-toggle' + (p.paid ? ' is-paid' : (isClaimed ? ' is-claimed' : ''));
      btn.textContent = p.paid ? '✓ Đã trả' : (isClaimed ? '✓ Duyệt CK' : 'Chưa trả');
      btn.title = isClaimed ? 'Check app ngân hàng xong bấm để xác nhận ĐÃ NHẬN' : '';
      btn.onclick = function (e) {
        e.stopPropagation();
        toggleMemberPaid(p);
      };

      row.appendChild(u);
      row.appendChild(amt);
      if (getHostQrSlots().length > 0 && p.finalPay > 0 && !p.paid) {
        var qrBtn = document.createElement('button');
        qrBtn.type = 'button';
        qrBtn.className = 'btn-person-qr';
        qrBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="21" y2="21"/></svg><span>QR</span>';
        qrBtn.title = 'Mở mã QR thanh toán riêng của ' + p.name;
        qrBtn.onclick = function (e) {
          e.stopPropagation();
          openMemberPersonalQrModal(p);
        };
        row.appendChild(qrBtn);
      }
      if (isClaimed) {
        var rej = document.createElement('button');
        rej.type = 'button';
        rej.className = 'btn-claim-reject';
        rej.textContent = '✕';
        rej.title = 'Chưa thấy tiền vào bank — trả lại trạng thái Chưa trả';
        rej.onclick = function (e) {
          e.stopPropagation();
          rejectMemberPayClaim(p);
        };
        row.appendChild(rej);
      }
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function renderHostParticipantsList() {
    var listEl = $('hostParticipantsList');
    if (!listEl) return;
    listEl.innerHTML = '';

    var curHostUid = getHostUid();
    var curHost = getHostName();
    var assigned = !!(curHostUid || curHost);
    var amHost = isCurrentHost();
    var participants = getOrderParticipants();

    if (!participants.length) {
      listEl.innerHTML = '<div class="host-empty-hint">Chưa có người tham gia nào trong đơn.</div>';
      return;
    }

    participants.forEach(function (p) {
      var isSelected = curHostUid
        ? (p.uid && p.uid === curHostUid)
        : (curHost && curHost.toLowerCase() === p.name.toLowerCase());
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'host-participant-item' + (isSelected ? ' is-selected' : '');
      var metaLabel = isSelected ? ('★ Đang làm Đại diện' + (p.metaText ? ' · ' + p.metaText : '')) : p.metaText;
      btn.innerHTML =
        '<span class="host-chk">' + (isSelected ? '✓' : '') + '</span>' +
        '<span class="host-p-avatar" style="background-color:' + esc(p.ucolor) + ';">' + esc(userInitial(p.name)) + '</span>' +
        '<span class="host-p-name">' + esc(p.name) + '</span>' +
        (metaLabel ? '<span class="host-p-meta">' + esc(metaLabel) + '</span>' : '');

      btn.onclick = function (e) {
        e.stopPropagation();
        if (assigned && !amHost) {
          showToast('🔒 Chỉ Đại diện hiện tại (' + (curHost || 'Host') + ') mới có quyền chuyển key!');
          return;
        }
        if (isSelected) {
          showToast('Tồn tại duy nhất 1 người đại diện. Chọn thành viên khác để chuyển key!');
          var pClose = $('hostDropdownPanel');
          var tClose = $('hostDropdownBtn');
          if (pClose) pClose.hidden = true;
          if (tClose) tClose.classList.remove('is-open');
          return;
        }
        if (!p.uid) {
          showToast('Thành viên này chưa có định danh online, hãy bảo họ mở trang đặt món để nhận key.');
          return;
        }
        if (assigned && amHost && !confirm('Chuyển quyền Đại diện (key host) cho "' + p.name + '"? Bạn sẽ trở thành thành viên thường.')) {
          return;
        }

        var prevHost = curHostUid;
        setSyncedField('hostUid', p.uid, { prevHostUid: prevHost });
        setSyncedField('customer', p.name);
        if ($('customer')) $('customer').value = p.name;

        if (!isMyUid(p.uid)) {
          applyHostQrSlots([], false);
        } else {
          var myQr = loadMySavedHostQr();
          if (myQr && myQr.slots && myQr.slots.length) {
            applyHostQrSlots(myQr.slots, false);
          } else if (myQr && myQr.qr) {
            applyHostQrSlots([{ id: 'qr_0', label: myQr.label || '', qr: myQr.qr, note: myQr.note || '' }], false);
          } else {
            applyHostQrSlots([], false);
          }
        }

        updateHostDropdownUI();
        renderHostParticipantsList();
        renderCart();
        schedulePush();
        showToast(assigned ? ('Đã chuyển key Đại diện cho ' + p.name) : ('Đã chọn ' + p.name + ' làm Đại diện nhóm!'));

        var panel = $('hostDropdownPanel');
        var trigger = $('hostDropdownBtn');
        if (panel) panel.hidden = true;
        if (trigger) trigger.classList.remove('is-open');
      };

      listEl.appendChild(btn);
    });
  }

  /* ================= ÂM THANH & BROADCAST HỐI ĐẶT HÀNG ================= */
  var URGE_COOLDOWN_MS = 10000;
  var URGE_VOICES = [
    {
      id: '1',
      tag: '🔊 Gắt cực đại',
      text: 'CHỐT ĐƠN! CHỐT ĐƠN ĐI CÁC CON VỢ ƠIIII!!!',
      audio: 'assets/audio/1.mp3'
    },
    {
      id: '2',
      tag: '🔥 Chờ dài cổ',
      text: 'Chốt đơn giùm cái! Các con vợ chờ dài cổ rồi!!!',
      audio: 'assets/audio/2.mp3'
    },
    {
      id: '3',
      tag: '😩 Thở dài bất lực',
      text: 'Haizzz... Đại diện ơi... Order đồ ăn thôi mà sao lâu dữ vậy...',
      audio: 'assets/audio/3.mp3'
    },
    {
      id: '4',
      tag: '🥺 Ngắn gọn nhẹ nhàng',
      text: 'Đại diện... Chốt đơn đi...',
      audio: 'assets/audio/4.mp3'
    },
    {
      id: '5',
      tag: '🍽️ Nhắc khéo thực tế',
      text: 'Đại diện chốt lẹ lên! Đồ ăn không tự mọc ra trên bàn đâu!!!',
      audio: 'assets/audio/5.mp3'
    }
  ];

  var seenUrgeIds = {};
  var urgeCooldownUntil = 0;
  var urgeCooldownTimer = null;
  var selectedUrgeVoiceId = '1';
  var lastReceivedUrgeVoiceId = '1';
  var urgeAudioEl = null;
  var urgePreviewAudioEl = null;
  var previewingVoiceId = null;

  try {
    var savedVoice = localStorage.getItem('uu_urge_voice_id');
    if (savedVoice && URGE_VOICES.some(function (v) { return v.id === savedVoice; })) {
      selectedUrgeVoiceId = savedVoice;
    }
  } catch (e) {}

  function getUrgeVoiceById(id) {
    for (var i = 0; i < URGE_VOICES.length; i++) {
      if (URGE_VOICES[i].id === String(id)) return URGE_VOICES[i];
    }
    return URGE_VOICES[0];
  }

  function urgeStorageKey() {
    return 'uu_urge_until_' + (orderCode || 'default');
  }

  function syncUrgeCooldownFromStorage() {
    urgeCooldownUntil = 0;
    try {
      var stored = Number(localStorage.getItem(urgeStorageKey()) || 0);
      if (stored > Date.now()) {
        urgeCooldownUntil = stored;
      } else {
        localStorage.removeItem(urgeStorageKey());
      }
    } catch (e) {}
    updateUrgeCooldownUI();
  }

  function getUrgeRemainingSec() {
    var rem = urgeCooldownUntil - Date.now();
    return rem > 0 ? Math.ceil(rem / 1000) : 0;
  }

  function startUrgeCooldown(durationMs) {
    var ms = Math.max(0, Number(durationMs) || 0);
    if (ms <= 0) return;
    var nextUntil = Date.now() + ms;
    if (nextUntil > urgeCooldownUntil) {
      urgeCooldownUntil = nextUntil;
      try {
        localStorage.setItem(urgeStorageKey(), String(urgeCooldownUntil));
      } catch (e) {}
    }
    updateUrgeCooldownUI();
    if (!urgeCooldownTimer) {
      urgeCooldownTimer = setInterval(function () {
        if (getUrgeRemainingSec() <= 0) {
          urgeCooldownUntil = 0;
          clearInterval(urgeCooldownTimer);
          urgeCooldownTimer = null;
          try { localStorage.removeItem(urgeStorageKey()); } catch (e) {}
        }
        updateUrgeCooldownUI();
      }, 500);
    }
  }

  function updateUrgeCooldownUI() {
    var sec = getUrgeRemainingSec();
    var isCooling = sec > 0;
    var submitted = isOrderSubmitted();

    var topBtn = $('btnUrgeTopbar');
    var topTxt = $('urgeTopbarText');
    if (topBtn) {
      topBtn.classList.toggle('is-cooldown', isCooling);
      topBtn.disabled = submitted;
    }
    if (topTxt) topTxt.textContent = isCooling ? ('Hối đặt hàng (' + sec + 's)') : 'Hối đặt hàng';

    var mobBtn = $('mobileUrgeBtn');
    var mobTxt = $('mobileUrgeText');
    if (mobBtn) {
      mobBtn.classList.toggle('is-cooldown', isCooling);
      mobBtn.disabled = submitted;
    }
    if (mobTxt) mobTxt.textContent = isCooling ? (sec + 's') : 'Hối';

    var box = $('urgeCooldownBox');
    var boxTxt = $('urgeCooldownText');
    if (box) box.hidden = !isCooling;
    if (boxTxt && isCooling) {
      boxTxt.textContent = 'Cả nhóm vừa phát loa hối xong. Vui lòng đợi ' + sec + 's nữa để tránh spam voice!';
    }

    var sendBtn = $('btnConfirmUrgeSend');
    var sendTxt = $('btnConfirmUrgeText');
    if (sendBtn) sendBtn.disabled = isCooling || submitted;
    if (sendTxt) sendTxt.textContent = isCooling ? ('Đợi ' + sec + 's...') : 'Phát loa hối ngay';
  }

  function stopPreviewAudio() {
    if (urgePreviewAudioEl) {
      try {
        urgePreviewAudioEl.pause();
        urgePreviewAudioEl.currentTime = 0;
      } catch (e) {}
    }
    previewingVoiceId = null;
    updatePreviewButtonsUI();
  }

  function updatePreviewButtonsUI() {
    document.querySelectorAll('.btn-preview-voice').forEach(function (btn) {
      var playing = (previewingVoiceId && btn.dataset.voiceId === previewingVoiceId);
      btn.classList.toggle('is-playing', !!playing);
      btn.textContent = playing ? '⏹ Dừng' : '▶ Nghe thử';
    });
  }

  function togglePreviewVoice(voiceId) {
    if (previewingVoiceId === voiceId) {
      stopPreviewAudio();
      return;
    }
    stopPreviewAudio();
    var voice = getUrgeVoiceById(voiceId);
    previewingVoiceId = voice.id;
    updatePreviewButtonsUI();
    try {
      urgePreviewAudioEl = new Audio(voice.audio);
      urgePreviewAudioEl.onended = function () {
        previewingVoiceId = null;
        updatePreviewButtonsUI();
      };
      urgePreviewAudioEl.onerror = function () {
        previewingVoiceId = null;
        updatePreviewButtonsUI();
        showToast('Không phát được file ' + voice.audio);
      };
      var p = urgePreviewAudioEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          previewingVoiceId = null;
          updatePreviewButtonsUI();
          playSynthesizedUrgeBell();
        });
      }
    } catch (e) {
      previewingVoiceId = null;
      updatePreviewButtonsUI();
    }
  }

  function renderUrgeVoiceList() {
    var list = $('urgeVoiceList');
    if (!list) return;
    list.innerHTML = '';

    URGE_VOICES.forEach(function (v) {
      var isSel = (v.id === selectedUrgeVoiceId);
      var card = document.createElement('div');
      card.className = 'urge-voice-card' + (isSel ? ' is-selected' : '');
      card.innerHTML =
        '<div class="urge-voice-radio"></div>' +
        '<div class="urge-voice-info">' +
          '<div class="urge-voice-top">' +
            '<span class="urge-voice-num">Mẫu #' + esc(v.id) + '</span>' +
            '<span class="urge-voice-tag">' + esc(v.tag) + '</span>' +
          '</div>' +
          '<div class="urge-voice-text">"' + esc(v.text) + '"</div>' +
        '</div>' +
        '<button type="button" class="btn-preview-voice" data-voice-id="' + esc(v.id) + '">▶ Nghe thử</button>';

      card.onclick = function (e) {
        if (e.target.closest('.btn-preview-voice')) return;
        selectedUrgeVoiceId = v.id;
        try { localStorage.setItem('uu_urge_voice_id', selectedUrgeVoiceId); } catch (err) {}
        renderUrgeVoiceList();
      };

      var btnPrev = card.querySelector('.btn-preview-voice');
      if (btnPrev) {
        btnPrev.onclick = function (e) {
          e.stopPropagation();
          selectedUrgeVoiceId = v.id;
          try { localStorage.setItem('uu_urge_voice_id', selectedUrgeVoiceId); } catch (err) {}
          document.querySelectorAll('.urge-voice-card').forEach(function (c, idx) {
            c.classList.toggle('is-selected', URGE_VOICES[idx].id === selectedUrgeVoiceId);
          });
          togglePreviewVoice(v.id);
        };
      }

      list.appendChild(card);
    });

    updatePreviewButtonsUI();
  }

  function openUrgeModal() {
    var modal = $('urgeModal');
    if (!modal) return;
    renderUrgeVoiceList();
    updateUrgeCooldownUI();
    modal.hidden = false;
  }

  function closeUrgeModal() {
    stopPreviewAudio();
    var modal = $('urgeModal');
    if (modal) modal.hidden = true;
  }

  function playSynthesizedUrgeBell() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ctx = new AudioCtx();
      var notes = [
        { freq: 880, start: 0, dur: 0.12 },
        { freq: 1174.66, start: 0.14, dur: 0.12 },
        { freq: 1318.51, start: 0.28, dur: 0.16 },
        { freq: 1760, start: 0.46, dur: 0.32 }
      ];
      notes.forEach(function (n) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.start);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + n.start);
        gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + n.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.start + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.start);
        osc.stop(ctx.currentTime + n.start + n.dur + 0.02);
      });
    } catch (e) {}
  }

  var PAY_CONFIRMED_AUDIO = 'assets/audio/pay-confirmed.mp3';
  var PAY_CONFIRMED_TEXT = 'Cám ơn bà con rất là nhiều ... Đó, tiếng ting ting đó là tiếng gửi tiền vào đó.';
  var PAY_CONFIRMED_DEBOUNCE_MS = 3000;
  var seenPayClaimIds = {};
  var seenPayConfirmIds = {};
  var lastAlertReplayFn = null;
  var activeHostClaimTarget = null;
  var payConfirmedAudioEl = null;
  var payConfirmedAudioPlaying = false;
  var payConfirmedAudioSafetyTimer = null;
  var lastPayConfirmedAudioStartedAt = 0;
  var lastClaimBellAt = 0;
  var recentConfirmedPayers = [];
  var recentConfirmedBatchTimer = null;

  function playSynthesizedClaimBell(forcePlay) {
    var now = Date.now();
    if (!forcePlay && (now - lastClaimBellAt < 1800)) return;
    lastClaimBellAt = now;
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ctx = new AudioCtx();
      var notes = [
        { freq: 1046.5, start: 0, dur: 0.14 },
        { freq: 1567.98, start: 0.15, dur: 0.28 },
        { freq: 2093.0, start: 0.34, dur: 0.36 }
      ];
      notes.forEach(function (n) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.start);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + n.start);
        gain.gain.exponentialRampToValueAtTime(0.24, ctx.currentTime + n.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.start + n.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.start);
        osc.stop(ctx.currentTime + n.start + n.dur + 0.02);
      });
    } catch (e) {}
  }

  function playAlertBannerAudio(audioSrc, fallbackBellFn, onBlocked) {
    var replayBtn = $('btnReplayUrgeAudio');
    if (replayBtn) {
      replayBtn.classList.remove('is-urgent');
      replayBtn.textContent = '🔊 Nghe';
    }
    try {
      if (urgeAudioEl && !urgeAudioEl.paused && !urgeAudioEl.ended) {
        return;
      }
      urgeAudioEl = new Audio(audioSrc);
      urgeAudioEl.currentTime = 0;
      var playPromise = urgeAudioEl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (replayBtn) {
            replayBtn.classList.add('is-urgent');
            replayBtn.textContent = '🔊 Bấm nghe!';
          }
          if (typeof onBlocked === 'function') onBlocked();
          if (typeof fallbackBellFn === 'function') fallbackBellFn();
        });
      }
    } catch (e) {
      if (typeof fallbackBellFn === 'function') fallbackBellFn();
    }
  }

  function playUrgeSound(voiceId, onBlocked) {
    stopPreviewAudio();
    var voice = getUrgeVoiceById(voiceId);
    playAlertBannerAudio(voice.audio, playSynthesizedUrgeBell, onBlocked);
  }

  function playPayConfirmedSound(onBlocked, forceRestart) {
    var now = Date.now();
    var isStillPlaying = !!(payConfirmedAudioEl && payConfirmedAudioPlaying && !payConfirmedAudioEl.ended);
    var withinDebounce = (now - lastPayConfirmedAudioStartedAt < PAY_CONFIRMED_DEBOUNCE_MS);
    if (!forceRestart && (isStillPlaying || withinDebounce)) {
      return;
    }
    stopPreviewAudio();
    stopPayUrgeAudio();
    try {
      clearTimeout(payConfirmedAudioSafetyTimer);
      if (payConfirmedAudioEl) {
        try {
          payConfirmedAudioEl.onended = null;
          payConfirmedAudioEl.onerror = null;
          payConfirmedAudioEl.pause();
        } catch (e) {}
      }
      var audioEl = new Audio(PAY_CONFIRMED_AUDIO);
      payConfirmedAudioEl = audioEl;
      audioEl.currentTime = 0;
      payConfirmedAudioPlaying = true;
      lastPayConfirmedAudioStartedAt = now;
      payConfirmedAudioSafetyTimer = setTimeout(function () {
        if (payConfirmedAudioEl === audioEl) payConfirmedAudioPlaying = false;
      }, 18000);
      audioEl.onended = function () {
        if (payConfirmedAudioEl === audioEl) {
          payConfirmedAudioPlaying = false;
          clearTimeout(payConfirmedAudioSafetyTimer);
        }
      };
      audioEl.onerror = function () {
        if (payConfirmedAudioEl === audioEl) {
          payConfirmedAudioPlaying = false;
          clearTimeout(payConfirmedAudioSafetyTimer);
        }
      };
      var p = audioEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          if (payConfirmedAudioEl === audioEl) {
            payConfirmedAudioPlaying = false;
            clearTimeout(payConfirmedAudioSafetyTimer);
          }
          var replayBtn = $('btnReplayUrgeAudio');
          if (replayBtn) {
            replayBtn.classList.add('is-urgent');
            replayBtn.textContent = '🔊 Bấm nghe!';
          }
          if (typeof onBlocked === 'function') onBlocked();
          playSynthesizedClaimBell(!!forceRestart);
        });
      }
    } catch (e) {
      payConfirmedAudioPlaying = false;
      clearTimeout(payConfirmedAudioSafetyTimer);
      playSynthesizedClaimBell(!!forceRestart);
    }
  }

  var NOTIF_ICON = 'assets/icons/icon-192.png';
  var seenSystemNotifTags = {};

  function isNotificationSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  function getNotificationPermission() {
    return isNotificationSupported() ? Notification.permission : 'unsupported';
  }

  function updateNotificationButtonUI() {
    var perm = getNotificationPermission();
    var topBtn = $('btnNotifTopbar');
    var topTxt = $('notifTopbarText');
    var menuBtn = $('btnMenuNotifPerm');
    var menuTxt = $('menuNotifPermText');
    if (perm === 'unsupported') {
      if (topBtn) topBtn.hidden = true;
      if (menuBtn) menuBtn.hidden = true;
      return;
    }
    if (topBtn) {
      topBtn.hidden = false;
      topBtn.classList.toggle('is-granted', perm === 'granted');
      topBtn.classList.toggle('is-denied', perm === 'denied');
      topBtn.title = perm === 'granted'
        ? 'Thông báo nền đang BẬT (vẫn nhận thông báo khi chuyển tab / thu nhỏ app) — bấm để thử ngay'
        : (perm === 'denied'
          ? 'Thông báo đang bị chặn — mở cài đặt trình duyệt để cho phép'
          : 'Bấm để bật thông báo ngoài app khi không mở cửa sổ đặt món');
    }
    if (topTxt) {
      topTxt.textContent = perm === 'granted' ? 'Đã bật' : (perm === 'denied' ? 'Bị chặn' : 'Bật TB');
    }
    if (menuBtn) menuBtn.hidden = false;
    if (menuTxt) {
      menuTxt.textContent = perm === 'granted'
        ? '✓ Thông báo ngoài app: ĐANG BẬT (Thử ngay)'
        : (perm === 'denied' ? '🔕 Thông báo đang bị chặn' : '🔔 Bật thông báo ngoài app');
    }
  }

  function showDirectBrowserNotification(title, options) {
    try {
      var n = new Notification(title, options);
      n.onclick = function () {
        try { window.focus(); } catch (e) {}
        try { n.close(); } catch (e) {}
      };
      return true;
    } catch (e) {
      return false;
    }
  }

  function sendSystemNotification(opts) {
    if (!opts || !opts.title || getNotificationPermission() !== 'granted') return;
    var isFocusedWindow = !document.hidden && (typeof document.hasFocus !== 'function' || document.hasFocus());
    if (!opts.force && isFocusedWindow) return;
    var tag = opts.tag ? String(opts.tag) : '';
    if (tag) {
      if (seenSystemNotifTags[tag]) return;
      seenSystemNotifTags[tag] = Date.now();
    }
    var shareUrl = (typeof getShareUrl === 'function') ? getShareUrl() : location.href;
    var notifOptions = {
      body: String(opts.body || ''),
      tag: tag || undefined,
      icon: NOTIF_ICON,
      badge: NOTIF_ICON,
      renotify: true,
      data: { bill: orderCode, url: shareUrl }
    };
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(function (reg) {
        if (reg && typeof reg.showNotification === 'function') {
          return reg.showNotification(opts.title, notifOptions);
        }
        showDirectBrowserNotification(opts.title, notifOptions);
      }).catch(function () {
        showDirectBrowserNotification(opts.title, notifOptions);
      });
    } else {
      showDirectBrowserNotification(opts.title, notifOptions);
    }
  }

  var cachedVapidPublicKey = '';
  var lastSyncedPushKey = '';

  function isChromeExtensionActive() {
    try {
      return !!(document.documentElement && document.documentElement.dataset && document.documentElement.dataset.uuExtActive === '1');
    } catch (e) {
      return false;
    }
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function fetchVapidPublicKey() {
    if (cachedVapidPublicKey) return Promise.resolve(cachedVapidPublicKey);
    return fetch(getWorkerHttpOrigin() + '/api/push/vapid-public-key')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok && j.publicKey) {
          cachedVapidPublicKey = j.publicKey;
          return cachedVapidPublicKey;
        }
        return '';
      })
      .catch(function () { return ''; });
  }

  function syncWebPushSubscription(forceSync) {
    if (!orderCode || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (getNotificationPermission() !== 'granted') return;

    var extActive = isChromeExtensionActive();
    var syncSig = orderCode + '|' + (myUid || '') + '|' + (myUname || '') + '|' + (extActive ? 'ext' : 'web');
    if (!forceSync && lastSyncedPushKey === syncSig) return;
    lastSyncedPushKey = syncSig;

    navigator.serviceWorker.ready.then(function (reg) {
      if (!reg || !reg.pushManager) return;
      return reg.pushManager.getSubscription().then(function (existingSub) {
        if (extActive) {
          // Đã cài Chrome Extension -> hủy Web Push cho bill này để Extension tự xử lý notify + loa thoại (chống trùng)
          if (existingSub && existingSub.endpoint) {
            fetch(getWorkerHttpOrigin() + '/bill/' + encodeURIComponent(orderCode) + '/push/unsubscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: existingSub.endpoint })
            }).catch(function () {});
          }
          return;
        }
        var subPromise = existingSub
          ? Promise.resolve(existingSub)
          : fetchVapidPublicKey().then(function (pubKey) {
              if (!pubKey) return null;
              return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(pubKey)
              });
            });
        return subPromise.then(function (sub) {
          if (!sub) return;
          return fetch(getWorkerHttpOrigin() + '/bill/' + encodeURIComponent(orderCode) + '/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: sub.toJSON ? sub.toJSON() : sub,
              uid: myUid || '',
              uname: myUname || ''
            })
          });
        });
      });
    }).catch(function () {});
  }

  window.addEventListener('uu-ext-ready', function () {
    syncWebPushSubscription(true);
  });

  function requestBrowserNotificationPermission(isInteractiveClick) {
    var perm = getNotificationPermission();
    if (perm === 'unsupported') {
      if (isInteractiveClick) showToast('Trình duyệt hiện tại chưa hỗ trợ Notification API.');
      return;
    }
    if (perm === 'denied') {
      if (isInteractiveClick) showToast('🔕 Thông báo đang bị chặn — hãy bấm vào biểu tượng 🔒 trên thanh địa chỉ để cho phép.');
      updateNotificationButtonUI();
      return;
    }
    if (perm === 'granted') {
      updateNotificationButtonUI();
      syncWebPushSubscription(true);
      if (isInteractiveClick) {
        sendSystemNotification({
          title: '✓ Thông báo Office Order đang hoạt động!',
          body: 'Kể cả khi tắt tab, bạn vẫn nhận được Web Push khi có hối đơn, báo chuyển khoản hoặc xác nhận tiền.',
          tag: 'uu-test-' + Date.now(),
          force: true
        });
        showToast('🔔 Đã bật Web Push & gửi thông báo thử! Tắt tab vẫn nhận bình thường.');
      }
      return;
    }
    try { localStorage.setItem('uu_notif_asked', '1'); } catch (e) {}
    function onPermResult(res) {
      updateNotificationButtonUI();
      if (res === 'granted') {
        syncWebPushSubscription(true);
        sendSystemNotification({
          title: '✓ Đã bật thông báo Ú Ụ / Office Order!',
          body: 'Bạn sẽ nhận Web Push kể cả khi tắt tab mỗi khi nhóm hối đơn hoặc xác nhận thanh toán.',
          tag: 'uu-welcome-' + Date.now(),
          force: true
        });
        if (isInteractiveClick) showToast('🔔 Đã bật Web Push thành công! Tắt tab vẫn nhận được thông báo.');
      } else if (isInteractiveClick && res === 'denied') {
        showToast('Bạn đã tắt quyền thông báo cho trang này.');
      }
    }
    try {
      var p = Notification.requestPermission(onPermResult);
      if (p && typeof p.then === 'function') {
        p.then(onPermResult).catch(function () {});
      }
    } catch (e) {}
  }

  function maybePromptNotificationOnAction() {
    if (getNotificationPermission() !== 'default') return;
    try {
      if (localStorage.getItem('uu_notif_asked') === '1') return;
    } catch (e) {}
    requestBrowserNotificationPermission(false);
  }

  function showUrgentBanner(opts) {
    var banner = $('urgeAlertBanner');
    var titleEl = $('urgeAlertTitle');
    var subEl = $('urgeAlertSub');
    if (titleEl) titleEl.textContent = (opts && opts.title) || 'Thông báo';
    if (subEl) subEl.textContent = (opts && opts.sub) || '';
    lastAlertReplayFn = (opts && typeof opts.replay === 'function') ? opts.replay : null;
    if (banner) {
      banner.classList.toggle('is-pay-confirmed', !!(opts && opts.variant === 'is-pay-confirmed'));
      banner.hidden = false;
      clearTimeout(banner._hideTimer);
      banner._hideTimer = setTimeout(function () {
        banner.hidden = true;
      }, (opts && opts.durationMs) || 9000);
    }
  }

  function triggerUrgeAlert(senderName, customText, urgeId, voiceId, cooldownMs) {
    if (urgeId) {
      if (seenUrgeIds[urgeId]) return;
      seenUrgeIds[urgeId] = Date.now();
    }
    var voice = getUrgeVoiceById(voiceId);
    lastReceivedUrgeVoiceId = voice.id;

    // Áp dụng khóa 10s toàn phòng ngay khi bất kỳ subscriber nào phát thoại
    startUrgeCooldown(cooldownMs || URGE_COOLDOWN_MS);

    playUrgeSound(voice.id);

    var who = senderName || 'Đồng nghiệp';
    showUrgentBanner({
      variant: '',
      title: '📣 ' + who + ' hối chốt đơn!',
      sub: customText || voice.text,
      replay: function () { playUrgeSound(lastReceivedUrgeVoiceId); },
      durationMs: 9000
    });
    sendSystemNotification({
      title: '📣 ' + who + ' hối chốt đơn! (#' + orderCode + ')',
      body: customText || voice.text,
      tag: 'uu-urge-' + (urgeId || Date.now())
    });

    var cartSec = $('cartSection');
    if (cartSec) {
      cartSec.classList.remove('is-urged');
      void cartSec.offsetWidth;
      cartSec.classList.add('is-urged');
      setTimeout(function () { cartSec.classList.remove('is-urged'); }, 1200);
    }
  }

  function triggerPayConfirmedAlert(d) {
    if (!d) return;
    if (d.confirmId) {
      if (seenPayConfirmIds[d.confirmId]) return;
      seenPayConfirmIds[d.confirmId] = Date.now();
    }
    playPayConfirmedSound();
    var hostWho = d.hostName || 'Đại diện';
    var payerWho = d.payerName || 'Thành viên';
    var amtTxt = Number(d.amount) > 0 ? (' (' + fmt(d.amount) + ')') : '';
    var itemTxt = payerWho + amtTxt;
    if (recentConfirmedPayers.indexOf(itemTxt) === -1) {
      recentConfirmedPayers.push(itemTxt);
    }
    clearTimeout(recentConfirmedBatchTimer);
    recentConfirmedBatchTimer = setTimeout(function () {
      recentConfirmedPayers = [];
    }, 6500);

    var prefixStr = d.viaSePay ? '⚡ SePay tự động xác nhận ' : ('💸 ' + hostWho + ' đã xác nhận ');
    var titleStr = recentConfirmedPayers.length > 1
      ? (prefixStr + recentConfirmedPayers.length + ' bạn: ' + recentConfirmedPayers.join(', ') + '!')
      : (prefixStr + itemTxt + '!');
    var bodyStr = d.text || PAY_CONFIRMED_TEXT;
    showUrgentBanner({
      variant: 'is-pay-confirmed',
      title: titleStr,
      sub: bodyStr,
      replay: function () { playPayConfirmedSound(null, true); },
      durationMs: 11000
    });
    sendSystemNotification({
      title: titleStr + ' (#' + orderCode + ')',
      body: bodyStr,
      tag: 'uu-pconf-' + orderCode + '-' + Math.floor(Date.now() / 5000)
    });
  }

  function hideHostClaimBanner() {
    var b = $('hostClaimBanner');
    if (b) {
      b.hidden = true;
      clearTimeout(b._hideTimer);
    }
    activeHostClaimTarget = null;
  }

  function triggerHostClaimAlert(d) {
    if (!d || !canActAsHostOrOpen()) return;
    if (d.claimId) {
      if (seenPayClaimIds[d.claimId]) return;
      seenPayClaimIds[d.claimId] = Date.now();
    }
    playSynthesizedClaimBell();
    var payerName = d.uname || d.name || 'Thành viên';
    var donorName = d.donatedBy ? String(d.donatedBy).trim() : '';
    activeHostClaimTarget = {
      uid: d.uid || '',
      name: payerName,
      finalPay: Number(d.amount) || 0
    };
    var amtStr = Number(d.amount) > 0 ? (' ' + fmt(d.amount)) : '';
    var detailParts = ['Vui lòng mở app ngân hàng kiểm tra tiền vào rồi bấm xác nhận'];
    if (donorName) detailParts.unshift('Thanh toán hộ (Donate) bởi ' + donorName);
    if (d.qrLabel) detailParts.push('QR: ' + d.qrLabel);
    var detailTxt = detailParts.join(' · ');

    var banner = $('hostClaimBanner');
    var titleEl = $('hostClaimTitle');
    var subEl = $('hostClaimSub');
    var claimHeadline = donorName
      ? ('🎁 ' + donorName + ' báo đã CK hộ ' + payerName + amtStr + '!')
      : ('🔔 ' + payerName + ' báo đã chuyển khoản' + amtStr + '!');
    if (titleEl) titleEl.textContent = claimHeadline;
    if (subEl) subEl.textContent = detailTxt;
    if (banner) {
      banner.hidden = false;
      clearTimeout(banner._hideTimer);
      banner._hideTimer = setTimeout(function () {
        if (banner) banner.hidden = true;
      }, 25000);
    }
    sendSystemNotification({
      title: claimHeadline + ' · #' + orderCode,
      body: detailTxt,
      tag: 'uu-claim-' + (d.claimId || Date.now())
    });
  }

  /* ================= HỐI CHỐT ĐƠN TÍNH TIỀN (MEMBER → ĐẠI DIỆN) ================= */
  var URGE_FINALIZE_COOLDOWN_MS = 15000;
  var urgeFinalizeCooldownUntil = 0;
  var urgeFinalizeCooldownTimer = null;
  var seenUrgeFinalizeIds = {};

  function urgeFinalizeStorageKey() {
    return 'uu_urge_fin_until_' + (orderCode || 'default');
  }

  function getUrgeFinalizeRemainingSec() {
    var rem = urgeFinalizeCooldownUntil - Date.now();
    return rem > 0 ? Math.ceil(rem / 1000) : 0;
  }

  function updateUrgeFinalizeCooldownUI() {
    var btn = $('btnUrgeFinalize');
    var lbl = $('btnUrgeFinalizeLabel');
    var remSec = getUrgeFinalizeRemainingSec();
    if (btn) {
      btn.disabled = remSec > 0;
      btn.classList.toggle('is-cooldown', remSec > 0);
    }
    if (lbl) {
      lbl.textContent = remSec > 0 ? ('Đợi ' + remSec + 's') : 'Hối chốt đơn';
    }
  }

  function startUrgeFinalizeCooldown(ms) {
    var dur = Number(ms) || URGE_FINALIZE_COOLDOWN_MS;
    var nextUntil = Date.now() + dur;
    if (nextUntil > urgeFinalizeCooldownUntil) {
      urgeFinalizeCooldownUntil = nextUntil;
      try { localStorage.setItem(urgeFinalizeStorageKey(), String(urgeFinalizeCooldownUntil)); } catch (e) {}
    }
    updateUrgeFinalizeCooldownUI();
    if (!urgeFinalizeCooldownTimer) {
      urgeFinalizeCooldownTimer = setInterval(function () {
        if (getUrgeFinalizeRemainingSec() <= 0) {
          urgeFinalizeCooldownUntil = 0;
          clearInterval(urgeFinalizeCooldownTimer);
          urgeFinalizeCooldownTimer = null;
          try { localStorage.removeItem(urgeFinalizeStorageKey()); } catch (e) {}
        }
        updateUrgeFinalizeCooldownUI();
      }, 500);
    }
  }

  function syncUrgeFinalizeCooldownFromStorage() {
    urgeFinalizeCooldownUntil = 0;
    try {
      var stored = Number(localStorage.getItem(urgeFinalizeStorageKey()) || 0);
      if (stored > Date.now()) {
        urgeFinalizeCooldownUntil = stored;
        startUrgeFinalizeCooldown(stored - Date.now());
      } else {
        localStorage.removeItem(urgeFinalizeStorageKey());
      }
    } catch (e) {}
    updateUrgeFinalizeCooldownUI();
  }

  function hideHostFinalizeBanner() {
    var b = $('hostFinalizeBanner');
    if (b) {
      b.hidden = true;
      clearTimeout(b._hideTimer);
    }
  }

  function sendUrgeFinalizeOrder() {
    if (!hasHostAssigned()) {
      showToast('Chưa chọn người đại diện cho đơn này.');
      return;
    }
    if (isCurrentHost()) {
      showToast('Bạn đang là Đại diện — bấm "Chốt & Lưu Sheet" ở cuối giỏ hàng nhé!');
      return;
    }
    if (isOrderSubmitted()) {
      showToast('✓ Đơn này đã được chốt & lưu Sheet rồi!');
      return;
    }
    if (!cart.length) {
      showToast('Giỏ hàng chưa có món nào để chốt đơn.');
      return;
    }
    var remSec = getUrgeFinalizeRemainingSec();
    if (remSec > 0) {
      updateUrgeFinalizeCooldownUI();
      showToast('⏳ Vui lòng đợi ' + remSec + 's nữa mới hối đại diện tiếp được!');
      return;
    }

    var now = Date.now();
    var t = totals();
    var unitStr = (currentStore && currentStore.itemUnit) || 'món';
    var senderName = myUname || 'Thành viên';
    var hostName = getHostName() || 'Đại diện';
    sendRoomEvent({
      type: 'urge_finalize',
      urgeFinId: 'ufin_' + clientId + '_' + now,
      uid: myUid || '',
      uname: senderName,
      hostUid: getHostUid() || '',
      hostName: hostName,
      totalCups: t.totalCups,
      unit: unitStr,
      grandTotal: t.grand,
      ts: now
    });
    startUrgeFinalizeCooldown(URGE_FINALIZE_COOLDOWN_MS);
    maybePromptNotificationOnAction();
    showToast('📣 Đã hối Đại diện (' + hostName + ') chốt đơn & lưu Sheet tính tiền!');
  }

  function triggerHostFinalizeAlert(d) {
    if (!d || !canActAsHostOrOpen() || isOrderSubmitted()) return;
    if (d.urgeFinId) {
      if (seenUrgeFinalizeIds[d.urgeFinId]) return;
      seenUrgeFinalizeIds[d.urgeFinId] = Date.now();
    }
    playSynthesizedUrgeBell();
    var sender = d.uname || 'Thành viên';
    var t = totals();
    var cups = Number(d.totalCups) || t.totalCups || cart.length;
    var unitStr = d.unit || (currentStore && currentStore.itemUnit) || 'món';
    var grand = Number(d.grandTotal) || t.grand || 0;
    var titleTxt = '⏰ ' + sender + ' hối chốt đơn tính tiền!';
    var subTxt = 'Đơn hiện có ' + cups + ' ' + unitStr + (grand > 0 ? (' · Tổng ' + fmt(grand)) : '') +
      ' — Bấm "Chốt & Lưu Sheet" để mọi người thanh toán nhé!';

    var banner = $('hostFinalizeBanner');
    var titleEl = $('hostFinalizeTitle');
    var subEl = $('hostFinalizeSub');
    if (titleEl) titleEl.textContent = titleTxt;
    if (subEl) subEl.textContent = subTxt;
    if (banner) {
      banner.hidden = false;
      clearTimeout(banner._hideTimer);
      banner._hideTimer = setTimeout(function () {
        if (banner) banner.hidden = true;
      }, 22000);
    }

    var btnSave = $('btnSave');
    if (btnSave) {
      btnSave.classList.remove('is-finalize-urged');
      void btnSave.offsetWidth;
      btnSave.classList.add('is-finalize-urged');
      setTimeout(function () { btnSave.classList.remove('is-finalize-urged'); }, 3200);
    }

    sendSystemNotification({
      title: titleTxt + ' · #' + orderCode,
      body: subTxt,
      tag: 'uu-ufin-' + (d.urgeFinId || Date.now())
    });
  }

  function handleRemoteClaimCancel(d) {
    if (!d || !activeHostClaimTarget) return;
    var tUid = d.uid || '';
    var tName = String(d.uname || d.name || '').trim().toLowerCase();
    var matchUid = !!(tUid && activeHostClaimTarget.uid && tUid === activeHostClaimTarget.uid);
    var matchName = !!(tName && activeHostClaimTarget.name && tName === activeHostClaimTarget.name.trim().toLowerCase());
    if (matchUid || matchName) hideHostClaimBanner();
  }

  function handleRemoteClaimRejected(d) {
    if (!d) return;
    var hostWho = d.hostName || 'Đại diện';
    showToast('⚠️ ' + hostWho + ' chưa thấy tiền bạn chuyển vào bank, hãy kiểm tra lại nhé!');
  }

  function sendUrgeOrder() {
    var remSec = getUrgeRemainingSec();
    if (remSec > 0) {
      updateUrgeCooldownUI();
      showToast('⏳ Chống spam: Vui lòng đợi ' + remSec + 's nữa mới gửi thoại tiếp được!');
      return;
    }

    var voice = getUrgeVoiceById(selectedUrgeVoiceId);
    var now = Date.now();
    var urgeId = 'urge_' + clientId + '_' + now;

    closeUrgeModal();
    maybePromptNotificationOnAction();
    triggerUrgeAlert(myUname + ' (Bạn)', voice.text, urgeId, voice.id, URGE_COOLDOWN_MS);

    // Broadcast qua cả presence (tương thích worker cũ/mới) và event urge
    var payload = {
      type: 'presence',
      kind: 'presence',
      bill: orderCode,
      uid: myUid,
      uname: myUname,
      ucolor: myUcolor,
      from: clientId,
      urge: true,
      urgeId: urgeId,
      urgeVoiceId: voice.id,
      urgeText: voice.text,
      ts: now
    };
    try { if (bc) bc.postMessage(payload); } catch (e) {}
    if (ws && wsOk) {
      try { ws.send(JSON.stringify(payload)); } catch (e) {}
    }
  }

  /* ================= ÂM THANH & HỐI TRẢ TIỀN (SAU KHI ĐẠI DIỆN CHỐT ĐƠN) ================= */
  var PAY_URGE_COOLDOWN_MS = 0;
  var URGE_PAY_VOICES = [
    {
      id: 'pay-1',
      tag: '🔊 Ting ting tiền nhà',
      text: 'TING TING! CHUYỂN KHOẢN ĐI CÁC CON VỢ ƠIIII! TUI CÒN ĐÓNG TIỀN NHÀ NỮA ĐÓ!!!',
      audio: 'assets/audio/pay-1.mp3'
    },
    {
      id: 'pay-2',
      tag: '📷 Quét mã QR giùm',
      text: 'Ăn uống no nê rồi thì quét mã QR giùm cái! Tui nhìn tài khoản mà rớt nước mắt rồi!!!',
      audio: 'assets/audio/pay-2.mp3'
    },
    {
      id: 'pay-3',
      tag: '😩 Thở dài bất lực',
      text: 'Haizzz... Đồ ăn tiêu hóa hết rồi... mà tiền chuyển khoản vẫn chưa thấy tăm hơi đâu...',
      audio: 'assets/audio/pay-3.mp3'
    },
    {
      id: 'pay-4',
      tag: '🥺 Nhắc nhẹ lần một',
      text: 'Các con vợ... Ting ting cho chồng đi... Đừng để chồng phải nhắc lần hai!',
      audio: 'assets/audio/pay-4.mp3'
    },
    {
      id: 'pay-5',
      tag: '🍜 Mì gói qua ngày',
      text: 'Trả tiền lẹ lên! Tao sắp phải ăn mì gói qua ngày vì bao cả đám rồi đó!!!',
      audio: 'assets/audio/pay-5.mp3'
    }
  ];

  var seenPayUrgeIds = {};
  var payUrgeCooldownUntil = 0;
  var payUrgeCooldownTimer = null;
  var selectedPayVoiceId = 'pay-1';
  var activePayUrge = null;
  var payUrgeAudioEl = null;
  var payPreviewAudioEl = null;
  var previewingPayVoiceId = null;

  try {
    var savedPayVoice = localStorage.getItem('uu_pay_voice_id');
    if (savedPayVoice && URGE_PAY_VOICES.some(function (v) { return v.id === savedPayVoice; })) {
      selectedPayVoiceId = savedPayVoice;
    }
  } catch (e) {}

  function getPayVoiceById(id) {
    for (var i = 0; i < URGE_PAY_VOICES.length; i++) {
      if (URGE_PAY_VOICES[i].id === String(id)) return URGE_PAY_VOICES[i];
    }
    return URGE_PAY_VOICES[0];
  }

  function payUrgeStorageKey() {
    return 'uu_pay_urge_until_' + (orderCode || 'default');
  }

  function syncPayUrgeCooldownFromStorage() {
    payUrgeCooldownUntil = 0;
    if (payUrgeCooldownTimer) {
      clearInterval(payUrgeCooldownTimer);
      payUrgeCooldownTimer = null;
    }
    try { localStorage.removeItem(payUrgeStorageKey()); } catch (e) {}
    updatePayUrgeCooldownUI();
  }

  function getPayUrgeRemainingSec() {
    return 0;
  }

  function startPayUrgeCooldown() {
    payUrgeCooldownUntil = 0;
    updatePayUrgeCooldownUI();
  }

  function updatePayUrgeCooldownUI() {
    var allPaidNow = (isOrderSubmitted() && cart.length > 0 && typeof getUnpaidNonHostMembers === 'function' && getUnpaidNonHostMembers().length === 0);
    var btnUrgePay = $('btnOpenUrgePay');
    if (btnUrgePay) btnUrgePay.disabled = allPaidNow;
    var btnLbl = $('btnUrgePayLabel');
    if (btnLbl) {
      btnLbl.textContent = allPaidNow ? 'Đã thu đủ ✓' : 'Hối trả tiền';
    }
    var box = $('urgePayCooldownBox');
    if (box) box.hidden = true;
    var sendBtn = $('btnConfirmUrgePaySend');
    var sendTxt = $('btnConfirmUrgePayText');
    if (sendBtn) sendBtn.disabled = allPaidNow;
    if (sendTxt) sendTxt.textContent = allPaidNow ? 'Đã thu đủ' : 'Phát loa đòi tiền ngay';
  }

  function stopPayPreviewAudio() {
    if (payPreviewAudioEl) {
      try {
        payPreviewAudioEl.pause();
        payPreviewAudioEl.currentTime = 0;
      } catch (e) {}
    }
    previewingPayVoiceId = null;
    updatePayPreviewButtonsUI();
  }

  function stopPayUrgeAudio() {
    if (payUrgeAudioEl) {
      try {
        payUrgeAudioEl.pause();
        payUrgeAudioEl.currentTime = 0;
      } catch (e) {}
    }
  }

  function updatePayPreviewButtonsUI() {
    document.querySelectorAll('#urgePayVoiceList .btn-preview-voice').forEach(function (btn) {
      var playing = (previewingPayVoiceId && btn.dataset.voiceId === previewingPayVoiceId);
      btn.classList.toggle('is-playing', !!playing);
      btn.textContent = playing ? '⏹ Dừng' : '▶ Nghe thử';
    });
  }

  function togglePayPreviewVoice(voiceId) {
    if (previewingPayVoiceId === voiceId) {
      stopPayPreviewAudio();
      return;
    }
    stopPayPreviewAudio();
    var voice = getPayVoiceById(voiceId);
    previewingPayVoiceId = voice.id;
    updatePayPreviewButtonsUI();
    try {
      payPreviewAudioEl = new Audio(voice.audio);
      payPreviewAudioEl.onended = function () {
        previewingPayVoiceId = null;
        updatePayPreviewButtonsUI();
      };
      payPreviewAudioEl.onerror = function () {
        previewingPayVoiceId = null;
        updatePayPreviewButtonsUI();
        showToast('Không phát được file ' + voice.audio);
      };
      var p = payPreviewAudioEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          previewingPayVoiceId = null;
          updatePayPreviewButtonsUI();
          playSynthesizedUrgeBell();
        });
      }
    } catch (e) {
      previewingPayVoiceId = null;
      updatePayPreviewButtonsUI();
    }
  }

  function renderUrgePayVoiceList() {
    var list = $('urgePayVoiceList');
    if (!list) return;
    list.innerHTML = '';

    URGE_PAY_VOICES.forEach(function (v) {
      var isSel = (v.id === selectedPayVoiceId);
      var card = document.createElement('div');
      card.className = 'urge-voice-card' + (isSel ? ' is-selected' : '');
      card.innerHTML =
        '<div class="urge-voice-radio"></div>' +
        '<div class="urge-voice-info">' +
          '<div class="urge-voice-top">' +
            '<span class="urge-voice-num">Mẫu #' + esc(v.id.replace('pay-', '')) + '</span>' +
            '<span class="urge-voice-tag">' + esc(v.tag) + '</span>' +
          '</div>' +
          '<div class="urge-voice-text">"' + esc(v.text) + '"</div>' +
        '</div>' +
        '<button type="button" class="btn-preview-voice" data-voice-id="' + esc(v.id) + '">▶ Nghe thử</button>';

      card.onclick = function (e) {
        if (e.target.closest('.btn-preview-voice')) return;
        selectedPayVoiceId = v.id;
        try { localStorage.setItem('uu_pay_voice_id', selectedPayVoiceId); } catch (err) {}
        renderUrgePayVoiceList();
      };

      var btnPrev = card.querySelector('.btn-preview-voice');
      if (btnPrev) {
        btnPrev.onclick = function (e) {
          e.stopPropagation();
          selectedPayVoiceId = v.id;
          try { localStorage.setItem('uu_pay_voice_id', selectedPayVoiceId); } catch (err) {}
          document.querySelectorAll('#urgePayVoiceList .urge-voice-card').forEach(function (c, idx) {
            c.classList.toggle('is-selected', URGE_PAY_VOICES[idx].id === selectedPayVoiceId);
          });
          togglePayPreviewVoice(v.id);
        };
      }

      list.appendChild(card);
    });
    updatePayPreviewButtonsUI();
  }

  function renderUrgePayTargetsBox() {
    var box = $('urgePayTargetsBox');
    if (!box) return;
    var unpaid = getUnpaidNonHostMembers();
    if (!unpaid.length) {
      box.innerHTML = '🎉 Tuyệt vời! Tất cả thành viên khác trong bill đều đã thanh toán rồi.';
      return;
    }
    var summary = unpaid.map(function (p) {
      return esc(p.name) + ' (<strong>' + fmt(p.finalPay) + '</strong>)';
    }).join(', ');
    box.innerHTML = '🔒 Chỉ gửi thông báo riêng tới <strong>' + unpaid.length + ' bạn chưa trả</strong>: ' + summary +
      '. <br><span style="opacity:.85;">Người đã trả không nhận được thông báo. Mỗi người chỉ thấy phần tiền của riêng mình.</span>';
  }

  function openUrgePayModal() {
    if (hasHostAssigned() && !isCurrentHost()) {
      showToast('🔒 Chỉ Đại diện (' + (getHostName() || 'Host') + ') mới được hối trả tiền!');
      return;
    }
    if (!isOrderSubmitted()) {
      showToast('⏳ Bạn cần bấm "Chốt & Lưu Sheet" trước khi phát loa hối trả tiền!');
      return;
    }
    var unpaid = getUnpaidNonHostMembers();
    if (!unpaid.length) {
      showToast('🎉 Các thành viên đã trả tiền đủ rồi, không cần hối nữa!');
      return;
    }
    var modal = $('urgePayModal');
    if (!modal) return;
    renderUrgePayTargetsBox();
    renderUrgePayVoiceList();
    updatePayUrgeCooldownUI();
    modal.hidden = false;
  }

  function closeUrgePayModal() {
    stopPayPreviewAudio();
    var modal = $('urgePayModal');
    if (modal) modal.hidden = true;
  }

  function playPayUrgeSound(voiceId, forceRestart) {
    if (!forceRestart && payUrgeAudioEl && !payUrgeAudioEl.paused && !payUrgeAudioEl.ended) {
      return;
    }
    stopPayPreviewAudio();
    stopPayUrgeAudio();
    var voice = getPayVoiceById(voiceId);
    var soundBtn = $('btnPlayPayReminderAudio');
    if (soundBtn) soundBtn.classList.remove('is-urgent');
    try {
      payUrgeAudioEl = new Audio(voice.audio);
      payUrgeAudioEl.currentTime = 0;
      var p = payUrgeAudioEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          if (soundBtn) soundBtn.classList.add('is-urgent');
          playSynthesizedUrgeBell();
        });
      }
    } catch (e) {
      playSynthesizedUrgeBell();
    }
  }

  var activePayQrZoomData = null;
  var activeQrZoomMember = null;
  var payReminderCollapsed = false;
  var selectedPayQrIdx = 0;

  function renderQrSlotSwitchTabs(containerEl, slots, activeIdx, onSelect) {
    if (!containerEl) return;
    if (!slots || slots.length <= 1) {
      containerEl.hidden = true;
      containerEl.innerHTML = '';
      return;
    }
    containerEl.hidden = false;
    containerEl.innerHTML = '';
    slots.forEach(function (slot, idx) {
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'qr-switch-pill' + (idx === activeIdx ? ' is-active' : '');
      pill.textContent = formatQrSlotDisplayName(slot, idx);
      pill.onclick = function (e) {
        e.stopPropagation();
        if (typeof onSelect === 'function') onSelect(idx);
      };
      containerEl.appendChild(pill);
    });
  }

  function applyQrZoomModalSlot(slots, idx, baseOpts) {
    var modal = $('qrZoomModal');
    var img = $('qrZoomImg');
    var titleEl = $('qrZoomTitle');
    var subEl = $('qrZoomSub');
    var infoCard = $('qrZoomInfoCard');
    var amtEl = $('qrZoomAmount');
    var noteEl = $('qrZoomNote');
    var tabsEl = $('qrZoomSlotTabs');
    if (!modal || !img || !slots || !slots.length) return;

    var safeIdx = Math.max(0, Math.min(idx, slots.length - 1));
    var slot = slots[safeIdx];
    selectedPayQrIdx = safeIdx;
    img.src = slot.qr;
    var baseTitle = (baseOpts && baseOpts.baseTitle) || (baseOpts && baseOpts.title) || 'Quét mã QR chuyển khoản';
    if (titleEl) {
      titleEl.textContent = slots.length > 1
        ? (baseTitle + ' · ' + formatQrSlotDisplayName(slot, safeIdx))
        : baseTitle;
    }
    if (subEl) {
      subEl.textContent = (baseOpts && baseOpts.sub) || 'Đưa camera app ngân hàng hoặc ví điện tử vào mã QR bên dưới';
    }
    var resolvedNote = (baseOpts && baseOpts.hideInfoCard) ? '' : ((slot.note && slot.note.trim()) ? slot.note.trim() : ((baseOpts && baseOpts.fallbackNote) || (baseOpts && baseOpts.note) || ''));
    var amtStr = (baseOpts && baseOpts.hideInfoCard) ? '' : ((baseOpts && baseOpts.amount) || '');
    if (infoCard && amtEl && noteEl) {
      if (amtStr || resolvedNote) {
        amtEl.textContent = amtStr ? ('Số tiền: ' + amtStr) : '';
        amtEl.hidden = !amtStr;
        noteEl.textContent = resolvedNote;
        noteEl.hidden = !resolvedNote;
        infoCard.hidden = false;
      } else {
        infoCard.hidden = true;
      }
    }
    renderQrSlotSwitchTabs(tabsEl, slots, safeIdx, function (nextIdx) {
      applyQrZoomModalSlot(slots, nextIdx, baseOpts);
      if ($('payReminderPanel') && !$('payReminderPanel').hidden) {
        renderPayReminderPanel(false);
      }
    });
    syncClaimButtonElement($('btnQrZoomClaimPaid'), baseOpts && baseOpts.member, !!(baseOpts && baseOpts.isDonate));
  }

  var activeQrZoomIsDonate = false;
  var pendingDonateMember = null;

  function getMemberSplitByTarget(targetObj) {
    if (!targetObj || !cart.length || typeof computeBillSplit !== 'function') return null;
    var sp = computeBillSplit();
    var targetKey = getMemberPayKey(targetObj);
    var targetNameLow = String(targetObj.name || '').trim().toLowerCase();
    for (var i = 0; i < sp.people.length; i++) {
      var p = sp.people[i];
      if (targetKey && getMemberPayKey(p) === targetKey) return p;
      if (targetNameLow && String(p.name || '').trim().toLowerCase() === targetNameLow) return p;
    }
    return null;
  }

  function openDonateConfirmModal(memberTarget) {
    if (!isOrderSubmitted()) {
      showToast('⏳ Cần đợi Đại diện chốt đơn & lưu Sheet trước khi Donate!');
      return;
    }
    if (!getHostQrSlots().length) {
      showToast('Đại diện chưa thêm tài khoản / mã QR cho bill này.');
      return;
    }
    var spMember = getMemberSplitByTarget(memberTarget) || memberTarget;
    if (!spMember) return;
    if (spMember.isMe) {
      openMemberPersonalQrModal(spMember);
      return;
    }
    if (spMember.paid || isMemberPaid(spMember)) {
      showToast('✓ ' + spMember.name + ' đã thanh toán xong rồi!');
      return;
    }
    var finalPay = Number(spMember.finalPay) || 0;
    if (finalPay <= 0) {
      showToast('Thành viên này không còn số tiền cần thanh toán.');
      return;
    }

    pendingDonateMember = spMember;
    var modal = $('donateConfirmModal');
    if (!modal) {
      openMemberPersonalQrModal(spMember, { isDonate: true });
      return;
    }

    var targetKey = getMemberPayKey(spMember);
    var targetNameLow = String(spMember.name || '').trim().toLowerCase();
    var memberLines = cart.filter(function (c) {
      var rk = getMemberPayKey({ uid: c.uid || '', name: c.uname || c.owner || '' });
      if (targetKey && rk === targetKey) return true;
      return targetNameLow && String(c.uname || c.owner || '').trim().toLowerCase() === targetNameLow;
    });

    var avEl = $('donateTargetAvatar');
    var nameEl = $('donateTargetName');
    var amtEl = $('donateTargetAmount');
    var itemsEl = $('donateTargetItems');
    var memoEl = $('donateTargetMemo');
    var warnEl = $('donateWarningText');

    if (avEl) {
      avEl.textContent = userInitial(spMember.name);
      avEl.style.backgroundColor = spMember.ucolor || '#0A7259';
    }
    if (nameEl) nameEl.textContent = spMember.name;
    if (amtEl) amtEl.textContent = fmt(finalPay);

    if (itemsEl) {
      if (memberLines.length) {
        itemsEl.innerHTML = memberLines.map(function (c) {
          var sz = formatSizeLabel(c.size);
          return '<div class="donate-item-line">' +
            '<span class="donate-item-name">' + esc(c.qty + 'x ' + c.name + (sz ? ' (' + sz + ')' : '')) + '</span>' +
            '<span class="donate-item-price">' + fmt(lineTotal(c)) + '</span>' +
          '</div>';
        }).join('');
      } else {
        itemsEl.innerHTML = '<div class="donate-item-line"><span class="donate-item-name">Phần đơn của ' + esc(spMember.name) + '</span><span class="donate-item-price">' + fmt(finalPay) + '</span></div>';
      }
    }

    var qrPreview = getQrForMember(spMember, finalPay);
    if (memoEl) {
      if (qrPreview && qrPreview.memo) {
        memoEl.textContent = 'Nội dung CK tự động: ' + qrPreview.memo;
        memoEl.hidden = false;
      } else {
        memoEl.hidden = true;
      }
    }

    if (warnEl) {
      warnEl.innerHTML = 'Vui lòng kiểm tra đúng tên <strong>' + esc(spMember.name) + '</strong> (' + fmt(finalPay) + ') trước khi quét QR. Tiền chuyển từ mã QR tiếp theo sẽ tự động gạch nợ cho phần của <strong>' + esc(spMember.name) + '</strong>.';
    }

    modal.hidden = false;
  }

  function closeDonateConfirmModal() {
    var modal = $('donateConfirmModal');
    if (modal) modal.hidden = true;
    pendingDonateMember = null;
  }

  function confirmDonateAndOpenQr() {
    var target = pendingDonateMember;
    closeDonateConfirmModal();
    if (!target) return;
    openMemberPersonalQrModal(target, { isDonate: true });
  }

  function syncClaimButtonElement(btnEl, targetMember, isDonate) {
    if (!btnEl) return;
    if (!isOrderSubmitted() || canActAsHostOrOpen() || !cart.length) {
      btnEl.hidden = true;
      return;
    }
    var donateMode = !!isDonate;
    if (targetMember && !targetMember.isMe && !donateMode) {
      btnEl.hidden = true;
      return;
    }
    var split = computeBillSplit();
    var targetEntry = null;
    if (donateMode && targetMember) {
      var tKey = getMemberPayKey(targetMember);
      targetEntry = split.people.find(function (p) { return getMemberPayKey(p) === tKey && !p.paid && p.finalPay > 0; }) || null;
    } else {
      var myUnpaid = split.people.filter(function (p) { return p.isMe && !p.paid && p.finalPay > 0; });
      targetEntry = myUnpaid[0] || null;
    }
    if (!targetEntry) {
      btnEl.hidden = true;
      return;
    }
    var isClaimed = !!targetEntry.claimed;
    btnEl.hidden = false;
    btnEl.classList.toggle('is-claimed', isClaimed);
    if (donateMode && !targetEntry.isMe) {
      btnEl.textContent = isClaimed
        ? ('⏳ Đã báo CK hộ ' + targetEntry.name + ' (Bấm hủy)')
        : ('🎁 Tôi đã CK hộ ' + targetEntry.name);
      btnEl.onclick = function (e) {
        e.stopPropagation();
        toggleMyPayClaim(targetEntry, { donatedBy: myUname || 'Thành viên' });
      };
    } else {
      btnEl.textContent = isClaimed
        ? '⏳ Đã báo CK (Chờ ĐD duyệt · Bấm hủy)'
        : '✓ Tôi đã chuyển khoản xong';
      btnEl.onclick = function (e) {
        e.stopPropagation();
        toggleMyPayClaim(targetEntry);
      };
    }
  }

  function openQrZoomModal(opts) {
    var d = opts || activePayQrZoomData;
    if (!d) return;
    var slots = (Array.isArray(d.slots) && d.slots.length)
      ? d.slots.filter(function (s) { return s && s.qr; })
      : (d.src ? [{ id: 'qr_0', label: d.slotLabel || '', qr: d.src, note: d.note || '' }] : []);
    if (!slots.length) return;
    var modal = $('qrZoomModal');
    if (!modal) return;
    activeQrZoomMember = d.member || null;
    activeQrZoomIsDonate = !!d.isDonate;
    applyQrZoomModalSlot(slots, Number(d.slotIdx) || 0, d);
    modal.hidden = false;
  }

  function openMemberPersonalQrModal(memberObj, extraOpts) {
    var slots = getHostQrSlots();
    if (!slots.length) {
      showToast('Đại diện chưa thêm tài khoản / mã QR cho bill này.');
      return;
    }
    var hostName = getHostName() || 'Đại diện';
    var mInfo = getQrForMember(memberObj);
    if (!mInfo.qr) {
      showToast('Không thể tạo mã QR thanh toán.');
      return;
    }
    var isDonate = !!(extraOpts && extraOpts.isDonate && memberObj && !memberObj.isMe);
    var pName = (memberObj && memberObj.name) ? memberObj.name : 'Bạn';
    var amtLabel = mInfo.amount > 0 ? (' (' + fmt(mInfo.amount) + ')') : '';
    openQrZoomModal({
      slots: [{ id: 'qr_0', label: mInfo.label || 'QR', qr: mInfo.qr, note: mInfo.isSePay ? '' : (mInfo.note || '') }],
      slotIdx: 0,
      src: mInfo.qr,
      member: memberObj || null,
      isDonate: isDonate,
      hideInfoCard: !!mInfo.isSePay,
      amount: mInfo.isSePay ? '' : (mInfo.amount > 0 ? fmt(mInfo.amount) : ''),
      fallbackNote: mInfo.isSePay ? '' : ('Nội dung CK: ' + mInfo.memo),
      baseTitle: isDonate ? ('🎁 QR Donate cho ' + pName) : ('QR thanh toán của ' + pName),
      sub: isDonate
        ? ('Bạn đang thanh toán hộ ' + pName + amtLabel + ' cho ' + hostName + (mInfo.isSePay ? ' (đã khóa sẵn số tiền & nội dung)' : ''))
        : (mInfo.isSePay
          ? ('Quét mã bằng app ngân hàng để chuyển cho ' + hostName + ' (đã khóa tự động số tiền & nội dung)')
          : ('Mở app ngân hàng / ví điện tử và quét mã chuyển cho ' + hostName))
    });
  }

  function openHostQrViewerForMember() {
    var slots = getHostQrSlots();
    if (!slots.length) {
      showToast('Đại diện chưa thêm tài khoản / mã QR cho bill này.');
      return;
    }
    var myMember = null;
    if (cart.length > 0 && typeof computeBillSplit === 'function') {
      var sp = computeBillSplit();
      var myRows = sp.people.filter(function (p) { return p.isMe && p.finalPay > 0; });
      if (myRows.length) {
        var unpaidRow = myRows.find(function (p) { return !p.paid; });
        myMember = unpaidRow || myRows[0];
      }
    }
    if (!myMember) {
      myMember = { uid: myUid, name: myUname || 'Bạn', finalPay: 0, isMe: true };
    }
    openMemberPersonalQrModal(myMember);
  }

  function closeQrZoomModal() {
    var modal = $('qrZoomModal');
    if (modal) modal.hidden = true;
    activeQrZoomMember = null;
    activeQrZoomIsDonate = false;
  }

  function renderPayReminderPanel(allowAutoPlay) {
    var panel = $('payReminderPanel');
    if (!panel) return;

    if (!activePayUrge || !cart.length || !isOrderSubmitted() || isCurrentHost()) {
      var hadPanel = !panel.hidden;
      stopPayUrgeAudio();
      panel.hidden = true;
      panel.classList.remove('is-debtor-locked', 'is-collapsed', 'is-manual-open');
      activePayQrZoomData = null;
      if (hadPanel && !isCurrentHost() && !isOrderSubmitted()) activePayUrge = null;
      return;
    }

    var split = computeBillSplit();
    var myEntries = split.people.filter(function (p) { return p.isMe; });
    var myUnpaid = myEntries.filter(function (p) { return !p.paid && p.finalPay > 0; });
    var myUnpaidTotal = myUnpaid.reduce(function (s, p) { return s + p.finalPay; }, 0);
    var amUnpaidDebtor = (!isCurrentHost() && myUnpaid.length > 0);

    if (!amUnpaidDebtor) {
      var wasVisible = !panel.hidden;
      stopPayUrgeAudio();
      panel.hidden = true;
      panel.classList.remove('is-debtor-locked', 'is-collapsed', 'is-manual-open');
      activePayUrge = null;
      activePayQrZoomData = null;
      if (wasVisible) {
        closeQrZoomModal();
        if (myEntries.length > 0) showToast('✓ Khoản thanh toán của bạn đã được xác nhận!');
      }
      return;
    }

    var badge = $('payReminderBadge');
    var headline = $('payReminderHeadline');
    var personal = $('payReminderPersonal');
    var qrBox = $('payReminderQrBox');
    var qrImg = $('payReminderQrImg');
    var qrHost = $('payReminderQrHost');
    var qrNote = $('payReminderQrNote');
    var qrTabs = $('payReminderQrTabs');
    var soundBtn = $('btnPlayPayReminderAudio');

    panel.hidden = false;
    panel.classList.remove('is-debtor-locked', 'is-manual-open');
    panel.classList.toggle('is-collapsed', !!payReminderCollapsed);
    var toggleBtn = $('btnTogglePayReminder');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', payReminderCollapsed ? 'false' : 'true');
    if (badge) badge.textContent = payReminderCollapsed ? 'NHẮC THANH TOÁN (Bấm để mở QR)' : 'NHẮC THANH TOÁN RIÊNG';
    var amClaimed = !!myUnpaid[0].claimed;
    if (headline) {
      headline.textContent = amClaimed
        ? (myUnpaid[0].name + ', đang chờ ' + split.hostName + ' check bank xác nhận ' + fmt(myUnpaidTotal))
        : (myUnpaid[0].name + ', bạn còn ' + fmt(myUnpaidTotal) + ' chưa thanh toán!');
    }
    if (personal) {
      personal.classList.remove('is-paid-info');
      personal.innerHTML = amClaimed
        ? ('<div style="font-weight:700;color:#1D4ED8;margin-bottom:4px;">⏳ Bạn đã báo chuyển khoản! Đang chờ <strong>' + esc(split.hostName) + '</strong> kiểm tra bank &amp; xác nhận.</div>' +
           '<div class="pay-reminder-amount" style="color:#1D4ED8;">' + fmt(myUnpaidTotal) + '</div>')
        : ('<div style="font-style:italic;margin-bottom:5px;color:#9A3412;">"' + esc(activePayUrge.text) + '"</div>' +
           '<div><strong>' + esc(myUnpaid[0].name) + '</strong> vui lòng chuyển khoản cho <strong>' + esc(split.hostName) + '</strong>:</div>' +
           '<div class="pay-reminder-amount">' + fmt(myUnpaidTotal) + '</div>');
    }
    syncClaimButtonElement($('btnPayReminderClaim'));
    if (soundBtn) soundBtn.title = 'Nghe lại loa nhắc thanh toán';

    if (allowAutoPlay && !activePayUrge.autoPlayedYet) {
      activePayUrge.autoPlayedYet = true;
      playPayUrgeSound(activePayUrge.voiceId);
      sendSystemNotification({
        title: '💸 ' + split.hostName + ' nhắc trả ' + fmt(myUnpaidTotal) + ' · #' + orderCode,
        body: activePayUrge.text || 'Vui lòng kiểm tra mã QR thanh toán trên bill.',
        tag: 'uu-urgepay-' + activePayUrge.id
      });
    }

    // Hiện QR của đại diện (tự động khóa số tiền + nội dung của riêng thành viên đang mở nếu là SePay)
    var qrSlots = getHostQrSlots();
    selectedPayQrIdx = 0;
    if (qrBox && qrImg) {
      if (qrSlots.length > 0) {
        var myTargetMember = myUnpaid[0] || { uid: myUid, name: myUname || 'Bạn', finalPay: myUnpaidTotal, isMe: true };
        var personalQr = getQrForMember(myTargetMember, myUnpaidTotal);
        qrImg.src = personalQr.qr;
        qrBox.hidden = false;
        if (qrHost) {
          qrHost.textContent = 'Quét QR chuyển cho ' + split.hostName;
        }
        if (qrNote) {
          qrNote.textContent = '';
          qrNote.hidden = true;
        }
        if (qrTabs) { qrTabs.hidden = true; qrTabs.innerHTML = ''; }
        activePayQrZoomData = {
          slots: [{ id: 'qr_0', label: personalQr.label || 'QR', qr: personalQr.qr, note: personalQr.isSePay ? '' : (personalQr.note || '') }],
          slotIdx: 0,
          src: personalQr.qr,
          member: myTargetMember,
          hideInfoCard: !!personalQr.isSePay,
          amount: personalQr.isSePay ? '' : fmt(myUnpaidTotal),
          fallbackNote: personalQr.isSePay ? '' : ('Nội dung CK: ' + personalQr.memo),
          baseTitle: 'QR thanh toán của ' + myTargetMember.name,
          sub: personalQr.isSePay
            ? ('Quét mã bằng app ngân hàng để chuyển cho ' + split.hostName + ' (đã khóa tự động số tiền & nội dung)')
            : ('Đưa camera app ngân hàng / ví điện tử vào mã QR bên dưới')
        };
      } else {
        qrBox.hidden = true;
        if (qrTabs) { qrTabs.hidden = true; qrTabs.innerHTML = ''; }
        activePayQrZoomData = null;
      }
    }
  }

  function triggerUrgePayAlert(d) {
    if (!d) return;
    if (isCurrentHost()) return;

    var hasUidFilter = Array.isArray(d.targetUids);
    var hasNameFilter = Array.isArray(d.targetNames);
    if (hasUidFilter || hasNameFilter) {
      var myNormName = String(myUname || '').trim().toLowerCase();
      var matchedUid = !!(myUid && hasUidFilter && d.targetUids.indexOf(myUid) !== -1);
      var matchedName = !!(myNormName && hasNameFilter && d.targetNames.indexOf(myNormName) !== -1);
      if (!matchedUid && !matchedName) return;
    }

    if (cart.length > 0 && typeof computeBillSplit === 'function') {
      var splitNow = computeBillSplit();
      var myUnpaidNow = splitNow.people.filter(function (p) { return p.isMe && !p.paid && p.finalPay > 0; });
      if (!myUnpaidNow.length) return;
    }

    var urgeId = d.urgePayId || d.urgeId;
    if (urgeId) {
      if (seenPayUrgeIds[urgeId]) return;
      seenPayUrgeIds[urgeId] = Date.now();
    }
    var voice = getPayVoiceById(d.urgePayVoiceId || d.urgeVoiceId || 'pay-1');
    activePayUrge = {
      id: urgeId || ('payurge_' + Date.now()),
      voiceId: voice.id,
      text: d.urgePayText || d.urgeText || voice.text,
      sender: d.uname || 'Đại diện',
      ts: d.ts || Date.now(),
      autoPlayedYet: false
    };
    payReminderCollapsed = false;
    renderPayReminderPanel(true);
  }

  function sendUrgePayOrder() {
    if (hasHostAssigned() && !isCurrentHost()) {
      showToast('🔒 Chỉ Đại diện (' + (getHostName() || 'Host') + ') mới được hối trả tiền!');
      return;
    }
    if (!isOrderSubmitted()) {
      showToast('⏳ Hãy bấm "Chốt & Lưu Sheet" trước để mở khóa Hối trả tiền!');
      return;
    }
    var unpaid = getUnpaidNonHostMembers();
    if (!unpaid.length) {
      showToast('🎉 Các thành viên khác đã trả tiền đủ rồi!');
      return;
    }

    var voice = getPayVoiceById(selectedPayVoiceId);
    var now = Date.now();
    var urgeId = 'payurge_' + clientId + '_' + now;
    var targetUids = [];
    var targetNames = [];
    unpaid.forEach(function (p) {
      if (p.uid && targetUids.indexOf(p.uid) === -1) targetUids.push(p.uid);
      var normN = String(p.name || '').trim().toLowerCase();
      if (normN && targetNames.indexOf(normN) === -1) targetNames.push(normN);
    });

    closeUrgePayModal();
    maybePromptNotificationOnAction();

    var msgUrgePay = {
      type: 'urge_pay',
      kind: 'urge_pay',
      bill: orderCode,
      uid: myUid,
      uname: myUname,
      ucolor: myUcolor,
      from: clientId,
      urgePay: true,
      urgePayId: urgeId,
      urgePayVoiceId: voice.id,
      urgePayText: voice.text,
      targetUids: targetUids,
      targetNames: targetNames,
      ts: now
    };
    try { if (bc) bc.postMessage(msgUrgePay); } catch (e) {}
    if (ws && wsOk) {
      try {
        ws.send(JSON.stringify(msgUrgePay));
      } catch (e) {}
    }
    showToast('💸 Đã gửi nhắc thanh toán riêng tới ' + unpaid.length + ' bạn chưa trả!');
  }

  function fieldChanged(inputId) {
    var k = FKEY[inputId];
    var v = $(inputId) ? $(inputId).value : '';
    if (k === 'disc' || k === 'ship') {
      v = parseMoney(v);
      if (isOrderSubmitted()) {
        if (!F.savedDisc || F.savedDisc.v === null || F.savedDisc.v === undefined) {
          var prevD = (k === 'disc' && F.disc && F.disc.v !== undefined) ? Number(F.disc.v) : Number((F.disc && F.disc.v) || 0);
          F.savedDisc = { v: Math.max(0, prevD || 0), rev: 1, by: clientId };
        }
        if (!F.savedShip || F.savedShip.v === null || F.savedShip.v === undefined) {
          var prevS = (k === 'ship' && F.ship && F.ship.v !== undefined) ? Number(F.ship.v) : Number((F.ship && F.ship.v) || 0);
          F.savedShip = { v: Math.max(0, prevS || 0), rev: 1, by: clientId };
        }
      }
    }
    if (F[k] && F[k].v === v) {
      updateHostDropdownUI();
      return;
    }
    F[k] = { v: v, rev: (F[k] ? F[k].rev + 1 : 1), by: clientId };
    renderCart();
    if (typeof renderSplitBillIfOpen === 'function') renderSplitBillIfOpen();
    if (typeof renderPayReminderPanel === 'function') renderPayReminderPanel(false);
    schedulePush();
  }

  function snapshot() {
    var stId = currentStore ? currentStore.id : '';
    var isBuiltIn = (stId === 'uu-milktea' || stId === 'vua-tron');
    var slimStore = null;
    if (currentStore && !isBuiltIn) {
      slimStore = {
        id: currentStore.id,
        name: currentStore.name,
        tagline: currentStore.tagline,
        icon: currentStore.icon,
        category: currentStore.category,
        itemUnit: currentStore.itemUnit,
        options: currentStore.options,
        bankInfo: currentStore.bankInfo,
        categories: currentStore.categories,
        items: currentStore.items,
        toppings: currentStore.toppings,
        noteChips: currentStore.noteChips
      };
    }
    return {
      lines: cart,
      tomb: cartDel,
      fields: F,
      by: clientId,
      dev: deviceName(),
      ucolor: myUcolor,
      storeId: stId,
      storeData: slimStore
    };
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

    if (d.urge) {
      triggerUrgeAlert(d.uname || 'Đồng nghiệp', d.urgeText, d.urgeId, d.urgeVoiceId, d.urgeCooldownMs);
    }
    if (d.urgePay) {
      triggerUrgePayAlert(d);
    }

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
    updateHostDropdownUI();
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

  var sepaySheetSyncTimer = null;

  function onRemote(wrap, from, dev) {
    if (!wrap || from === clientId) return;
    var isSystemFrom = (from === 'server' || from === 'sepay');
    var authorName = (from === 'sepay') ? 'SePay' : ((wrap && wrap.dev) || dev || 'Bạn bè');
    if (from && !isSystemFrom) {
      if (!onlineUsers[from]) {
        onlineUsers[from] = {
          cid: from,
          uid: (wrap && wrap.by) || from,
          uname: authorName,
          ucolor: (wrap && wrap.ucolor) || '#0A7259',
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
        if (typeof renderSplitBillIfOpen === 'function') renderSplitBillIfOpen();
        if (typeof renderPayReminderPanel === 'function') {
          renderPayReminderPanel(!!(activePayUrge && !activePayUrge.autoPlayedYet));
        }
      } finally {
        applying = false;
      }
      var sender = (from === 'sepay') ? 'SePay tự động' : (m.dev || dev || authorName || 'bạn bè');
      setSyncSt('Cập nhật từ ' + sender);
      if (from === 'sepay' && isCurrentHost()) {
        clearTimeout(sepaySheetSyncTimer);
        sepaySheetSyncTimer = setTimeout(function () {
          syncBillServerStateToSheet(isOrderSubmitted());
        }, 1200);
      }
      if (m.needsPush) schedulePush();
    }
    if (!isSystemFrom) sendPresence({ active: true });
  }

  function mergeWrap(wrap) {
    var changed = false, needsPush = false, dev = '';
    var lines, tomb, fields;
    if (wrap && wrap.lines) {
      lines = wrap.lines; tomb = wrap.tomb || {}; fields = wrap.fields || {};
      dev = wrap.dev || '';
    } else return { changed: false, needsPush: false, dev: '' };

    var remoteStoreId = wrap.storeId || (wrap.storeData && wrap.storeData.id);
    if (remoteStoreId && (!currentStore || currentStore.id !== remoteStoreId)) {
      var targetStore = wrap.storeData || getStoreById(remoteStoreId);
      switchStore(targetStore, false);
      changed = true;
    }

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
      if (k === 'hostUid' && l && l.v && r.v !== l.v) {
        var allowedTransfer = (r.prevHostUid && r.prevHostUid === l.v);
        var initialRaceTieBreak = ((l.rev || 0) <= 1 && (r.rev || 0) <= 1 && !r.prevHostUid && (r.by || '') > (l.by || ''));
        if (!allowedTransfer && !initialRaceTieBreak) {
          needsPush = true;
          return;
        }
      }
      if (!l || (r.rev || 0) > (l.rev || 0) || ((r.rev || 0) === (l.rev || 0) && (r.by || '') > (l.by || ''))) {
        F[k] = Object.assign({ v: r.v, rev: r.rev || 0, by: r.by || '' }, r.prevHostUid !== undefined ? { prevHostUid: r.prevHostUid } : {});
        changed = true;
      } else if (l && (l.rev || 0) > (r.rev || 0)) {
        needsPush = true;
      }
    });

    if (isOrderSubmitted()) {
      if (!F.savedDisc || F.savedDisc.v === null || F.savedDisc.v === undefined) {
        var baseD = Math.max(0, Number(F.disc && F.disc.v !== undefined ? F.disc.v : 0) || 0);
        F.savedDisc = { v: baseD, rev: 1, by: 'sync' };
      }
      if (!F.savedShip || F.savedShip.v === null || F.savedShip.v === undefined) {
        var baseS = Math.max(0, Number(F.ship && F.ship.v !== undefined ? F.ship.v : 0) || 0);
        F.savedShip = { v: baseS, rev: 1, by: 'sync' };
      }
    }

    var remoteIds = {};
    lines.forEach(function (rc) { remoteIds[rc.lid] = true; });
    cart.forEach(function (c) {
      if (!remoteIds[c.lid] && !(cartDel[c.lid] && cartDel[c.lid].rev >= (c.rev || 0))) needsPush = true;
    });

    return { changed: changed, needsPush: needsPush, dev: dev };
  }

  function wsConnect() {
    var u = wsEndpoint();
    clearTimeout(wsRetry);
    if (ws) {
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      } catch (e) {}
      ws = null;
    }
    if (!u) { wsOk = false; liveStatus(); return; }
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
      } else if (d.type === 'urge') {
        triggerUrgeAlert(d.uname || 'Đồng nghiệp', d.urgeText, d.urgeId, d.urgeVoiceId, d.urgeCooldownMs);
      } else if (d.type === 'urge_rejected') {
        startUrgeCooldown(d.remainingMs || URGE_COOLDOWN_MS);
        var rejSec = Math.ceil((Number(d.remainingMs) || 0) / 1000);
        showToast('⏳ Chống spam: Cả nhóm cần đợi ' + rejSec + 's nữa mới gửi thoại tiếp được!');
      } else if (d.type === 'urge_cooldown') {
        startUrgeCooldown(d.remainingMs);
      } else if (d.type === 'urge_pay') {
        triggerUrgePayAlert(d);
      } else if (d.type === 'urge_pay_rejected' || d.type === 'urge_pay_cooldown') {
        payUrgeCooldownUntil = 0;
        updatePayUrgeCooldownUI();
      } else if (d.type === 'pay_claim') {
        triggerHostClaimAlert(d);
      } else if (d.type === 'urge_finalize') {
        triggerHostFinalizeAlert(d);
      } else if (d.type === 'pay_claim_cancel') {
        handleRemoteClaimCancel(d);
      } else if (d.type === 'pay_claim_rejected') {
        handleRemoteClaimRejected(d);
      } else if (d.type === 'pay_confirmed') {
        triggerPayConfirmedAlert(d);
      } else if (d.type === 'reset') {
        cart = [];
        cartDel = {};
        F = {};
        activePayUrge = null;
        hideHostClaimBanner();
        hideHostFinalizeBanner();
        stopPayUrgeAudio();
        if ($('customer')) $('customer').value = '';
        if ($('orderNote')) $('orderNote').value = '';
        if ($('discount')) $('discount').value = '0';
        if ($('shipFee')) $('shipFee').value = '0';
        initFields();
        writeInputs();
        renderCart();
        renderPayReminderPanel(false);
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
    if (typeof syncWebPushSubscription === 'function') {
      setTimeout(function () { syncWebPushSubscription(false); }, 600);
    }
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
          } else if (d.kind === 'urge') {
            triggerUrgeAlert(d.uname || 'Đồng nghiệp', d.urgeText, d.urgeId, d.urgeVoiceId, d.urgeCooldownMs);
          } else if (d.kind === 'urge_pay') {
            triggerUrgePayAlert(d);
          } else if (d.kind === 'pay_claim') {
            triggerHostClaimAlert(d);
          } else if (d.kind === 'urge_finalize') {
            triggerHostFinalizeAlert(d);
          } else if (d.kind === 'pay_claim_cancel') {
            handleRemoteClaimCancel(d);
          } else if (d.kind === 'pay_claim_rejected') {
            handleRemoteClaimRejected(d);
          } else if (d.kind === 'pay_confirmed') {
            triggerPayConfirmedAlert(d);
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

    var catObj = (currentStore.categories || []).find(function (c) {
      return c.id === currentCat || c.name === currentCat;
    });

    var filtered = MENU.filter(function (m) {
      if (currentCat !== 'all') {
        var match = (m.nhom === currentCat);
        if (!match && catObj) {
          match = (m.nhom === catObj.id || m.nhom === catObj.name);
        }
        if (!match && (currentCat === 'Món trộn' || currentCat === 'montron') && m.nhom === 'monchinh') {
          match = true;
        }
        if (!match && currentCat === 'monchinh' && (m.nhom === 'Món trộn' || m.nhom === 'montron')) {
          match = true;
        }
        if (!match) return false;
      }
      if (q && m.ten.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if ($('currentCatTitle')) $('currentCatTitle').textContent = (catObj && catObj.title) || (catObj && catObj.name) || (CAT_INFO[currentCat] && CAT_INFO[currentCat].title) || 'Danh sách món';
    if ($('currentCatSub')) $('currentCatSub').textContent = (catObj && catObj.sub) || (CAT_INFO[currentCat] && CAT_INFO[currentCat].sub) || '';
    var unitStr = (currentStore && currentStore.itemUnit) || 'món';
    if ($('currentCatCount')) $('currentCatCount').textContent = filtered.length + ' ' + unitStr;

    filtered.forEach(function (m) {
      var card = document.createElement('div');
      var isTopping = (m.nhom === 'topping');
      card.className = 'product-card' + (isTopping ? ' pcard-topping' : '');

      var hasOptSize = currentStore.options && currentStore.options.hasSize;
      var priceHtml = '';
      if (isTopping) {
        priceHtml = fmt(m.gia) + (m.note ? ' <span class="subnote">(' + esc(m.note) + ')</span>' : '');
      } else if (hasOptSize && m.giaXL) {
        priceHtml = fmtK(m.giaM) + ' · ' + fmtK(m.giaL) + ' · ' + fmtK(m.giaXL);
      } else if (hasOptSize && m.giaL) {
        priceHtml = 'M ' + fmtK(m.giaM) + ' · L ' + fmtK(m.giaL) + (m.note ? ' <span class="subnote">(' + esc(m.note) + ')</span>' : '');
      } else {
        priceHtml = fmt(m.giaM || m.gia || 0) + (m.note ? ' <span class="subnote">(' + esc(m.note) + ')</span>' : '');
      }
      var btnLabel = isTopping ? '+ Thêm món' : '+ Chọn món';

      var itemImg = resolveItemImg(m, isTopping);
      var imgHtml = '';
      if (itemImg) {
        imgHtml =
          '<div class="pcard-img-wrap">' +
            '<img src="' + itemImg + '" alt="' + esc(m.ten) + '" loading="lazy" onerror="this.onerror=null;this.parentElement.className=\'pcard-img-wrap pcard-emoji-wrap\';this.parentElement.innerHTML=\'<span class=\\\'pcard-emoji\\\' style=\\\'color:#0A7259;\\\'>' + getStoreSvg(currentStore, 32).replace(/"/g, '&quot;') + '</span>\';">' +
          '</div>';
      } else {
        var itemSvg = getCategorySvg(m.nhom, '', m.emoji || (catObj && catObj.icon), 32);
        imgHtml =
          '<div class="pcard-img-wrap pcard-emoji-wrap">' +
            '<span class="pcard-emoji" style="color:#0A7259;">' + itemSvg + '</span>' +
          '</div>';
      }

      card.innerHTML =
        imgHtml +
        '<div class="pcard-info">' +
          '<h4>' + esc(m.ten) + '</h4>' +
          '<div class="price-tag">' + priceHtml + '</div>' +
          '<button class="btn-choose" type="button">' + btnLabel + '</button>' +
        '</div>';

      card.onclick = function () {
        if (isOrderSubmitted()) {
          showToast('Đơn đã chốt & lưu Sheet! Không thể thêm món mới.');
          return;
        }
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
    if (isOrderSubmitted()) {
      showToast('Đơn đã chốt & lưu Sheet! Không thể thêm hoặc sửa món.');
      return;
    }
    curCustomItem = menuItem;
    curEditingLine = cartLine || null;

    var modal = $('itemModal');
    var title = $('modalDrinkName');
    var sub = $('modalDrinkSub');
    var drinker = $('custDrinkerName');
    var note = $('custItemNote');
    var btnConfirm = $('btnConfirmItem');

    if (!modal) return;

    var isFood = (currentStore && (currentStore.itemUnit === 'phần' || currentStore.category === 'anvat' || currentStore.category === 'comtrua'));
    var titleLbl = $('custDrinkerLabel');
    if (titleLbl) titleLbl.textContent = isFood ? 'Phần của ai?' : 'Ly của ai?';
    title.textContent = (menuItem ? menuItem.ten : (cartLine ? cartLine.name : 'Tùy chọn'));
    sub.textContent = cartLine ? 'Chỉnh sửa món của bạn' : 'Tùy chọn món của bạn';

    // Default or existing values
    if (cartLine) {
      curSelectedSize = cartLine.size || 'M';
      curSelectedSugar = cartLine.sugar || '100%';
      curSelectedIce = cartLine.ice || 'Nhiều đá';
      curSelectedToppings = (cartLine.toppings || []).map(function (t) { return Object.assign({}, t); });
      drinker.value = cartLine.uname || cartLine.owner || myUname;
      note.value = cartLine.note || '';
      btnConfirm.textContent = 'Cập nhật món này';
      // Broadcast presence focus
      sendPresence({ lid: cartLine.lid, action: 'sửa món' });
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

    if ($('custNoteLabel')) $('custNoteLabel').textContent = 'Ghi chú món';
    if (note) {
      note.placeholder = isFood ? 'Ghi chú (vd: nhiều rau, ít cay, thêm chả, không hành…)' : 'Ghi chú (vd: ít ngọt, nhiều đá, trân châu mềm…)';
    }

    var opts = (currentStore && currentStore.options) || { hasSize: true, hasSugar: true, hasIce: true, hasToppings: true };
    var hideOptions = isToppingOnly || (menuItem && menuItem.nhom === 'topping') || (cartLine && cartLine.size === 'TP');

    // Hide/show size or portion
    var secSize = $('custSizeSection');
    var sizeGrp = $('custSizeGroup');
    var sizeLbl = $('custSizeLabel');
    if (secSize && sizeGrp) {
      if (!hideOptions && opts.hasSize && menuItem && (menuItem.giaL || menuItem.giaXL)) {
        secSize.style.display = 'block';
        if (sizeLbl) sizeLbl.textContent = isFood ? 'Chọn Phần' : 'Chọn Size';

        var sizeOptions = [];
        if (menuItem.giaXL) {
          sizeOptions = [
            { id: 'M', label: isFood ? 'Thường' : 'Size M', price: menuItem.giaM },
            { id: 'L', label: isFood ? 'Lớn' : 'Size L', price: menuItem.giaL },
            { id: 'XL', label: isFood ? 'Đặc biệt' : 'Size XL', price: menuItem.giaXL }
          ];
        } else if (menuItem.giaL) {
          sizeOptions = [
            { id: 'M', label: isFood ? 'Thường' : 'Size M', price: menuItem.giaM },
            { id: 'L', label: isFood ? 'Lớn' : 'Size L', price: menuItem.giaL }
          ];
        }
        sizeGrp.innerHTML = '';
        sizeOptions.forEach(function (so) {
          var card = document.createElement('button');
          card.type = 'button';
          card.className = 'size-card' + (curSelectedSize === so.id ? ' is-active' : '');
          card.dataset.size = so.id;
          card.innerHTML =
            '<span class="size-card-name">' + esc(so.label) + '</span>' +
            '<span class="size-card-price">' + fmt(so.price) + '</span>';
          card.onclick = function () {
            curSelectedSize = so.id;
            sizeGrp.querySelectorAll('.size-card').forEach(function (x) { x.classList.remove('is-active'); });
            card.classList.add('is-active');
            updateCustomizerPrice();
          };
          sizeGrp.appendChild(card);
        });
      } else {
        secSize.style.display = 'none';
        curSelectedSize = 'M';
      }
    }

    // Hide/show sugar
    var secSugar = $('custSugarSection');
    if (secSugar) {
      secSugar.style.display = (!hideOptions && opts.hasSugar) ? 'block' : 'none';
    }

    // Hide/show ice
    var secIce = $('custIceSection');
    if (secIce) {
      secIce.style.display = (!hideOptions && opts.hasIce) ? 'block' : 'none';
    }

    // Hide/show topping section
    var secTopping = $('custToppingSection');
    if (secTopping) {
      var tops = toppingsList();
      var showTopping = !hideOptions && (opts.hasToppings !== false) && (tops.length > 0);
      secTopping.style.display = showTopping ? 'block' : 'none';
    }

    // Sugar chips
    document.querySelectorAll('#custSugarGroup .chip-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.sugar === curSelectedSugar);
    });

    // Ice chips
    document.querySelectorAll('#custIceGroup .chip-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.ice === curSelectedIce);
    });

    // Render Note Chips
    renderNoteChips();

    // Render Toppings
    renderCustomizerToppings();
    updateCustomizerPrice();

    modal.hidden = false;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function renderNoteChips() {
    var sec = $('custNoteChipsGroup');
    var input = $('custItemNote');
    if (!sec || !input) return;

    var chips = (currentStore && currentStore.noteChips) || [];
    if (!chips || chips.length === 0) {
      sec.style.display = 'none';
      sec.innerHTML = '';
      return;
    }

    sec.style.display = 'flex';
    sec.innerHTML = '';

    function getActiveChips() {
      var noteVal = (input.value || '').toLowerCase();
      var active = [];
      chips.forEach(function (c) {
        if (noteVal.indexOf(c.toLowerCase()) !== -1) {
          active.push(c);
        }
      });
      return active;
    }

    function syncChipsActive() {
      var activeList = getActiveChips();
      sec.querySelectorAll('.note-chip-btn').forEach(function (btn) {
        var chipText = btn.dataset.chip;
        btn.classList.toggle('is-active', activeList.indexOf(chipText) !== -1);
      });
    }

    chips.forEach(function (chipText) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'note-chip-btn';
      btn.dataset.chip = chipText;
      btn.textContent = chipText;

      btn.onclick = function (e) {
        e.preventDefault();
        var curVal = input.value.trim();
        var regex = new RegExp('(?:,\\s*)?' + escapeRegExp(chipText) + '(?:\\s*,)?', 'gi');
        if (regex.test(curVal)) {
          var newVal = curVal.replace(regex, ', ').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
          input.value = newVal;
        } else {
          if (curVal.length > 0) {
            input.value = curVal + ', ' + chipText;
          } else {
            input.value = chipText;
          }
        }
        syncChipsActive();
        sendPresence({ lid: curEditingLine ? curEditingLine.lid : 'new', action: 'chọn ghi chú' });
      };

      sec.appendChild(btn);
    });

    syncChipsActive();
    input.oninput = function () {
      syncChipsActive();
    };
  }

  function renderCustomizerToppings() {
    var grid = $('custToppingsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    toppingsList().forEach(function (tp) {
      var found = null;
      curSelectedToppings.forEach(function (t) { if (t.id === tp.id) found = t; });

      var topImg = TOPPING_IMGS[tp.id] || tp.img || '';
      var thumbHtml = topImg ?
        ('<img class="top-chip-thumb" src="' + topImg + '" alt="' + esc(tp.ten) + '" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\';this.parentElement.insertAdjacentHTML(\'afterbegin\', \'<span class=\\\'top-chip-thumb\\\' style=\\\'display:flex;align-items:center;justify-content:center;background:#F1F5F9;color:#0A7259;\\\'><svg width=\\\'15\\\' height=\\\'15\\\' viewBox=\\\'0 0 24 24\\\' fill=\\\'currentColor\\\'><path d=\\\'M12 2l2.4 5.6L20 10l-4.2 4 1.2 5.8-5-3-5 3 1.2-5.8L4 10l5.6-2.4L12 2z\\\'/></svg></span>\');">') :
        ('<span class="top-chip-thumb" style="display:flex;align-items:center;justify-content:center;background:#F1F5F9;color:#0A7259;"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 5.6L20 10l-4.2 4 1.2 5.8-5-3-5 3 1.2-5.8L4 10l5.6-2.4L12 2z"/></svg></span>');

      var div = document.createElement('div');
      div.className = 'top-chip' + (found ? ' is-selected' : '');
      div.innerHTML =
        thumbHtml +
        '<div class="top-name-price">' +
          '<b>' + esc(tp.ten) + '</b>' +
          '<span>+' + fmtK(tp.gia) + '</span>' +
        '</div>' +
        '<div class="top-stepper">' +
          (found ? '<button type="button" class="btn-dec" title="Bớt số lượng">−</button><span>' + found.qty + '</span>' : '') +
          '<button type="button" class="btn-inc" title="Thêm số lượng">+</button>' +
        '</div>';

      // Full card click adds / increments
      div.onclick = function (e) {
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

      var btnInc = div.querySelector('.btn-inc');
      var btnDec = div.querySelector('.btn-dec');

      if (btnInc) {
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
      }

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
    var it = curCustomItem || (curEditingLine ? menuById(curEditingLine.id) : null);
    if (it) {
      if (it.nhom === 'topping') {
        basePrice = it.gia;
      } else if (curSelectedSize === 'XL') {
        basePrice = it.giaXL || it.giaL || it.giaM || 0;
      } else if (curSelectedSize === 'L') {
        basePrice = it.giaL || it.giaM || 0;
      } else {
        basePrice = it.giaM || it.gia || 0;
      }
    } else if (curEditingLine) {
      basePrice = curEditingLine.price || 0;
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

    var submitted = isOrderSubmitted();
    var hasDonateQr = submitted && getHostQrSlots().length > 0;
    var cartVp = ul.closest('.cart-viewport');
    if (cartVp) {
      cartVp.classList.toggle('is-submitted', submitted);
    }
    if ($('cartTableActHead')) {
      $('cartTableActHead').textContent = submitted ? 'TRẢ' : 'SỬA';
    }

    cart.forEach(function (c, idx) {
      normLine(c);
      var li = document.createElement('li');
      li.className = 'c-row';
      li.dataset.lid = c.lid;

      var isMine = canEditRow(c);
      var canManagePay = canActAsHostOrOpen();
      var canMutateRow = isMine && !submitted;
      var shortOpt = shortOptText(c);
      var ucol = (isMine ? myUcolor : (c.ucolor || '#0A7259'));
      var rowPayTarget = { uid: c.uid || '', name: c.uname || c.owner || 'Khách' };
      var showRowPayState = submitted;
      var rowPaid = showRowPayState ? isMemberPaid(rowPayTarget) : false;
      var rowClaimed = showRowPayState && !rowPaid && isMemberClaimed(rowPayTarget);

      // 0. Border highlight & paid/claimed/unpaid state (hiển thị trạng thái trả tiền công khai cho tất cả thành viên)
      li.style.borderLeft = '3.5px solid ' + (showRowPayState && rowPaid ? '#10B981' : (rowClaimed ? '#2563EB' : ucol));
      li.classList.toggle('is-row-paid', showRowPayState && rowPaid);
      li.classList.toggle('is-row-claimed', rowClaimed);
      li.classList.toggle('is-row-unpaid', showRowPayState && !rowPaid && !rowClaimed);

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
      var szStr = formatSizeLabel(c.size);
      desc.title = c.name + (szStr ? ' (' + szStr + ')' : '') + (shortOpt ? ' · ' + shortOpt : '');
      desc.innerHTML =
        '<strong class="c-name">' + esc(c.name) + '</strong>' +
        (szStr ? '<span class="c-sz">(' + esc(szStr) + ')</span>' : '') +
        (shortOpt ? '<span class="c-opts">· ' + esc(shortOpt) + '</span>' : '');

      itemCol.appendChild(desc);

      if (canMutateRow) {
        itemCol.onclick = function () {
          var m = menuById(c.id);
          openItemCustomizer(m, c, c.size === 'TP');
        };
      }
      li.appendChild(itemCol);

      // 3. Số lượng (+ / - hoặc khóa)
      var qtyCol = document.createElement('div');
      qtyCol.className = 'c-qty';
      if (canMutateRow) {
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
        locked.title = submitted
          ? 'Đơn đã chốt & lưu Sheet'
          : ('Chỉ ' + (c.uname || 'chủ món') + ' mới có quyền sửa');
        locked.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:2px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' + c.qty + 'x';
        qtyCol.appendChild(locked);
      }
      li.appendChild(qtyCol);

      // 4. Thành tiền
      var priceCol = document.createElement('span');
      priceCol.className = 'c-price';
      priceCol.textContent = fmtK(lineTotal(c));
      li.appendChild(priceCol);

      // 5. Thao tác: trước khi chốt = Sửa/Xóa; sau khi chốt = Host duyệt (checkbox xanh) / Member tự báo CK (checkbox xanh dương) / Xem trạng thái
      var actCol = document.createElement('div');
      actCol.className = 'c-acts';
      if (submitted) {
        if (canManagePay) {
          var lblChk = document.createElement('label');
          lblChk.className = 'c-paid-check' + (rowClaimed ? ' is-claimed-pending' : '');
          lblChk.title = rowPaid
            ? ('Đã đánh dấu ' + rowPayTarget.name + ' ĐÃ TRẢ — bỏ tick nếu nhầm')
            : (rowClaimed
              ? (rowPayTarget.name + ' đã báo chuyển khoản! Check bank rồi tick để XÁC NHẬN đã nhận')
              : ('Tick đánh dấu ' + rowPayTarget.name + ' ĐÃ THANH TOÁN'));
          var chk = document.createElement('input');
          chk.type = 'checkbox';
          chk.className = 'c-paid-checkbox';
          chk.checked = rowPaid;
          chk.onchange = function (e) {
            e.stopPropagation();
            toggleMemberPaid(rowPayTarget);
          };
          lblChk.onclick = function (e) { e.stopPropagation(); };
          lblChk.appendChild(chk);
          actCol.appendChild(lblChk);
        } else if (isMine && !rowPaid) {
          var claimLbl = document.createElement('label');
          claimLbl.className = 'c-claim-check' + (rowClaimed ? ' is-claimed' : '');
          claimLbl.title = rowClaimed
            ? 'Đã báo chuyển khoản (chờ Đại diện check bank xác nhận) — bỏ tick nếu bấm nhầm'
            : 'Tick vào đây khi bạn đã chuyển khoản xong để báo Đại diện check bank';
          var claimChk = document.createElement('input');
          claimChk.type = 'checkbox';
          claimChk.className = 'c-claim-checkbox';
          claimChk.checked = rowClaimed;
          claimChk.onchange = function (e) {
            e.stopPropagation();
            toggleMyPayClaim(rowPayTarget);
          };
          claimLbl.onclick = function (e) { e.stopPropagation(); };
          claimLbl.appendChild(claimChk);
          actCol.appendChild(claimLbl);
        } else if (!isMine && !rowPaid && !rowClaimed && hasDonateQr) {
          var donateBtn = document.createElement('button');
          donateBtn.type = 'button';
          donateBtn.className = 'c-donate-btn';
          donateBtn.title = 'Thanh toán hộ (Donate) cho ' + rowPayTarget.name;
          donateBtn.innerHTML = '🎁<span>Donate</span>';
          donateBtn.onclick = function (e) {
            e.stopPropagation();
            openDonateConfirmModal(rowPayTarget);
          };
          actCol.appendChild(donateBtn);
        } else {
          var statusPill = document.createElement('span');
          statusPill.className = 'c-row-paid-pill ' + (rowPaid ? 'is-paid' : (rowClaimed ? 'is-claimed' : 'is-unpaid'));
          statusPill.title = rowPaid
            ? (isMine ? 'Bạn đã thanh toán' : (rowPayTarget.name + ' đã thanh toán'))
            : (rowClaimed
              ? (rowPayTarget.name + ' đã báo CK · Chờ Đại diện check bank')
              : (isMine ? 'Bạn chưa thanh toán' : (rowPayTarget.name + ' chưa thanh toán')));
          if (rowPaid) {
            statusPill.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
          } else if (rowClaimed) {
            statusPill.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>';
          } else {
            statusPill.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>';
          }
          actCol.appendChild(statusPill);
        }
      } else if (canMutateRow) {
        var btnEdit = document.createElement('button');
        btnEdit.className = 'c-abtn edit';
        btnEdit.title = 'Tùy chọn món này';
        btnEdit.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
        btnEdit.onclick = function (e) {
          e.stopPropagation();
          var m = menuById(c.id);
          openItemCustomizer(m, c, c.size === 'TP');
        };

        var btnDel = document.createElement('button');
        btnDel.className = 'c-abtn del';
        btnDel.title = 'Xóa món này khỏi bill';
        btnDel.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
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
        iconLock.title = 'Chỉ ' + (c.uname || 'chủ món') + ' mới có quyền sửa';
        iconLock.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
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
    if ($('discountVal')) {
      $('discountVal').textContent = t.disc ? '−' + fmt(t.disc) : '0đ';
      var discRow = $('discountVal').closest('.discount-line');
      if (discRow) discRow.classList.toggle('has-discount', t.disc > 0);
    }
    if ($('shipFeeVal')) $('shipFeeVal').textContent = t.ship ? '+' + fmt(t.ship) : '0đ';
    if ($('adjTotal')) $('adjTotal').textContent = (t.disc ? '−' + fmtK(t.disc) : '0k') + ' + ' + fmtK(t.ship);
    if ($('grandTotal')) $('grandTotal').textContent = fmt(t.grand);
    var unitStr = (currentStore && currentStore.itemUnit) || 'món';
    if ($('cupCountBadge')) $('cupCountBadge').textContent = t.totalCups + ' ' + unitStr;
    if (typeof recordRecentBillSnapshot === 'function') recordRecentBillSnapshot(t);

    // Cập nhật thanh Mobile bar
    if ($('mobileCartTotal')) $('mobileCartTotal').textContent = fmt(t.grand);
    if ($('mobileCartCount')) $('mobileCartCount').textContent = t.totalCups + ' ' + unitStr;

    if ($('orderCode')) $('orderCode').textContent = orderCode;

    updateHostDropdownUI();
    if ($('qrZoomModal') && !$('qrZoomModal').hidden) {
      if (activeQrZoomMember && cart.length > 0 && typeof computeBillSplit === 'function') {
        var spZoom = computeBillSplit();
        var zoomKey = getMemberPayKey(activeQrZoomMember);
        var freshZoomM = spZoom.people.find(function (x) { return getMemberPayKey(x) === zoomKey; });
        if (freshZoomM && freshZoomM.paid && (freshZoomM.isMe || activeQrZoomIsDonate)) {
          var paidWasDonate = activeQrZoomIsDonate && !freshZoomM.isMe;
          var paidWhoName = freshZoomM.name || 'thành viên';
          closeQrZoomModal();
          showToast(paidWasDonate
            ? ('🎉 Thanh toán hộ (Donate) cho ' + paidWhoName + ' đã được xác nhận!')
            : '✓ Thanh toán của bạn đã được xác nhận thành công!');
        } else if (freshZoomM) {
          activeQrZoomMember = freshZoomM;
          var freshQr = getQrForMember(freshZoomM);
          if (freshQr.qr && $('qrZoomImg') && $('qrZoomImg').src !== freshQr.qr) {
            $('qrZoomImg').src = freshQr.qr;
          }
        }
      }
      if (typeof syncClaimButtonElement === 'function') {
        syncClaimButtonElement($('btnQrZoomClaimPaid'), activeQrZoomMember, activeQrZoomIsDonate);
      }
    }
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

  /* ================= 8. QR ĐẠI DIỆN, CHIA TIỀN & CANVAS BILL HIỆN ĐẠI ================= */
  function getMemberPayKey(p) {
    if (!p) return '';
    if (p.uid) return 'u:' + String(p.uid);
    return 'n:' + String(p.name || '').trim().toLowerCase();
  }

  function isMemberPaid(p) {
    var pm = (F.paidMap && F.paidMap.v && typeof F.paidMap.v === 'object') ? F.paidMap.v : {};
    var key = getMemberPayKey(p);
    if (key && pm[key] === true) return true;
    var nameKey = 'n:' + String((p && p.name) || '').trim().toLowerCase();
    return !!pm[nameKey];
  }

  function getMemberClaim(p) {
    if (!p || isMemberPaid(p)) return null;
    var cm = (F.payClaimMap && F.payClaimMap.v && typeof F.payClaimMap.v === 'object') ? F.payClaimMap.v : {};
    var key = getMemberPayKey(p);
    if (key && cm[key] && cm[key].ts) return cm[key];
    var nameKey = 'n:' + String((p && p.name) || '').trim().toLowerCase();
    if (nameKey && cm[nameKey] && cm[nameKey].ts) return cm[nameKey];
    return null;
  }

  function isMemberClaimed(p) {
    return !!getMemberClaim(p);
  }

  function sendRoomEvent(evt) {
    if (!evt || !evt.type || !orderCode) return;
    var msg = Object.assign({
      bill: orderCode,
      from: clientId,
      ts: Date.now()
    }, evt, { kind: evt.type });
    try { if (bc) bc.postMessage(msg); } catch (e) {}
    if (ws && wsOk) {
      try { ws.send(JSON.stringify(msg)); } catch (e) {}
    }
  }

  function clearMemberClaimInMap(cmCopy, p) {
    var changed = false;
    var key = getMemberPayKey(p);
    var nameKey = 'n:' + String((p && p.name) || '').trim().toLowerCase();
    if (key && cmCopy[key] !== undefined) {
      delete cmCopy[key];
      changed = true;
    }
    if (nameKey && cmCopy[nameKey] !== undefined) {
      delete cmCopy[nameKey];
      changed = true;
    }
    return changed;
  }

  function broadcastPayConfirmed(p, finalAmount) {
    var amt = Number(finalAmount);
    if (!amt && cart.length > 0 && typeof computeBillSplit === 'function') {
      var sp = computeBillSplit();
      var found = sp.people.find(function (x) { return getMemberPayKey(x) === getMemberPayKey(p); });
      if (found) amt = Number(found.finalPay) || 0;
    }
    sendRoomEvent({
      type: 'pay_confirmed',
      confirmId: 'pconf_' + clientId + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      hostUid: getHostUid() || myUid,
      hostName: getHostName() || myUname || 'Đại diện',
      payerUid: (p && p.uid) || '',
      payerName: (p && p.name) || 'Thành viên',
      amount: amt || 0,
      text: PAY_CONFIRMED_TEXT,
      audio: PAY_CONFIRMED_AUDIO
    });
  }

  function setMemberPaidState(p, nextPaid) {
    if (!isCurrentHost() && hasHostAssigned()) {
      showToast('Chỉ Đại diện (' + (getHostName() || 'Host') + ') mới được đánh dấu đã trả tiền!');
      return;
    }
    var curMap = (F.paidMap && F.paidMap.v && typeof F.paidMap.v === 'object')
      ? Object.assign({}, F.paidMap.v)
      : {};
    var key = getMemberPayKey(p);
    var nameKey = 'n:' + String((p && p.name) || '').trim().toLowerCase();
    var nextVal = !!nextPaid;
    if (key) curMap[key] = nextVal;
    if (!nextVal && curMap[nameKey] !== undefined) curMap[nameKey] = false;
    setSyncedField('paidMap', curMap);

    var curClaims = (F.payClaimMap && F.payClaimMap.v && typeof F.payClaimMap.v === 'object')
      ? Object.assign({}, F.payClaimMap.v)
      : {};
    if (clearMemberClaimInMap(curClaims, p)) {
      setSyncedField('payClaimMap', curClaims);
    }
    if (activeHostClaimTarget && getMemberPayKey(activeHostClaimTarget) === getMemberPayKey(p)) {
      hideHostClaimBanner();
    }

    renderCart();
    renderHostPayTracker();
    renderSplitBillIfOpen();
    if (typeof renderPayReminderPanel === 'function') renderPayReminderPanel(false);
    rtSend();
    syncBillServerStateToSheet(isOrderSubmitted());

    if (nextVal) {
      broadcastPayConfirmed(p, p && p.finalPay);
      showToast('✓ Đã xác nhận ' + p.name + ' ĐÃ TRẢ (đã phát thông báo cả phòng bill)');
    } else {
      showToast('↩ Đã chuyển ' + p.name + ' về CHƯA TRẢ');
    }
  }

  function toggleMemberPaid(p) {
    setMemberPaidState(p, !isMemberPaid(p));
  }

  function toggleMyPayClaim(targetObj, claimOpts) {
    if (!isOrderSubmitted()) {
      showToast('⏳ Cần bấm "Chốt & Lưu Sheet" trước khi báo chuyển khoản!');
      return;
    }
    var donatedBy = (claimOpts && claimOpts.donatedBy) ? String(claimOpts.donatedBy).trim() : '';
    var p = targetObj || { uid: myUid, name: myUname || 'Bạn' };
    var pIsMe = isMyUid(p.uid) || (!p.uid && myUname && String(p.name || '').trim().toLowerCase() === myUname.trim().toLowerCase());
    if (!pIsMe && !donatedBy && hasHostAssigned()) {
      showToast('🔒 Bạn chỉ có thể tự đánh dấu phần thanh toán của chính mình!');
      return;
    }
    if (isMemberPaid(p)) {
      showToast(pIsMe ? '✓ Đại diện đã xác nhận bạn đã trả tiền rồi!' : ('✓ ' + p.name + ' đã được xác nhận trả tiền rồi!'));
      return;
    }
    var sp = (cart.length > 0) ? computeBillSplit() : null;
    var targetEntry = null;
    if (sp) {
      if (pIsMe) {
        targetEntry = sp.people.find(function (x) { return x.isMe; }) || null;
      } else {
        var tKey = getMemberPayKey(p);
        targetEntry = sp.people.find(function (x) { return getMemberPayKey(x) === tKey; }) || null;
      }
    }
    var claimSubject = targetEntry || p;
    var claimAmt = targetEntry ? targetEntry.finalPay : (Number(p.finalPay) || 0);

    var curClaims = (F.payClaimMap && F.payClaimMap.v && typeof F.payClaimMap.v === 'object')
      ? Object.assign({}, F.payClaimMap.v)
      : {};
    var key = getMemberPayKey(claimSubject);
    var alreadyClaimed = isMemberClaimed(claimSubject);

    if (alreadyClaimed) {
      clearMemberClaimInMap(curClaims, claimSubject);
      setSyncedField('payClaimMap', curClaims);
      renderCart();
      renderHostPayTracker();
      renderSplitBillIfOpen();
      if (typeof renderPayReminderPanel === 'function') renderPayReminderPanel(false);
      rtSend();
      syncBillServerStateToSheet(true);
      sendRoomEvent({
        type: 'pay_claim_cancel',
        uid: claimSubject.uid || (pIsMe ? myUid : '') || '',
        uname: claimSubject.name || myUname || 'Thành viên',
        hostUid: getHostUid(),
        hostName: getHostName()
      });
      showToast(donatedBy ? ('↩ Đã hủy báo chuyển khoản hộ ' + claimSubject.name + '.') : '↩ Đã hủy báo chuyển khoản.');
      return;
    }

    var qrSlots = getHostQrSlots();
    var activeSlot = qrSlots[Math.min(selectedPayQrIdx, Math.max(0, qrSlots.length - 1))] || null;
    var activeSlotLabel = activeSlot ? formatQrSlotDisplayName(activeSlot, Math.min(selectedPayQrIdx, qrSlots.length - 1)) : '';
    var now = Date.now();
    curClaims[key] = {
      uid: claimSubject.uid || (pIsMe ? myUid : '') || '',
      name: claimSubject.name || myUname || 'Thành viên',
      amount: claimAmt,
      qrLabel: activeSlotLabel,
      donatedBy: donatedBy || '',
      ts: now
    };
    setSyncedField('payClaimMap', curClaims);
    renderCart();
    renderHostPayTracker();
    renderSplitBillIfOpen();
    if (typeof renderPayReminderPanel === 'function') renderPayReminderPanel(false);
    rtSend();
    syncBillServerStateToSheet(true);

    sendRoomEvent({
      type: 'pay_claim',
      claimId: 'claim_' + clientId + '_' + now,
      uid: claimSubject.uid || (pIsMe ? myUid : '') || '',
      uname: claimSubject.name || myUname || 'Thành viên',
      donatedBy: donatedBy || '',
      amount: claimAmt,
      qrLabel: activeSlotLabel,
      hostUid: getHostUid(),
      hostName: getHostName()
    });
    maybePromptNotificationOnAction();
    showToast(donatedBy
      ? ('🎁 Đã báo chuyển khoản hộ ' + claimSubject.name + '! Chờ Đại diện check bank xác nhận.')
      : '🔔 Đã báo chuyển khoản! Chờ Đại diện check bank xác nhận.');
  }

  function rejectMemberPayClaim(p) {
    if (!isCurrentHost() && hasHostAssigned()) {
      showToast('Chỉ Đại diện mới được từ chối yêu cầu xác nhận!');
      return;
    }
    var curClaims = (F.payClaimMap && F.payClaimMap.v && typeof F.payClaimMap.v === 'object')
      ? Object.assign({}, F.payClaimMap.v)
      : {};
    clearMemberClaimInMap(curClaims, p);
    setSyncedField('payClaimMap', curClaims);
    if (activeHostClaimTarget && getMemberPayKey(activeHostClaimTarget) === getMemberPayKey(p)) {
      hideHostClaimBanner();
    }
    renderCart();
    renderHostPayTracker();
    renderSplitBillIfOpen();
    if (typeof renderPayReminderPanel === 'function') renderPayReminderPanel(false);
    rtSend();
    syncBillServerStateToSheet(isOrderSubmitted());
    sendRoomEvent({
      type: 'pay_claim_rejected',
      targetUid: (p && p.uid) || '',
      targetName: String((p && p.name) || '').trim().toLowerCase(),
      hostName: getHostName() || myUname || 'Đại diện'
    });
    showToast('Đã chuyển ' + p.name + ' về Chưa trả (Chờ kiểm tra lại).');
  }

  function computeBillSplit() {
    var t = totals();
    var netAdj = t.ship - t.disc;
    var hostUid = getHostUid();
    var hostName = getHostName() || myUname || 'Host';
    var personMap = {};

    cart.forEach(function (c) {
      var name = (c.uname || c.owner || 'Bạn').trim() || 'Bạn';
      var isMeRow = isMyUid(c.uid) || (!c.uid && myUname && name.toLowerCase() === myUname.trim().toLowerCase());
      var ucol = isMeRow ? myUcolor : (c.ucolor || '#0A7259');
      var key = c.uid ? ('u:' + c.uid) : ('n:' + name.toLowerCase());
      if (c.uid && !personMap[key] && personMap['n:' + name.toLowerCase()]) {
        personMap[key] = personMap['n:' + name.toLowerCase()];
        personMap[key].uid = c.uid;
        delete personMap['n:' + name.toLowerCase()];
      }
      if (!personMap[key]) {
        personMap[key] = {
          uid: c.uid || '',
          name: name,
          ucolor: ucol,
          cups: 0,
          drinkSub: 0,
          isMe: isMeRow
        };
      }
      if (isMeRow) personMap[key].isMe = true;
      personMap[key].drinkSub += lineTotal(c);
      if (c.size !== 'TP') personMap[key].cups += (c.qty || 1);
    });

    var people = Object.keys(personMap).map(function (k) {
      var p = personMap[k];
      var share = (t.sub > 0) ? Math.round(netAdj * (p.drinkSub / t.sub)) : 0;
      var finalPay = Math.max(0, p.drinkSub + share);
      var isHostPerson = hostUid
        ? (p.uid && p.uid === hostUid)
        : (hostName && p.name.toLowerCase() === hostName.toLowerCase());
      p.share = share;
      p.finalPay = finalPay;
      p.isHost = !!isHostPerson;
      p.payKey = getMemberPayKey(p);
      p.paid = isMemberPaid(p);
      p.claimed = !p.paid && isMemberClaimed(p);
      return p;
    });

    people.sort(function (a, b) {
      if (a.paid !== b.paid) return a.paid ? 1 : -1;
      if (a.claimed !== b.claimed) return a.claimed ? -1 : 1;
      if (a.isHost !== b.isHost) return a.isHost ? -1 : 1;
      return b.finalPay - a.finalPay;
    });

    return { t: t, netAdj: netAdj, hostName: hostName, hostUid: hostUid, people: people };
  }

  function getUnpaidMembers() {
    var split = computeBillSplit();
    return split.people.filter(function (p) { return !p.paid && p.finalPay > 0; });
  }

  function getUnpaidNonHostMembers() {
    return getUnpaidMembers().filter(function (p) { return !p.isHost; });
  }

  function renderSplitBillIfOpen() {
    var imgModal = $('imageExportModal');
    if (imgModal && !imgModal.hidden) {
      exportCanvasBill();
    }
  }

  /* ---- Host QR Code Modal (SePay Dynamic QR + Single Slot) ---- */
  var pendingHostQrData = '';
  var draftHostQrSlots = [];
  var draftHostQrIdx = 0;

  function getSelectedBankCodeFromModal() {
    var sel = $('qrBankSelect');
    var customInput = $('qrBankCodeInput');
    if (sel) {
      if (sel.value === 'CUSTOM') {
        return (customInput ? customInput.value.trim() : '').toUpperCase();
      }
      return (sel.value || '').trim().toUpperCase();
    }
    return (customInput ? customInput.value.trim() : '').toUpperCase();
  }

  function setSelectedBankCodeInModal(bankCode) {
    var code = String(bankCode || '').trim().toUpperCase();
    var sel = $('qrBankSelect');
    var customInput = $('qrBankCodeInput');
    if (!sel) {
      if (customInput) customInput.value = code;
      return;
    }
    if (!code) {
      sel.value = 'MB';
      if (customInput) { customInput.value = ''; customInput.hidden = true; }
      return;
    }
    var foundOpt = false;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === code && code !== 'CUSTOM') {
        foundOpt = true;
        break;
      }
    }
    if (foundOpt) {
      sel.value = code;
      if (customInput) { customInput.value = code; customInput.hidden = true; }
    } else {
      sel.value = 'CUSTOM';
      if (customInput) { customInput.value = code; customInput.hidden = false; }
    }
  }

  function syncInputsToDraftSlot() {
    if (!draftHostQrSlots.length) {
      draftHostQrSlots = [{ id: 'qr_0', label: '', qr: '', note: '', bank: '', account: '', owner: '' }];
    }
    var slot = draftHostQrSlots[0];
    if (!slot) return;
    var bank = getSelectedBankCodeFromModal();
    var acc = ($('qrAccountNoInput') ? $('qrAccountNoInput').value.trim() : '').replace(/\s+/g, '');
    var owner = toAsciiTransferName($('qrAccountNameInput') ? $('qrAccountNameInput').value.trim() : '');
    if (bank && acc) {
      slot.bank = bank;
      slot.account = acc;
      slot.owner = owner;
      slot.label = bank;
      slot.note = formatHostBankSummary({ bank: bank, account: acc, owner: owner });
      if (!pendingHostQrData || pendingHostQrData.indexOf('https://qr.sepay.vn/img?') === 0) {
        pendingHostQrData = buildSePayQrUrl(bank, acc, 0, orderCode);
      }
      slot.qr = pendingHostQrData;
      if ($('hostQrLabelInput')) $('hostQrLabelInput').value = slot.label;
      if ($('hostQrNoteInput')) $('hostQrNoteInput').value = slot.note;
    } else {
      slot.qr = pendingHostQrData || '';
      if ($('hostQrLabelInput')) slot.label = $('hostQrLabelInput').value.trim();
      if ($('hostQrNoteInput')) slot.note = $('hostQrNoteInput').value.trim();
    }
  }

  function renderHostQrSlotsBar() {
    var bar = $('hostQrSlotsBar');
    if (bar) {
      bar.hidden = true;
      bar.innerHTML = '';
    }
  }

  function updateHostQrPreview(src) {
    var img = $('hostQrPreviewImg');
    var hint = $('hostQrEmptyHint');
    var zoomBtn = $('btnZoomHostPreviewQr');
    pendingHostQrData = src || '';
    if (draftHostQrSlots[0]) {
      draftHostQrSlots[0].qr = pendingHostQrData;
    }
    if (img && hint) {
      if (pendingHostQrData) {
        img.src = pendingHostQrData;
        img.hidden = false;
        hint.hidden = true;
        if (zoomBtn) zoomBtn.hidden = false;
      } else {
        img.src = '';
        img.hidden = true;
        hint.hidden = false;
        if (zoomBtn) zoomBtn.hidden = true;
      }
    }
    if ($('btnRemoveHostQr')) {
      $('btnRemoveHostQr').hidden = !pendingHostQrData;
    }
  }

  function loadDraftSlotToEditor(idx) {
    if (!draftHostQrSlots.length) {
      draftHostQrSlots = [{ id: 'qr_0', label: '', qr: '', note: '', bank: '', account: '', owner: '' }];
    }
    draftHostQrIdx = 0;
    var slot = draftHostQrSlots[0];
    setSelectedBankCodeInModal(slot.bank || 'MB');
    if ($('qrAccountNoInput')) $('qrAccountNoInput').value = slot.account || '';
    if ($('qrAccountNameInput')) $('qrAccountNameInput').value = slot.owner || '';
    if (!slot.qr && slot.bank && slot.account) {
      slot.qr = buildSePayQrUrl(slot.bank, slot.account, 0, orderCode);
    }
    pendingHostQrData = slot.qr || '';
    if ($('hostQrLabelInput')) $('hostQrLabelInput').value = slot.label || slot.bank || '';
    if ($('hostQrNoteInput')) $('hostQrNoteInput').value = slot.note || formatHostBankSummary(slot) || '';
    updateHostQrPreview(pendingHostQrData);
  }

  function openHostQrModal() {
    if (hasHostAssigned() && !isCurrentHost()) {
      showToast('🔒 Chỉ Đại diện hiện tại (' + (getHostName() || 'Host') + ') mới được thêm/sửa mã QR!');
      return;
    }
    var modal = $('hostQrModal');
    if (!modal) return;
    var existing = getHostQrSlots();
    if (!existing.length) {
      var saved = loadMySavedHostQr();
      if (saved && Array.isArray(saved.slots) && saved.slots.length) {
        existing = normalizeQrSlotList(saved.slots, '', '');
      } else if (saved && saved.qr) {
        existing = [{
          id: 'qr_0',
          label: saved.label || '',
          qr: saved.qr,
          note: saved.note || '',
          bank: saved.bank || '',
          account: saved.account || '',
          owner: saved.owner || ''
        }];
      }
    }
    var hb = getHostBankInfo();
    var first = existing[0] || null;
    draftHostQrSlots = [{
      id: 'qr_0',
      label: String((first && first.label) || hb.bank || ''),
      qr: String((first && first.qr) || ''),
      note: String((first && first.note) || formatHostBankSummary(hb) || ''),
      bank: String((first && first.bank) || hb.bank || 'MB'),
      account: String((first && first.account) || hb.account || ''),
      owner: String((first && first.owner) || hb.owner || '')
    }];
    loadDraftSlotToEditor(0);
    modal.hidden = false;
  }

  function closeHostQrModal() {
    var modal = $('hostQrModal');
    if (modal) modal.hidden = true;
  }

  function resizeImageFileToDataUrl(file, maxDim, cb) {
    var reader = new FileReader();
    reader.onload = function (ev) {
      var rawDataUrl = ev.target && ev.target.result ? String(ev.target.result) : '';
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || img.width || maxDim;
        var h = img.naturalHeight || img.height || maxDim;
        var isLosslessSource = (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/svg+xml');
        if (isLosslessSource && rawDataUrl && rawDataUrl.length <= 130000 && Math.max(w, h) <= 1600) {
          cb(null, rawDataUrl);
          return;
        }

        var targetMax = Math.max(720, maxDim || 1080);
        var ratio = Math.min(1, targetMax / Math.max(w, h));
        var tw = Math.max(160, Math.round(w * ratio));
        var th = Math.max(160, Math.round(h * ratio));
        var c = document.createElement('canvas');
        c.width = tw;
        c.height = th;
        var cx = c.getContext('2d');
        cx.fillStyle = '#FFFFFF';
        cx.fillRect(0, 0, tw, th);
        cx.imageSmoothingEnabled = (ratio < 1);
        if (cx.imageSmoothingEnabled) cx.imageSmoothingQuality = 'high';
        cx.drawImage(img, 0, 0, tw, th);

        var out = c.toDataURL('image/png');
        if (out.length > 90000) {
          var webp95 = c.toDataURL('image/webp', 0.95);
          if (webp95 && webp95.indexOf('data:image/webp') === 0) {
            out = webp95;
            if (out.length > 105000) out = c.toDataURL('image/webp', 0.90);
          } else {
            out = c.toDataURL('image/jpeg', 0.92);
          }
        }
        cb(null, out);
      };
      img.onerror = function () { cb(new Error('Invalid image')); };
      img.src = rawDataUrl;
    };
    reader.onerror = function () { cb(new Error('Read failed')); };
    reader.readAsDataURL(file);
  }

  function generateVietQrToDataUrl() {
    var bank = getSelectedBankCodeFromModal();
    var acc = ($('qrAccountNoInput') ? $('qrAccountNoInput').value.trim() : '').replace(/\s+/g, '');
    var accName = toAsciiTransferName($('qrAccountNameInput') ? $('qrAccountNameInput').value.trim() : '');
    if (!bank || !acc) {
      showToast('Vui lòng chọn Ngân hàng và nhập Số tài khoản nhận tiền!');
      if ($('qrAccountNoInput')) $('qrAccountNoInput').focus();
      return;
    }
    var sepayUrl = buildSePayQrUrl(bank, acc, 0, orderCode);
    if (!draftHostQrSlots.length) {
      draftHostQrSlots = [{ id: 'qr_0', label: '', qr: '', note: '', bank: '', account: '', owner: '' }];
    }
    draftHostQrSlots[0].bank = bank;
    draftHostQrSlots[0].account = acc;
    draftHostQrSlots[0].owner = accName;
    draftHostQrSlots[0].label = bank;
    draftHostQrSlots[0].note = formatHostBankSummary({ bank: bank, account: acc, owner: accName });
    updateHostQrPreview(sepayUrl);
    if ($('hostQrLabelInput')) $('hostQrLabelInput').value = bank;
    if ($('hostQrNoteInput')) $('hostQrNoteInput').value = draftHostQrSlots[0].note;
    showToast('✓ Đã tạo mã QR SePay cho tài khoản ' + bank + ' - ' + acc + '!');
  }

  function persistMyQrLocalStorage(cleanSlots) {
    try {
      if (cleanSlots && cleanSlots.length) {
        var first = cleanSlots[0];
        localStorage.setItem(getMyQrStorageKey(), JSON.stringify({
          qr: first.qr,
          note: first.note || '',
          label: first.label || '',
          bank: first.bank || '',
          account: first.account || '',
          owner: first.owner || '',
          slots: [first]
        }));
      } else {
        localStorage.removeItem(getMyQrStorageKey());
      }
    } catch (e) {}
  }

  function commitDraftHostQrSlots(shouldClose) {
    syncInputsToDraftSlot();
    var clean = normalizeQrSlotList(draftHostQrSlots, '', '');
    applyHostQrSlots(clean, false);
    persistMyQrLocalStorage(clean);
    if (shouldClose) closeHostQrModal();
    updateHostDropdownUI();
    schedulePush();
    if (isOrderSubmitted()) syncBillServerStateToSheet(true);
    if (typeof renderPayReminderPanel === 'function') renderPayReminderPanel(false);
    var imgModal = $('imageExportModal');
    if (imgModal && !imgModal.hidden) exportCanvasBill();
    return clean;
  }

  function saveHostQr() {
    if (hasHostAssigned() && !isCurrentHost()) {
      showToast('🔒 Chỉ Đại diện hiện tại mới được lưu QR!');
      return;
    }
    syncInputsToDraftSlot();
    var slot = draftHostQrSlots[0];
    if (!slot || !slot.qr) {
      showToast('Vui lòng nhập Số tài khoản ngân hàng (hoặc chọn ảnh QR) trước khi lưu!');
      if ($('qrAccountNoInput')) $('qrAccountNoInput').focus();
      return;
    }
    var clean = commitDraftHostQrSlots(true);
    showToast(clean.length
      ? ('✓ Đã lưu tài khoản & mã QR SePay của Đại diện vào bill!')
      : 'Đã gỡ mã QR khỏi bill.');
  }

  function removeHostQr() {
    draftHostQrSlots = [{ id: 'qr_0', label: '', qr: '', note: '', bank: '', account: '', owner: '' }];
    draftHostQrIdx = 0;
    if ($('qrAccountNoInput')) $('qrAccountNoInput').value = '';
    if ($('qrAccountNameInput')) $('qrAccountNameInput').value = '';
    updateHostQrPreview('');
    if ($('hostQrLabelInput')) $('hostQrLabelInput').value = '';
    if ($('hostQrNoteInput')) $('hostQrNoteInput').value = '';
    commitDraftHostQrSlots(true);
    showToast('Đã xóa tài khoản & mã QR thanh toán.');
  }

  function loadQrImageForCanvas(src, cb) {
    if (!src) { cb(null); return; }
    var img = new Image();
    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = function () { cb(img); };
    img.onerror = function () {
      if (img.crossOrigin) {
        var fallbackImg = new Image();
        fallbackImg.onload = function () { cb(fallbackImg); };
        fallbackImg.onerror = function () { cb(null); };
        fallbackImg.src = src;
        return;
      }
      cb(null);
    };
    img.src = src;
  }

  function drawPillBadge(ctx, x, y, text, bgColor, textColor, borderColor, fontSpec) {
    ctx.save();
    ctx.font = fontSpec || ('800 10.5px ' + window.getComputedStyle(document.body).fontFamily);
    var tw = ctx.measureText(text).width;
    var pw = tw + 16;
    var ph = 20;
    ctx.fillStyle = bgColor;
    drawRoundedRect(ctx, x, y, pw, ph, 10, true, false);
    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, x, y, pw, ph, 10, false, true);
    }
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + pw / 2, y + ph / 2 + 0.5);
    ctx.restore();
    return pw;
  }

  function exportCanvasBill() {
    if (!cart.length) {
      showToast('Hóa đơn trống, hãy chọn món trước!');
      return;
    }

    var hb = getHostBankInfo();
    if (hb.bank && hb.account) {
      var splitNow = computeBillSplit();
      var unpaidList = splitNow.people.filter(function (p) { return !p.paid && p.finalPay > 0; });
      if (!unpaidList.length) {
        renderCanvasBillWithQr({ mode: 'sepay-grid', bankInfo: hb, items: [] });
        return;
      }
      var loadedGrid = new Array(unpaidList.length);
      var remGrid = unpaidList.length;
      unpaidList.forEach(function (p, idx) {
        var mQr = getQrForMember(p);
        loadQrImageForCanvas(mQr.qr, function (img) {
          if (img) {
            loadedGrid[idx] = {
              name: p.name,
              ucolor: p.ucolor || '#0A7259',
              amount: p.finalPay,
              isHost: !!p.isHost,
              img: img
            };
          }
          remGrid--;
          if (remGrid <= 0) {
            renderCanvasBillWithQr({
              mode: 'sepay-grid',
              bankInfo: hb,
              items: loadedGrid.filter(Boolean)
            });
          }
        });
      });
      return;
    }

    var qrSlots = getHostQrSlots();
    if (!qrSlots.length) {
      renderCanvasBillWithQr([]);
      return;
    }
    var loaded = new Array(qrSlots.length);
    var remaining = qrSlots.length;
    qrSlots.forEach(function (slot, idx) {
      loadQrImageForCanvas(slot.qr, function (img) {
        if (img) {
          loaded[idx] = {
            label: formatQrSlotDisplayName(slot, idx),
            hasCustomLabel: !!(slot.label && slot.label.trim()),
            note: slot.note || '',
            img: img
          };
        }
        remaining--;
        if (remaining <= 0) {
          renderCanvasBillWithQr(loaded.filter(Boolean));
        }
      });
    });
  }

  function drawCanvasVectorIcon(ctx, type, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.4, size * 0.11);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    var s = size;
    if (type === 'cup') {
      // Modern drink cup silhouette
      ctx.beginPath();
      ctx.moveTo(x + s * 0.22, y + s * 0.28);
      ctx.lineTo(x + s * 0.78, y + s * 0.28);
      ctx.lineTo(x + s * 0.70, y + s * 0.88);
      ctx.lineTo(x + s * 0.30, y + s * 0.88);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.15, y + s * 0.28);
      ctx.lineTo(x + s * 0.85, y + s * 0.28);
      ctx.moveTo(x + s * 0.54, y + s * 0.28);
      ctx.lineTo(x + s * 0.62, y + s * 0.08);
      ctx.stroke();
    } else if (type === 'crown') {
      ctx.beginPath();
      ctx.moveTo(x + s * 0.12, y + s * 0.76);
      ctx.lineTo(x + s * 0.16, y + s * 0.30);
      ctx.lineTo(x + s * 0.38, y + s * 0.54);
      ctx.lineTo(x + s * 0.50, y + s * 0.22);
      ctx.lineTo(x + s * 0.62, y + s * 0.54);
      ctx.lineTo(x + s * 0.84, y + s * 0.30);
      ctx.lineTo(x + s * 0.88, y + s * 0.76);
      ctx.closePath();
      ctx.stroke();
    } else if (type === 'check') {
      ctx.beginPath();
      ctx.arc(x + s * 0.5, y + s * 0.5, s * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.30, y + s * 0.52);
      ctx.lineTo(x + s * 0.45, y + s * 0.66);
      ctx.lineTo(x + s * 0.72, y + s * 0.36);
      ctx.stroke();
    } else if (type === 'clock') {
      ctx.beginPath();
      ctx.arc(x + s * 0.5, y + s * 0.5, s * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.5, y + s * 0.28);
      ctx.lineTo(x + s * 0.5, y + s * 0.52);
      ctx.lineTo(x + s * 0.66, y + s * 0.62);
      ctx.stroke();
    } else if (type === 'wallet') {
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x + s * 0.10, y + s * 0.22, s * 0.80, s * 0.58, s * 0.12) : ctx.rect(x + s * 0.10, y + s * 0.22, s * 0.80, s * 0.58);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + s * 0.70, y + s * 0.51, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'qr') {
      ctx.strokeRect(x + s * 0.12, y + s * 0.12, s * 0.30, s * 0.30);
      ctx.strokeRect(x + s * 0.58, y + s * 0.12, s * 0.30, s * 0.30);
      ctx.strokeRect(x + s * 0.12, y + s * 0.58, s * 0.30, s * 0.30);
      ctx.fillRect(x + s * 0.58, y + s * 0.58, s * 0.14, s * 0.14);
      ctx.fillRect(x + s * 0.76, y + s * 0.76, s * 0.12, s * 0.12);
    } else if (type === 'note') {
      ctx.beginPath();
      ctx.moveTo(x + s * 0.20, y + s * 0.30);
      ctx.lineTo(x + s * 0.80, y + s * 0.30);
      ctx.moveTo(x + s * 0.20, y + s * 0.52);
      ctx.lineTo(x + s * 0.80, y + s * 0.52);
      ctx.moveTo(x + s * 0.20, y + s * 0.74);
      ctx.lineTo(x + s * 0.58, y + s * 0.74);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderCanvasBillWithQr(qrInput) {
    var canvas = $('billCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var split = computeBillSplit();
    var t = split.t;
    var people = split.people;
    var hostName = split.hostName;
    var noteVal = ($('orderNote') ? $('orderNote').value.trim() : '');
    var qrNote = (F.hostQrNote && F.hostQrNote.v) ? String(F.hostQrNote.v).trim() : '';
    var fontFam = window.getComputedStyle(document.body).fontFamily;
    var cUnit = (currentStore && currentStore.itemUnit) || 'món';
    var includeSplit = ($('chkIncludeSplitInCanvas') ? $('chkIncludeSplitInCanvas').checked : true);
    var isSepayGrid = !!(qrInput && !Array.isArray(qrInput) && qrInput.mode === 'sepay-grid');
    var sepayGridItems = isSepayGrid
      ? (qrInput.items || []).filter(function (x) { return x && x.img; })
      : [];
    var sepayBankInfo = isSepayGrid ? (qrInput.bankInfo || getHostBankInfo()) : null;
    var qrItems = isSepayGrid
      ? []
      : (Array.isArray(qrInput)
        ? qrInput.filter(function (x) { return x && x.img; })
        : (qrInput ? [{ label: 'QR #1', hasCustomLabel: false, note: qrNote, img: qrInput }] : []));
    // Chỉ hiển thị QR khi checkbox "Kèm bảng chia tiền vào ảnh" được check VÀ có QR cần quét
    var hasQrBlock = !!(includeSplit && (isSepayGrid ? sepayGridItems.length > 0 : qrItems.length > 0));
    var submitted = isOrderSubmitted();

    // Layout Dimensions (Modern 700px wide card)
    var W = 700;
    var pad = 26;

    var headerH = 114;
    var itemH = 32;
    var itemsBlockH = 34 + cart.length * itemH + 12;

    var totalsBoxH = 26 + (t.disc > 0 ? 28 : 0) + (t.ship > 0 ? 24 : 0) + 48 + (noteVal ? 22 : 0);
    var summaryBlockH = totalsBoxH + 18;

    var splitCardH = 48;
    var splitGap = 8;
    var splitBlockH = (includeSplit && people.length)
      ? (28 + people.length * splitCardH + (people.length - 1) * splitGap + 18)
      : 0;

    function fitQrFrameDims(img, maxW, maxH, innerPad, minBoxW, minBoxH) {
      var iw = (img && (img.naturalWidth || img.width)) || maxW;
      var ih = (img && (img.naturalHeight || img.height)) || maxH;
      var availW = Math.max(80, maxW - innerPad * 2);
      var availH = Math.max(80, maxH - innerPad * 2);
      var ratio = Math.min(availW / iw, availH / ih);
      var dw = Math.max(60, Math.round(iw * ratio));
      var dh = Math.max(60, Math.round(ih * ratio));
      var fw = Math.max(minBoxW || 0, dw + innerPad * 2);
      var fh = Math.max(minBoxH || 0, dh + innerPad * 2);
      return {
        iw: iw, ih: ih, dw: dw, dh: dh, fw: fw, fh: fh, innerPad: innerPad
      };
    }

    var qrOuterPad = 14;
    var qrInnerW = W - pad * 2 - qrOuterPad * 2;
    var qrSingleLayout = null;
    var qrVerticalCards = [];
    var qrHeadH = 66;
    var qrCardGap = 14;
    var qrBoxH = 0;

    // Layout cho Grid Card QR cá nhân hóa SePay (mỗi thành viên chưa trả 1 thẻ QR lớn đủ to để quét)
    var sepayGridCols = 2;
    var sepayGridGap = 14;
    var sepayGridHeadH = 60;
    var sepayGridCardW = 301;
    var sepayGridCardHeadH = 48;
    var sepayGridQrSize = 258;
    var sepayGridCardH = 324;

    if (hasQrBlock) {
      if (isSepayGrid) {
        sepayGridCols = sepayGridItems.length === 1 ? 1 : 2;
        sepayGridCardW = sepayGridCols === 1 ? 320 : Math.floor((qrInnerW - sepayGridGap) / 2);
        sepayGridQrSize = sepayGridCols === 1 ? 272 : 258;
        sepayGridCardH = sepayGridCardHeadH + sepayGridQrSize + 18;
        var gridRows = Math.ceil(sepayGridItems.length / sepayGridCols);
        qrBoxH = sepayGridHeadH + gridRows * sepayGridCardH + Math.max(0, gridRows - 1) * sepayGridGap + 16;
      } else if (qrItems.length === 1) {
        var singleImg = qrItems[0].img;
        var sNatW = (singleImg && (singleImg.naturalWidth || singleImg.width)) || 300;
        var sNatH = (singleImg && (singleImg.naturalHeight || singleImg.height)) || 300;
        var isTallSingle = sNatH > sNatW * 1.15;
        qrSingleLayout = fitQrFrameDims(
          singleImg,
          isTallSingle ? 228 : 212,
          isTallSingle ? 300 : 212,
          8,
          196,
          196
        );
        qrBoxH = Math.max(224, qrSingleLayout.fh + 28);
      } else {
        var cardsTotalH = 0;
        qrItems.forEach(function (item, idx) {
          var noteTxt = (item.note && String(item.note).trim()) ? String(item.note).trim() : '';
          var cardHeadH = noteTxt ? 68 : 46;
          var dims = fitQrFrameDims(item.img, 468, 560, 10, 320, 320);
          var cardH = cardHeadH + dims.fh + 18;
          qrVerticalCards.push({
            item: item,
            idx: idx,
            noteTxt: noteTxt,
            cardHeadH: cardHeadH,
            dims: dims,
            cardH: cardH
          });
          cardsTotalH += cardH + (idx > 0 ? qrCardGap : 0);
        });
        qrBoxH = qrHeadH + cardsTotalH + 16;
      }
    }

    var qrBlockH = hasQrBlock ? (qrBoxH + 16) : 0;
    var footerH = 48;

    var totalH = headerH + itemsBlockH + summaryBlockH + splitBlockH + qrBlockH + footerH;
    // Giữ tỉ lệ 2x sắc nét, chỉ giảm nhẹ nếu bill quá dài vượt giới hạn pixel canvas trên iOS Safari
    var scale = Math.min(2, Math.sqrt(15500000 / Math.max(1, W * totalH)));
    if (scale < 1) scale = 1;

    canvas.width = W * scale;
    canvas.height = totalH * scale;
    canvas.style.width = '100%';
    canvas.style.maxWidth = W + 'px';
    canvas.style.height = 'auto';

    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // Overall Card Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, totalH);

    // Modern Forest Green Header Banner
    ctx.fillStyle = '#132B22';
    ctx.fillRect(0, 0, W, headerH);

    // Accent bottom strip on header
    ctx.fillStyle = '#10B981';
    ctx.fillRect(0, headerH - 4, W, 4);

    // Header Row 1: Vector store icon + Store Name + Order Code Pill
    drawCanvasVectorIcon(ctx, 'cup', pad, 17, 22, '#6EE7B7');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 19px ' + fontFam;
    var titleText = currentStore.name.toUpperCase();
    ctx.fillText(fitText(ctx, titleText, W - pad * 2 - 195), pad + 28, 35);

    var codeStr = '#' + orderCode;
    ctx.font = '800 12px ' + fontFam;
    var codeW = ctx.measureText(codeStr).width + 20;
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    drawRoundedRect(ctx, W - pad - codeW, 17, codeW, 24, 12, true, false);
    ctx.fillStyle = '#A7F3D0';
    ctx.textAlign = 'center';
    ctx.fillText(codeStr, W - pad - codeW / 2, 33);

    // Header Row 2: Timestamp & Cups summary
    var nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('vi-VN');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 12px ' + fontFam;
    ctx.fillText('ĐƠN ĐẶT CHUNG · ' + nowStr + ' · Tổng: ' + t.totalCups + ' ' + cUnit, pad, 59);

    // Header Row 3: Host Info + Vector Icon + Submitted Status
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    drawRoundedRect(ctx, pad, 70, W - pad * 2, 30, 8, true, false);
    drawCanvasVectorIcon(ctx, 'crown', pad + 10, 77, 15, '#FCD34D');
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 12.5px ' + fontFam;
    ctx.textAlign = 'left';
    ctx.fillText('Đại diện nhận đơn: ' + hostName, pad + 30, 89);

    var stLabel = submitted ? 'ĐÃ CHỐT ĐƠN' : 'ĐANG TỔNG HỢP';
    var stColor = submitted ? '#6EE7B7' : '#FDE68A';
    ctx.font = '700 11.5px ' + fontFam;
    var stW = ctx.measureText(stLabel).width;
    drawCanvasVectorIcon(ctx, submitted ? 'check' : 'clock', W - pad - 14 - stW - 18, 78, 14, stColor);
    ctx.textAlign = 'right';
    ctx.fillStyle = stColor;
    ctx.fillText(stLabel, W - pad - 10, 89);

    // ITEMS TABLE HEADER
    var curY = headerH + 22;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = '800 10.5px ' + fontFam;
    ctx.fillText('CHI TIẾT MÓN & NGƯỜI ĐẶT', pad, curY);
    ctx.textAlign = 'center';
    ctx.fillText('SL', W - pad - 98, curY);
    ctx.textAlign = 'right';
    ctx.fillText('THÀNH TIỀN', W - pad, curY);

    curY += 10;
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, curY);
    ctx.lineTo(W - pad, curY);
    ctx.stroke();

    curY += 2; // Now at headerH + 34

    // ITEMS ROWS
    cart.forEach(function (c, idx) {
      var rowTop = curY + 2;
      if (idx % 2 === 1) {
        ctx.fillStyle = '#FAF9F6';
        drawRoundedRect(ctx, pad - 6, rowTop, W - pad * 2 + 12, itemH - 2, 6, true, false);
      }

      var baselineY = rowTop + 20;
      var authorName = (c.uname || c.owner || 'Khách').trim();
      var isMeRow = isMyUid(c.uid) || (!c.uid && myUname && authorName.toLowerCase() === myUname.trim().toLowerCase());
      var ucol = isMeRow ? myUcolor : (c.ucolor || '#0A7259');

      // Left color stripe
      ctx.fillStyle = ucol;
      drawRoundedRect(ctx, pad - 4, rowTop + 5, 3.5, itemH - 12, 2, true, false);

      // Author pill
      ctx.font = '800 10.5px ' + fontFam;
      var badgeW = Math.min(110, Math.max(46, ctx.measureText(authorName).width + 16));
      ctx.fillStyle = ucol + '1E';
      drawRoundedRect(ctx, pad + 5, rowTop + 5, badgeW, 20, 6, true, false);
      ctx.strokeStyle = ucol;
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, pad + 5, rowTop + 5, badgeW, 20, 6, false, true);
      ctx.fillStyle = ucol;
      ctx.textAlign = 'center';
      ctx.fillText(fitText(ctx, authorName, badgeW - 8), pad + 5 + badgeW / 2, baselineY - 1);

      // Item Name + Options
      var itemStartX = pad + badgeW + 14;
      var priceZoneStart = W - pad - 124;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F172A';
      ctx.font = '700 12.5px ' + fontFam;
      var szStr = formatSizeLabel(c.size);
      var itemName = c.name + (szStr ? ' (' + szStr + ')' : '');
      var sOpt = shortOptText(c);
      var maxTitleW = sOpt ? Math.min(ctx.measureText(itemName).width + 2, (priceZoneStart - itemStartX) * 0.62) : (priceZoneStart - itemStartX - 6);
      var fitItemName = fitText(ctx, itemName, maxTitleW);
      ctx.fillText(fitItemName, itemStartX, baselineY);

      if (sOpt) {
        var usedW = ctx.measureText(fitItemName).width;
        ctx.fillStyle = '#64748B';
        ctx.font = '500 11px ' + fontFam;
        var optW = priceZoneStart - (itemStartX + usedW + 8);
        if (optW > 24) {
          ctx.fillText(fitText(ctx, '· ' + sOpt, optW), itemStartX + usedW + 6, baselineY);
        }
      }

      // SL
      ctx.textAlign = 'center';
      ctx.fillStyle = '#334155';
      ctx.font = '700 12px ' + fontFam;
      ctx.fillText(c.qty + 'x', W - pad - 98, baselineY);

      // Line Total
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0A7259';
      ctx.font = '800 12.5px ' + fontFam;
      ctx.fillText(fmt(lineTotal(c)), W - pad, baselineY);

      curY += itemH;
    });

    // SUMMARY BOX
    curY += 12;
    var sumBoxTop = curY;
    ctx.fillStyle = '#F8FAFC';
    drawRoundedRect(ctx, pad, sumBoxTop, W - pad * 2, totalsBoxH, 12, true, false);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, pad, sumBoxTop, W - pad * 2, totalsBoxH, 12, false, true);

    var sumY = sumBoxTop + 22;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = '600 12px ' + fontFam;
    ctx.fillText('Tạm tính (' + t.totalCups + ' ' + cUnit + ')', pad + 16, sumY);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 12.5px ' + fontFam;
    ctx.fillText(fmt(t.sub), W - pad - 16, sumY);

    if (t.disc > 0) {
      sumY += 26;
      // Highlighted coral band for discount amount
      ctx.fillStyle = '#FEF2F2';
      drawRoundedRect(ctx, pad + 12, sumY - 16, W - pad * 2 - 24, 23, 6, true, false);
      ctx.strokeStyle = '#FECACA';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, pad + 12, sumY - 16, W - pad * 2 - 24, 23, 6, false, true);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#B91C1C';
      ctx.font = '700 12px ' + fontFam;
      ctx.fillText('Giảm giá / Khuyến mãi', pad + 20, sumY);

      var discText = '−' + fmt(t.disc);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#DC2626';
      ctx.font = '800 13px ' + fontFam;
      ctx.fillText(discText, W - pad - 20, sumY);
    }

    if (t.ship > 0) {
      sumY += 24;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#D97706';
      ctx.font = '700 12px ' + fontFam;
      ctx.fillText('Phí giao hàng (Ship)', pad + 16, sumY);
      ctx.textAlign = 'right';
      ctx.fillText('+' + fmt(t.ship), W - pad - 16, sumY);
    }

    sumY += 15;
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad + 16, sumY);
    ctx.lineTo(W - pad - 16, sumY);
    ctx.stroke();

    sumY += 25;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#132B22';
    ctx.font = '800 15px ' + fontFam;
    ctx.fillText('TỔNG THANH TOÁN', pad + 16, sumY);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0A7259';
    ctx.font = '800 18px ' + fontFam;
    ctx.fillText(fmt(t.grand), W - pad - 16, sumY);

    if (noteVal) {
      sumY += 20;
      drawCanvasVectorIcon(ctx, 'note', pad + 16, sumY - 11, 13, '#64748B');
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = 'italic 500 11.5px ' + fontFam;
      ctx.fillText(fitText(ctx, 'Ghi chú: ' + noteVal, W - pad * 2 - 48), pad + 33, sumY);
    }

    curY = sumBoxTop + totalsBoxH + 18;

    // MODERN SPLIT BILL SECTION
    if (includeSplit && people.length) {
      var paidCount = people.filter(function (p) { return p.paid; }).length;
      drawCanvasVectorIcon(ctx, 'wallet', pad, curY + 2, 16, '#0A7259');
      ctx.textAlign = 'left';
      ctx.fillStyle = '#132B22';
      ctx.font = '800 13.5px ' + fontFam;
      ctx.fillText('BẢNG CHIA TIỀN TỪNG THÀNH VIÊN', pad + 22, curY + 14);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#64748B';
      ctx.font = '700 11.5px ' + fontFam;
      ctx.fillText('Đã trả: ' + paidCount + '/' + people.length + ' bạn', W - pad, curY + 14);

      curY += 28;

      people.forEach(function (p, idx) {
        var cy = curY;
        ctx.fillStyle = p.paid ? '#F0FDF4' : '#FFFFFF';
        drawRoundedRect(ctx, pad, cy, W - pad * 2, splitCardH, 10, true, false);
        ctx.strokeStyle = p.paid ? '#86EFAC' : '#E2E8F0';
        ctx.lineWidth = 1.2;
        drawRoundedRect(ctx, pad, cy, W - pad * 2, splitCardH, 10, false, true);

        // Left user color accent
        ctx.fillStyle = p.ucolor;
        drawRoundedRect(ctx, pad, cy + 6, 4, splitCardH - 12, 2, true, false);

        // Avatar circle
        var avX = pad + 26;
        var avY = cy + splitCardH / 2;
        ctx.fillStyle = p.ucolor;
        ctx.beginPath();
        ctx.arc(avX, avY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 12px ' + fontFam;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(userInitial(p.name), avX, avY + 0.5);
        ctx.textBaseline = 'alphabetic';

        // Name + Vector Crown if Host
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0F172A';
        ctx.font = '800 13px ' + fontFam;
        var fitPName = fitText(ctx, p.name, 190);
        ctx.fillText(fitPName, pad + 48, cy + 20);
        if (p.isHost) {
          var pNameW = ctx.measureText(fitPName).width;
          drawCanvasVectorIcon(ctx, 'crown', pad + 48 + pNameW + 5, cy + 8, 13, '#D97706');
        }

        // Breakdown + Highlighted discount/ship pill
        var baseLine = p.cups + ' ' + cUnit + ' (' + fmt(p.drinkSub) + ')';
        ctx.fillStyle = '#64748B';
        ctx.font = '600 11px ' + fontFam;
        ctx.fillText(baseLine, pad + 48, cy + 37);

        if (p.share < 0 || p.share > 0) {
          var baseW = ctx.measureText(baseLine).width;
          var adjLabel = p.share < 0 ? ('−' + fmtK(Math.abs(p.share)) + ' giảm') : ('+ship ' + fmtK(p.share));
          var pillBg = p.share < 0 ? '#FEE2E2' : '#FEF3C7';
          var pillFg = p.share < 0 ? '#B91C1C' : '#B45309';
          var pillBd = p.share < 0 ? '#FECACA' : '#FDE68A';
          ctx.font = '800 10px ' + fontFam;
          var adjW = ctx.measureText(adjLabel).width + 12;
          var px = pad + 48 + baseW + 6;
          ctx.fillStyle = pillBg;
          drawRoundedRect(ctx, px, cy + 26, adjW, 15, 7.5, true, false);
          ctx.strokeStyle = pillBd;
          ctx.lineWidth = 0.8;
          drawRoundedRect(ctx, px, cy + 26, adjW, 15, 7.5, false, true);
          ctx.fillStyle = pillFg;
          ctx.textAlign = 'center';
          ctx.fillText(adjLabel, px + adjW / 2, cy + 37);
        }

        // Paid / Unpaid Status Pill
        var badgeX = W - pad - 208;
        if (p.paid) {
          drawPillBadge(ctx, badgeX, cy + 14, '✓ ĐÃ TRẢ', '#DCFCE7', '#15803D', '#86EFAC', '800 10px ' + fontFam);
        } else {
          drawPillBadge(ctx, badgeX, cy + 14, 'CHƯA TRẢ', '#FEF3C7', '#B45309', '#FDE68A', '800 10px ' + fontFam);
        }

        // Amount Owed (Right aligned)
        ctx.textAlign = 'right';
        ctx.fillStyle = p.paid ? '#15803D' : '#0A7259';
        ctx.font = '800 15px ' + fontFam;
        ctx.fillText(fmt(p.finalPay), W - pad - 14, cy + 30);

        curY += splitCardH + (idx < people.length - 1 ? splitGap : 0);
      });

      curY += 18;
    }

    // CONDITIONAL HOST QR BLOCK (Hỗ trợ 1 hoặc nhiều QR của Đại diện)
    if (hasQrBlock) {
      ctx.fillStyle = '#ECFDF5';
      drawRoundedRect(ctx, pad, curY, W - pad * 2, qrBoxH, 14, true, false);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, pad, curY, W - pad * 2, qrBoxH, 14, false, true);

      function drawCrispQrBox(img, fx, fy, dims, radius) {
        ctx.fillStyle = '#FFFFFF';
        drawRoundedRect(ctx, fx, fy, dims.fw, dims.fh, radius, true, false);
        ctx.strokeStyle = '#A7F3D0';
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, fx, fy, dims.fw, dims.fh, radius, false, true);
        var dx = fx + (dims.fw - dims.dw) / 2;
        var dy = fy + (dims.fh - dims.dh) / 2;
        var isUpscalingQr = (dims.dw > dims.iw * 1.15 || dims.dh > dims.ih * 1.15);
        ctx.save();
        ctx.imageSmoothingEnabled = !isUpscalingQr;
        if (!isUpscalingQr) ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, dx, dy, dims.dw, dims.dh);
        ctx.restore();
      }

      if (isSepayGrid) {
        var gLeft = pad + qrOuterPad;
        ctx.fillStyle = '#0A7259';
        drawRoundedRect(ctx, gLeft, curY + 14, 198, 22, 11, true, false);
        drawCanvasVectorIcon(ctx, 'qr', gLeft + 9, curY + 18, 14, '#FFFFFF');
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 10.5px ' + fontFam;
        ctx.fillText('QUÉT MÃ QR CỦA RIÊNG BẠN', gLeft + 28, curY + 29);

        var bankTag = (sepayBankInfo && sepayBankInfo.bank) ? (' (' + sepayBankInfo.bank + ')') : '';
        ctx.fillStyle = '#132B22';
        ctx.font = '800 13.5px ' + fontFam;
        ctx.textAlign = 'right';
        ctx.fillText(fitText(ctx, 'Đại diện: ' + hostName + bankTag, qrInnerW - 210), gLeft + qrInnerW, curY + 29);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#047857';
        ctx.font = '700 11.5px ' + fontFam;
        ctx.fillText(
          fitText(ctx, 'Mỗi mã đã khóa sẵn số tiền & nội dung CK — quét đúng ô có tên bạn để hệ thống tự xác nhận', qrInnerW),
          gLeft,
          curY + 49
        );

        var totalGridRows = Math.ceil(sepayGridItems.length / sepayGridCols);
        for (var rIdx = 0; rIdx < totalGridRows; rIdx++) {
          var rowStart = rIdx * sepayGridCols;
          var rowItems = sepayGridItems.slice(rowStart, rowStart + sepayGridCols);
          var rowTotalW = rowItems.length * sepayGridCardW + Math.max(0, rowItems.length - 1) * sepayGridGap;
          var rowStartX = gLeft + Math.round((qrInnerW - rowTotalW) / 2);
          var rowY = curY + sepayGridHeadH + rIdx * (sepayGridCardH + sepayGridGap);

          rowItems.forEach(function (gItem, cIdx) {
            var cx = rowStartX + cIdx * (sepayGridCardW + sepayGridGap);
            var cy = rowY;

            // Card container
            ctx.fillStyle = '#FFFFFF';
            drawRoundedRect(ctx, cx, cy, sepayGridCardW, sepayGridCardH, 12, true, false);
            ctx.strokeStyle = '#A7F3D0';
            ctx.lineWidth = 1.4;
            drawRoundedRect(ctx, cx, cy, sepayGridCardW, sepayGridCardH, 12, false, true);

            // Subtle colored top accent bar
            ctx.save();
            ctx.fillStyle = gItem.ucolor || '#0A7259';
            drawRoundedRect(ctx, cx + 1, cy + 1, sepayGridCardW - 2, 4, 2, true, false);
            ctx.restore();

            // Avatar circle
            var avR = 12;
            var avX = cx + 12 + avR;
            var avY = cy + 27;
            ctx.fillStyle = gItem.ucolor || '#0A7259';
            ctx.beginPath();
            ctx.arc(avX, avY, avR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '800 10.5px ' + fontFam;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(userInitial(gItem.name), avX, avY + 0.5);
            ctx.textBaseline = 'alphabetic';

            // Amount right-aligned
            var amtTxt = fmt(gItem.amount);
            ctx.font = '800 14px ' + fontFam;
            var amtW = ctx.measureText(amtTxt).width;
            ctx.textAlign = 'right';
            ctx.fillStyle = '#0A7259';
            ctx.fillText(amtTxt, cx + sepayGridCardW - 12, cy + 31);

            // Member name
            var nameMaxW = Math.max(60, sepayGridCardW - 12 - (avR * 2 + 12) - 8 - amtW - 16);
            ctx.textAlign = 'left';
            ctx.fillStyle = '#0F172A';
            ctx.font = '800 13px ' + fontFam;
            ctx.fillText(fitText(ctx, gItem.name, nameMaxW), cx + 12 + avR * 2 + 8, cy + 31);

            // Divider line
            ctx.strokeStyle = '#F1F5F9';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx + 10, cy + sepayGridCardHeadH - 2);
            ctx.lineTo(cx + sepayGridCardW - 10, cy + sepayGridCardHeadH - 2);
            ctx.stroke();

            // Large Crisp SePay QR
            var qx = cx + Math.round((sepayGridCardW - sepayGridQrSize) / 2);
            var qy = cy + sepayGridCardHeadH + 6;
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(gItem.img, qx, qy, sepayGridQrSize, sepayGridQrSize);
            ctx.restore();
          });
        }
      } else if (qrItems.length === 1) {
        var single = qrItems[0];
        var sDims = qrSingleLayout;
        var frameX = pad + 14;
        var frameY = curY + Math.round((qrBoxH - sDims.fh) / 2);
        drawCrispQrBox(single.img, frameX, frameY, sDims, 12);

        var infoX = frameX + sDims.fw + 22;
        var infoMaxW = (W - pad - 18) - infoX;

        var bankDetail = (single.note && single.note.trim()) ? single.note.trim() : qrNote;
        if (!bankDetail && currentStore && currentStore.bankInfo && currentStore.bankInfo.account) {
          bankDetail = currentStore.bankInfo.bank + ' · ' + currentStore.bankInfo.account +
            (currentStore.bankInfo.owner ? (' (' + currentStore.bankInfo.owner + ')') : '');
        }
        var infoBlockH = bankDetail ? 140 : 114;
        var infoTopY = curY + Math.max(20, Math.round((qrBoxH - infoBlockH) / 2));

        ctx.fillStyle = '#0A7259';
        drawRoundedRect(ctx, infoX, infoTopY, 178, 22, 11, true, false);
        drawCanvasVectorIcon(ctx, 'qr', infoX + 9, infoTopY + 4, 14, '#FFFFFF');
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 10.5px ' + fontFam;
        ctx.fillText('QUÉT MÃ QR THANH TOÁN', infoX + 28, infoTopY + 15);

        ctx.fillStyle = '#132B22';
        ctx.font = '800 16.5px ' + fontFam;
        var hostLine = 'Đại diện: ' + hostName + (single.hasCustomLabel ? (' (' + single.label + ')') : '');
        ctx.fillText(fitText(ctx, hostLine, infoMaxW), infoX, infoTopY + 52);

        if (bankDetail) {
          ctx.fillStyle = '#065F46';
          ctx.font = '700 13.5px ' + fontFam;
          ctx.fillText(fitText(ctx, bankDetail, infoMaxW), infoX, infoTopY + 80);
        }

        var hbCanvas = getHostBankInfo();
        var memoPrefixCanvas = needsSevqrPrefix(hbCanvas.bank) ? 'SEVQR ' : '';
        var memoLabel = 'Nội dung CK: ' + memoPrefixCanvas + orderCode + ' [Tên bạn]';
        ctx.font = '700 12px ' + fontFam;
        var memoW = Math.min(infoMaxW, ctx.measureText(memoLabel).width + 22);
        var memoY = bankDetail ? (infoTopY + 100) : (infoTopY + 76);
        ctx.fillStyle = '#FFFFFF';
        drawRoundedRect(ctx, infoX, memoY, memoW, 28, 8, true, false);
        ctx.strokeStyle = '#A7F3D0';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, infoX, memoY, memoW, 28, 8, false, true);
        ctx.fillStyle = '#047857';
        ctx.fillText(fitText(ctx, memoLabel, memoW - 16), infoX + 11, memoY + 18);
      } else {
        var innerLeft = pad + qrOuterPad;
        ctx.fillStyle = '#0A7259';
        drawRoundedRect(ctx, innerLeft, curY + 15, 178, 22, 11, true, false);
        drawCanvasVectorIcon(ctx, 'qr', innerLeft + 9, curY + 19, 14, '#FFFFFF');
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 10.5px ' + fontFam;
        ctx.fillText('QUÉT MÃ QR THANH TOÁN', innerLeft + 28, curY + 30);

        var multiMemo = 'ND: #' + orderCode;
        ctx.font = '700 11.5px ' + fontFam;
        var mMemoW = Math.min(180, ctx.measureText(multiMemo).width + 18);
        var mMemoX = W - pad - qrOuterPad - mMemoW;
        ctx.fillStyle = '#FFFFFF';
        drawRoundedRect(ctx, mMemoX, curY + 13, mMemoW, 24, 8, true, false);
        ctx.strokeStyle = '#A7F3D0';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, mMemoX, curY + 13, mMemoW, 24, 8, false, true);
        ctx.fillStyle = '#047857';
        ctx.fillText(fitText(ctx, multiMemo, mMemoW - 14), mMemoX + 9, curY + 29);

        var hostMaxW = Math.max(80, mMemoX - 10 - (innerLeft + 190));
        ctx.fillStyle = '#132B22';
        ctx.font = '800 14px ' + fontFam;
        ctx.fillText(fitText(ctx, 'Đại diện: ' + hostName, hostMaxW), innerLeft + 190, curY + 31);

        ctx.fillStyle = '#047857';
        ctx.font = '700 11.5px ' + fontFam;
        ctx.fillText(
          fitText(ctx, 'Xếp dọc khổ lớn (' + qrItems.length + ' mã QR) · Chọn 1 mã bên dưới để quét', qrInnerW),
          innerLeft,
          curY + 51
        );

        var cardY = curY + qrHeadH;
        qrVerticalCards.forEach(function (card) {
          var cx = innerLeft;
          var cy = cardY;

          ctx.fillStyle = '#FFFFFF';
          drawRoundedRect(ctx, cx, cy, qrInnerW, card.cardH, 12, true, false);
          ctx.strokeStyle = '#A7F3D0';
          ctx.lineWidth = 1.25;
          drawRoundedRect(ctx, cx, cy, qrInnerW, card.cardH, 12, false, true);

          var slotBadgeTxt = card.item.hasCustomLabel ? ('QR #' + (card.idx + 1)) : card.item.label;
          var slotPillW = drawPillBadge(ctx, cx + 16, cy + 12, slotBadgeTxt, '#0A7259', '#FFFFFF', null, '800 11.5px ' + fontFam);

          ctx.font = '700 11.5px ' + fontFam;
          var cMemoW = Math.min(180, ctx.measureText(multiMemo).width + 18);
          var cMemoX = cx + qrInnerW - 16 - cMemoW;
          ctx.fillStyle = '#F0FDF4';
          drawRoundedRect(ctx, cMemoX, cy + 11, cMemoW, 22, 7, true, false);
          ctx.strokeStyle = '#A7F3D0';
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, cMemoX, cy + 11, cMemoW, 22, 7, false, true);
          ctx.textAlign = 'left';
          ctx.fillStyle = '#047857';
          ctx.fillText(fitText(ctx, multiMemo, cMemoW - 14), cMemoX + 9, cy + 26);

          if (card.item.hasCustomLabel) {
            var lblX = cx + 16 + slotPillW + 10;
            var lblMaxW = Math.max(60, cMemoX - 10 - lblX);
            ctx.fillStyle = '#132B22';
            ctx.font = '800 14.5px ' + fontFam;
            ctx.fillText(fitText(ctx, card.item.label, lblMaxW), lblX, cy + 27);
          }

          if (card.noteTxt) {
            ctx.fillStyle = '#065F46';
            ctx.font = '700 13px ' + fontFam;
            ctx.fillText(fitText(ctx, card.noteTxt, qrInnerW - 32), cx + 16, cy + 52);
          }

          var qx = cx + Math.round((qrInnerW - card.dims.fw) / 2);
          var qy = cy + card.cardHeadH;
          drawCrispQrBox(card.item.img, qx, qy, card.dims, 12);

          cardY += card.cardH + qrCardGap;
        });
      }

      curY += qrBoxH + 16;
    }

    // FOOTER BAR
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, curY, W, totalH - curY);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, curY);
    ctx.lineTo(W, curY);
    ctx.stroke();

    if (includeSplit) {
      // Chỉ hiển thị "Chuyển khoản cho [đại diện]" khi check Kèm bảng chia tiền, kèm highlight tên đại diện
      var pPre = 'Chuyển khoản cho ';
      var pPost = ' · Office Order · Chúc cả nhóm ngon miệng!';
      ctx.font = '600 11.5px ' + fontFam;
      var wPre = ctx.measureText(pPre).width;
      var wPost = ctx.measureText(pPost).width;
      ctx.font = '800 12px ' + fontFam;
      var wHostPill = ctx.measureText(hostName).width + 16;
      var totFootW = wPre + wHostPill + 6 + wPost;
      var fStartX = (W - totFootW) / 2;
      var footY = curY + 29;

      ctx.textAlign = 'left';
      ctx.font = '600 11.5px ' + fontFam;
      ctx.fillStyle = '#64748B';
      ctx.fillText(pPre, fStartX, footY);

      var hPillX = fStartX + wPre + 2;
      ctx.fillStyle = '#DCFCE7';
      drawRoundedRect(ctx, hPillX, footY - 15, wHostPill, 21, 10.5, true, false);
      ctx.strokeStyle = '#86EFAC';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, hPillX, footY - 15, wHostPill, 21, 10.5, false, true);
      ctx.fillStyle = '#047857';
      ctx.font = '800 12px ' + fontFam;
      ctx.textAlign = 'center';
      ctx.fillText(hostName, hPillX + wHostPill / 2, footY);

      ctx.textAlign = 'left';
      ctx.font = '600 11.5px ' + fontFam;
      ctx.fillStyle = '#64748B';
      ctx.fillText(pPost, hPillX + wHostPill + 4, footY);
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748B';
      ctx.font = '600 11.5px ' + fontFam;
      ctx.fillText('Office Order · Chúc cả nhóm ngon miệng!', W / 2, curY + 29);
    }

    // Outer border
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, 0.75, W - 1.5, totalH - 1.5);

    // Luôn cập nhật phần HTML bảng chia tiền
    renderSplitBillHtml(people, t, split.netAdj, hostName);
    updateHostDropdownUI();

    $('imageExportModal').hidden = false;
  }

  function renderSplitBillHtml(people, t, netAdj, hostName) {
    var container = $('splitBillHtmlList');
    if (!container) return;
    container.innerHTML = '';

    var amHost = canActAsHostOrOpen();
    var submitted = isOrderSubmitted();
    var paidCount = people.filter(function (p) { return p.paid; }).length;
    var claimedCount = people.filter(function (p) { return !p.paid && p.claimed; }).length;
    if ($('splitPersonCount')) {
      $('splitPersonCount').textContent = paidCount + '/' + people.length + ' đã trả' +
        (claimedCount > 0 ? (' · ' + claimedCount + ' chờ duyệt') : '');
    }

    var cUnit = (currentStore && currentStore.itemUnit) || 'món';
    var crownSvg = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-left:3px;"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>';

    people.forEach(function (p) {
      var share = p.share !== undefined ? p.share : ((t.sub > 0) ? Math.round(netAdj * (p.drinkSub / t.sub)) : 0);
      var finalPay = p.finalPay !== undefined ? p.finalPay : Math.max(0, p.drinkSub + share);
      var isClaimed = !!(!p.paid && p.claimed);

      var adjStr = '';
      if (share > 0) adjStr = ' <span class="split-adj plus">+ship ' + fmt(share) + '</span>';
      else if (share < 0) adjStr = ' <span class="split-adj minus">−' + fmt(Math.abs(share)) + ' giảm</span>';

      var row = document.createElement('div');
      row.className = 'split-person-row' + (p.paid ? ' is-row-paid' : (isClaimed ? ' is-row-claimed' : ''));
      row.style.borderLeft = '3.5px solid ' + (p.paid ? '#10B981' : (isClaimed ? '#2563EB' : p.ucolor));

      var infoDiv = document.createElement('div');
      infoDiv.className = 'split-person-info';
      infoDiv.innerHTML =
        '<span class="split-person-badge" style="background-color:' + p.ucolor + '18;color:' + p.ucolor + ';border:1.5px solid ' + p.ucolor + ';">' +
          esc(p.name) + (p.isHost ? crownSvg : '') +
        '</span>' +
        '<span class="split-person-cups">' + p.cups + ' ' + esc(cUnit) + ' (' + fmt(p.drinkSub) + ')' + adjStr + '</span>';

      var payDiv = document.createElement('div');
      payDiv.className = 'split-person-pay';
      payDiv.innerHTML =
        '<span class="split-pay-lbl">Cần trả:</span>' +
        '<strong class="split-pay-amount">' + fmt(finalPay) + '</strong>';

      if (getHostQrSlots().length > 0 && finalPay > 0 && !p.paid) {
        if (!amHost && !p.isMe && submitted && !isClaimed) {
          var btnDonateRow = document.createElement('button');
          btnDonateRow.type = 'button';
          btnDonateRow.className = 'btn-person-qr btn-person-donate';
          btnDonateRow.innerHTML = '<span>🎁 Donate</span>';
          btnDonateRow.title = 'Thanh toán hộ (Donate) cho ' + p.name + ' (có bước xác nhận chống nhầm người)';
          btnDonateRow.onclick = function (e) {
            e.stopPropagation();
            openDonateConfirmModal(p);
          };
          payDiv.appendChild(btnDonateRow);
        } else if (amHost || p.isMe) {
          var btnMemberQrRow = document.createElement('button');
          btnMemberQrRow.type = 'button';
          btnMemberQrRow.className = 'btn-person-qr';
          btnMemberQrRow.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="21"/><line x1="14" y1="21" x2="21" y2="21"/></svg><span>QR</span>';
          btnMemberQrRow.title = 'Mở mã QR thanh toán riêng của ' + p.name + ' (khóa sẵn số tiền & nội dung)';
          btnMemberQrRow.onclick = function (e) {
            e.stopPropagation();
            openMemberPersonalQrModal(p);
          };
          payDiv.appendChild(btnMemberQrRow);
        }
      }

      if (amHost) {
        if (isClaimed) {
          var rejBtn = document.createElement('button');
          rejBtn.type = 'button';
          rejBtn.className = 'btn-claim-reject';
          rejBtn.textContent = '✕';
          rejBtn.title = 'Chưa thấy tiền vào bank — trả lại Chưa trả';
          rejBtn.onclick = function (e) {
            e.stopPropagation();
            rejectMemberPayClaim(p);
          };
          payDiv.appendChild(rejBtn);
        }
        var btnToggle = document.createElement('button');
        btnToggle.type = 'button';
        btnToggle.className = 'btn-paid-toggle' + (p.paid ? ' is-paid' : (isClaimed ? ' is-claimed' : ''));
        btnToggle.textContent = p.paid ? '✓ Đã trả' : (isClaimed ? '✓ Duyệt CK' : 'Chưa trả');
        btnToggle.title = p.paid
          ? 'Bấm để chuyển lại Chưa trả'
          : (isClaimed ? 'Kiểm tra bank xong bấm để xác nhận ĐÃ NHẬN' : 'Bấm để đánh dấu Đã trả tiền');
        btnToggle.onclick = function (e) {
          e.stopPropagation();
          toggleMemberPaid(p);
        };
        payDiv.appendChild(btnToggle);
      } else if (p.isMe && !p.paid && submitted) {
        var claimBtn = document.createElement('button');
        claimBtn.type = 'button';
        claimBtn.className = 'btn-claim-toggle' + (isClaimed ? ' is-claimed' : '');
        claimBtn.textContent = isClaimed ? '⏳ Đã báo · Hủy' : 'Tôi đã CK';
        claimBtn.title = isClaimed
          ? 'Đã báo Đại diện check bank (bấm để hủy nếu bấm nhầm)'
          : 'Bấm để báo cho Đại diện kiểm tra bank xác nhận';
        claimBtn.onclick = function (e) {
          e.stopPropagation();
          toggleMyPayClaim(p);
        };
        payDiv.appendChild(claimBtn);
      } else {
        var pill = document.createElement('span');
        pill.className = 'split-status-pill ' + (p.paid ? 'is-paid' : (isClaimed ? 'is-claimed' : 'is-unpaid'));
        pill.textContent = p.paid ? '✓ Đã trả' : (isClaimed ? '⏳ Chờ ĐD duyệt' : 'Chưa trả');
        payDiv.appendChild(pill);
      }

      row.appendChild(infoDiv);
      row.appendChild(payDiv);
      container.appendChild(row);
    });

    if ($('btnCopySplitText')) {
      $('btnCopySplitText').onclick = function () {
        var textLines = [];
        var stName = currentStore ? currentStore.name : 'Đơn Đặt Món';
        textLines.push('💰 BẢNG CHIA TIỀN: ' + stName.toUpperCase());
        textLines.push('Mã đơn: ' + orderCode);
        textLines.push('----------------------------------------');
        people.forEach(function (p) {
          var share = p.share !== undefined ? p.share : ((t.sub > 0) ? Math.round(netAdj * (p.drinkSub / t.sub)) : 0);
          var finalPay = p.finalPay !== undefined ? p.finalPay : Math.max(0, p.drinkSub + share);
          var adj = '';
          if (share > 0) adj = ' (+ship ' + fmt(share) + ')';
          else if (share < 0) adj = ' (-giảm ' + fmt(Math.abs(share)) + ')';
          var stTxt = p.paid ? ' [✓ Đã trả]' : (p.claimed ? ' [⏳ Chờ ĐD duyệt]' : ' [Chưa trả]');
          textLines.push('● ' + p.name + ' (' + p.cups + ' ' + cUnit + '): ' + fmt(p.drinkSub) + adj + ' 👉 Cần trả: ' + fmt(finalPay) + stTxt);
        });
        textLines.push('----------------------------------------');
        textLines.push('Tổng bill: ' + fmt(t.grand));
        var qrSlots = getHostQrSlots();
        var qrNotesList = qrSlots.map(function (s, idx) {
          var lbl = formatQrSlotDisplayName(s, idx);
          return s.note ? (lbl + ': ' + s.note) : lbl;
        }).filter(Boolean);
        var qrNote = qrNotesList.length ? (' (' + qrNotesList.join(' | ') + ')') : ((F.hostQrNote && F.hostQrNote.v) ? (' (' + F.hostQrNote.v + ')') : '');
        var bInfo = (!qrNote && currentStore && currentStore.bankInfo && currentStore.bankInfo.account) ?
          (' (STK: ' + currentStore.bankInfo.bank + ' ' + currentStore.bankInfo.account + ' - ' + (currentStore.bankInfo.owner || hostName) + ')') : '';
        textLines.push('Chuyển khoản cho: ' + hostName + (qrNote || bInfo));

        var copyStr = textLines.join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(copyStr).then(function () {
            showToast('✓ Đã sao chép bảng chia tiền dạng text!');
          }).catch(function () {
            prompt('Copy nội dung chia tiền:', copyStr);
          });
        } else {
          prompt('Copy nội dung chia tiền:', copyStr);
        }
      };
    }
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
    if (currentStore && currentStore.id !== 'uu-milktea') return;
    var url = api();
    if (!url) return;
    fetch(url + '?action=menu')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.menu && j.menu.length) {
          MENU = j.menu;
          STORE_UU.items = j.menu.filter(function (x) { return x.nhom !== 'topping'; });
          STORE_UU.toppings = j.menu.filter(function (x) { return x.nhom === 'topping'; });
          if (currentStore && currentStore.id === 'uu-milktea') {
            currentStore.items = STORE_UU.items.slice();
            currentStore.toppings = STORE_UU.toppings.slice();
            if (!currentStore.options) currentStore.options = { hasSize: true, hasSugar: true, hasIce: true, hasToppings: true };
            currentStore.options.hasToppings = true;
            renderMenu();
          }
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
    if (hasHostAssigned() && !isCurrentHost()) {
      showToast('🔒 Chỉ Đại diện (' + (getHostName() || 'Host') + ') mới được Chốt & Lưu Sheet!');
      return;
    }
    var wasAlreadySubmitted = isOrderSubmitted();
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

    if ($('saveMsg')) $('saveMsg').textContent = wasAlreadySubmitted ? 'Đang cập nhật lại vào Sheet…' : 'Đang lưu vào Sheet…';
    fetch(url, { method: 'POST', body: JSON.stringify({ action: 'save', order: order }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) {
          hist[0].synced = true;
          localStorage.setItem('pos_hist', JSON.stringify(hist));
          if (!hasHostAssigned()) {
            setSyncedField('hostUid', myUid, { prevHostUid: '' });
            setSyncedField('customer', myUname);
            if ($('customer')) $('customer').value = myUname;
            tryRestoreMyHostQr(false);
          }
          setSyncedField('orderSubmitted', true);
          setSyncedField('savedDisc', Math.max(0, Number(order.giam_gia) || 0));
          setSyncedField('savedShip', Math.max(0, Number(order.ship) || 0));
          var curPm = (F.paidMap && F.paidMap.v && typeof F.paidMap.v === 'object')
            ? Object.assign({}, F.paidMap.v)
            : {};
          var hUid = getHostUid() || myUid;
          if (hUid && curPm['u:' + hUid] === undefined) curPm['u:' + hUid] = true;
          setSyncedField('paidMap', curPm);

          updateUrlParams();
          updateHostDropdownUI();
          renderHostPayTracker();
          renderCart();
          renderSplitBillIfOpen();
          renderPayReminderPanel(false);
          rtSend();
          syncBillServerStateToSheet(true);

          if ($('saveMsg')) {
            $('saveMsg').textContent = wasAlreadySubmitted
              ? ('✓ Đã cập nhật ' + order.ma_don + ' vào Sheet lúc ' + new Date().toLocaleTimeString('vi-VN'))
              : ('✓ Đã chốt ' + order.ma_don + ' vào Sheet lúc ' + new Date().toLocaleTimeString('vi-VN'));
          }
          showToast(wasAlreadySubmitted
            ? '✓ Đã cập nhật lại Giảm giá & Phí ship vào Google Sheet!'
            : 'Đã chốt & lưu Sheet! Đã mở khóa đánh dấu Đã trả & Hối trả tiền.');
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

  /* ================= 10.5. STORE MODAL & MANAGEMENT ================= */
  var parsedStoreItems = [];
  var parsedStoreToppings = [];
  var parsedStoreCategories = [];

  function setupStoreModal() {
    var modal = $('storeModal');
    if (!modal) return;

    // Open store modal triggers
    var openBtns = ['btnOpenStoreSidebar', 'btnBrandSwitchPill', 'btnOpenStoreBanner', 'btnOpenStoreAction', 'btnMenuStores'];
    openBtns.forEach(function (bid) {
      if ($(bid)) {
        $(bid).onclick = function (e) {
          if (e && e.stopPropagation) e.stopPropagation();
          if ($('moreDropdown')) $('moreDropdown').hidden = true;
          openStoreListView();
          modal.hidden = false;
        };
      }
    });

    // Direct Store Settings triggers
    if ($('btnSidebarStoreSettings')) {
      $('btnSidebarStoreSettings').onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if ($('moreDropdown')) $('moreDropdown').hidden = true;
        openStoreEditView(currentStore);
        modal.hidden = false;
      };
    }
    if ($('btnMenuEditCurrentStore')) {
      $('btnMenuEditCurrentStore').onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if ($('moreDropdown')) $('moreDropdown').hidden = true;
        openStoreEditView(currentStore);
        modal.hidden = false;
      };
    }

    // Close buttons
    ['btnCloseStoreModal', 'btnCloseStoreModalBtn'].forEach(function (bid) {
      if ($(bid)) $(bid).onclick = function () { modal.hidden = true; };
    });

    // Tabs inside modal
    if ($('tabStoreList')) {
      $('tabStoreList').onclick = openStoreListView;
    }
    if ($('tabStoreCreate')) {
      $('tabStoreCreate').onclick = function () { openStoreEditView(null); };
    }
    if ($('btnGoCreateStore')) {
      $('btnGoCreateStore').onclick = function () { openStoreEditView(null); };
    }
    if ($('btnCancelEditStore')) {
      $('btnCancelEditStore').onclick = openStoreListView;
    }

    // Emoji picker
    document.querySelectorAll('#emojiPickerRow .emoji-opt').forEach(function (opt) {
      opt.onclick = function () {
        document.querySelectorAll('#emojiPickerRow .emoji-opt').forEach(function (x) { x.classList.remove('is-active'); });
        opt.classList.add('is-active');
        if ($('storeInputEmoji')) $('storeInputEmoji').value = opt.dataset.emoji;
        if ($('storeCustomEmojiInput')) $('storeCustomEmojiInput').value = opt.dataset.emoji;
      };
    });

    if ($('storeCustomEmojiInput')) {
      $('storeCustomEmojiInput').oninput = function () {
        var val = $('storeCustomEmojiInput').value.trim();
        if (val) {
          if ($('storeInputEmoji')) $('storeInputEmoji').value = val;
          document.querySelectorAll('#emojiPickerRow .emoji-opt').forEach(function (x) { x.classList.remove('is-active'); });
        }
      };
    }

    // Toggle size checkbox
    if ($('chkOptSize')) {
      $('chkOptSize').onchange = function () {
        renderStoreMenuBuilder();
      };
    }

    // Toggle quick paste panel
    if ($('btnToggleQuickPaste')) {
      $('btnToggleQuickPaste').onclick = function () {
        var p = $('quickPastePanel');
        if (!p) return;
        p.hidden = !p.hidden;
        if (!p.hidden && $('storeInputMenuText')) $('storeInputMenuText').focus();
      };
    }

    // Add category button & Enter key
    function handleAddNewCategory() {
      var inp = $('inputNewCatName');
      if (!inp) return;
      var name = inp.value.trim();
      if (!name) {
        alert('Vui lòng nhập tên phân loại mới (Vd: Bánh tráng, Nước giải khát...)');
        inp.focus();
        return;
      }
      if (parsedStoreCategories.indexOf(name) !== -1) {
        alert('Phân loại "' + name + '" đã có trong thực đơn.');
        inp.focus();
        return;
      }
      parsedStoreCategories.push(name);
      inp.value = '';
      renderStoreMenuBuilder();
    }
    if ($('btnAddCategory')) $('btnAddCategory').onclick = handleAddNewCategory;
    if ($('inputNewCatName')) {
      $('inputNewCatName').onkeydown = function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddNewCategory();
        }
      };
    }

    // Add single topping
    function handleAddSingleTop() {
      var nInp = $('inputNewTopName');
      var pInp = $('inputNewTopPrice');
      if (!nInp) return;
      var tName = nInp.value.trim();
      if (!tName) {
        nInp.focus();
        return;
      }
      var tPrice = cleanPrice(pInp ? pInp.value : 0);
      parsedStoreToppings.push({
        id: 'top_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
        ten: tName,
        gia: tPrice
      });
      nInp.value = '';
      if (pInp) pInp.value = '';
      renderToppingsBuilder();
      nInp.focus();
    }
    if ($('btnAddSingleTop')) $('btnAddSingleTop').onclick = handleAddSingleTop;
    if ($('inputNewTopName')) {
      $('inputNewTopName').onkeydown = function (e) {
        if (e.key === 'Enter') { e.preventDefault(); handleAddSingleTop(); }
      };
    }
    if ($('inputNewTopPrice')) {
      $('inputNewTopPrice').onkeydown = function (e) {
        if (e.key === 'Enter') { e.preventDefault(); handleAddSingleTop(); }
      };
    }
    if ($('btnParseToppings')) {
      $('btnParseToppings').onclick = function () {
        var rawTops = ($('storeInputToppingsText') ? $('storeInputToppingsText').value : '');
        if (!rawTops.trim()) return;
        var tops = parseToppingsText(rawTops);
        tops.forEach(function (t) {
          var ex = parsedStoreToppings.find(function (x) { return x.ten.toLowerCase() === t.ten.toLowerCase(); });
          if (ex) ex.gia = t.gia;
          else parsedStoreToppings.push(t);
        });
        renderToppingsBuilder();
        showToast('Đã nạp ' + tops.length + ' topping vào danh sách');
      };
    }

    // Toggle toppings section visibility
    if ($('chkOptTopping')) {
      $('chkOptTopping').onchange = function () {
        if ($('groupStoreToppings')) {
          $('groupStoreToppings').style.display = $('chkOptTopping').checked ? 'block' : 'none';
        }
      };
    }

    // Parse button
    if ($('btnParseMenuText')) {
      $('btnParseMenuText').onclick = doParseMenuInputs;
    }

    // Save Store button
    if ($('btnSaveStore')) {
      $('btnSaveStore').onclick = doSaveStore;
    }

    // Export stores JSON
    if ($('btnExportStores')) {
      $('btnExportStores').onclick = function () {
        var data = {
          app: 'office-order',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          stores: getAllStores()
        };
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'office-order-stores.json';
        a.click();
        showToast('Đã xuất file office-order-stores.json');
      };
    }

    // Sync stores from Google Sheet
    if ($('btnSyncStoresSheet')) {
      $('btnSyncStoresSheet').onclick = function () {
        syncStoresFromSheet(false);
      };
    }

    // Import stores JSON
    if ($('btnImportStores') && $('inputImportStoresFile')) {
      $('btnImportStores').onclick = function () {
        $('inputImportStoresFile').click();
      };
      $('inputImportStoresFile').onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          try {
            var json = JSON.parse(evt.target.result);
            var importedStores = json.stores || (Array.isArray(json) ? json : []);
            if (!Array.isArray(importedStores) || !importedStores.length) {
              alert('File JSON không chứa danh sách quán hợp lệ.');
              return;
            }
            var currentCustoms = getCustomStores();
            importedStores.forEach(function (st) {
              if (st.id === 'uu-milktea' || st.id === 'vua-tron') return;
              var existing = currentCustoms.find(function (x) { return x.id === st.id; });
              if (existing) {
                Object.assign(existing, st);
              } else {
                currentCustoms.push(st);
              }
              pushStoreToSheet(st);
            });
            saveCustomStores(currentCustoms);
            renderStoreListGrid();
            showToast('✓ Đã nạp thành công các quán và đồng bộ với Google Sheet!');
          } catch (err) {
            alert('Lỗi đọc file JSON: ' + err.message);
          }
        };
        reader.readAsText(file);
      };
    }
  }

  function openStoreListView() {
    if ($('storeListView')) $('storeListView').hidden = false;
    if ($('storeEditView')) $('storeEditView').hidden = true;
    if ($('tabStoreList')) $('tabStoreList').classList.add('is-active');
    if ($('tabStoreCreate')) $('tabStoreCreate').classList.remove('is-active');
    if ($('storeListFooterBtns')) $('storeListFooterBtns').hidden = false;
    if ($('storeEditFooterBtns')) $('storeEditFooterBtns').hidden = true;
    if ($('storeModalTitle')) {
      $('storeModalTitle').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Quán Yêu Thích & Menu Đặt Món';
    }
    renderStoreListGrid();
  }

  function renderStoreListGrid() {
    var grid = $('storeListGrid');
    if (!grid) return;
    grid.innerHTML = '';

    var stores = getAllStores();
    stores.forEach(function (st) {
      var card = document.createElement('div');
      var isActive = (currentStore && currentStore.id === st.id);
      card.className = 'store-card' + (isActive ? ' is-active-store' : '');

      var totalItems = (st.items ? st.items.length : 0);
      var totalTops = (st.toppings ? st.toppings.length : 0);
      var countStr = totalItems + ' món' + (totalTops ? ' · ' + totalTops + ' topping' : '');

      var activeBadgeHtml = isActive ? '<span class="store-active-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><polyline points="20 6 9 17 4 12"/></svg>ĐANG CHỌN</span>' : '';

      var delBtnHtml = '';
      if (!st.isBuiltin || st.id !== 'uu-milktea') {
        delBtnHtml = '<button class="btn-store-del-corner btn-del-store" type="button" title="Xóa quán">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>' +
          '</button>';
      }

      var actionBtnsHtml = '';
      if (!isActive) {
        actionBtnsHtml += '<button class="btn-select-store" type="button">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px;vertical-align:-2px;"><polyline points="16 3 21 8 16 13"/><line x1="21" y1="8" x2="9" y2="8"/><polyline points="8 21 3 16 8 11"/><line x1="3" y1="16" x2="15" y2="16"/></svg>' +
          'Đổi quán</button>';
      } else {
        actionBtnsHtml += '<span style="font-size:12px; font-weight:700; color:#0A7259; padding: 7px 0; display:inline-flex; align-items:center; gap:4px;">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
          'Đang mở quán này</span>';
      }

      actionBtnsHtml += '<button class="btn-store-subaction btn-edit-store" type="button" title="Cài đặt quán & chip ghi chú">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:-2px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' +
        'Cài đặt</button>';

      card.innerHTML =
        delBtnHtml +
        '<div class="store-card-head">' +
          '<div class="store-card-emoji">' + getStoreSvg(st, 26) + '</div>' +
          '<div class="store-card-info">' +
            '<h4>' + esc(st.name) + '</h4>' +
            '<p>' + esc(st.tagline || (st.category === 'comtrua' ? 'Cơm trưa văn phòng' : 'Đặt món cùng nhau')) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="store-card-meta">' +
          '<span>' + countStr + '</span>' +
          activeBadgeHtml +
        '</div>' +
        '<div class="store-card-actions">' +
          actionBtnsHtml +
        '</div>';

      var btnSelect = card.querySelector('.btn-select-store');
      if (btnSelect) {
        btnSelect.onclick = function () {
          if (currentStore && currentStore.id === st.id) {
            $('storeModal').hidden = true;
            return;
          }

          if (cart.length > 0) {
            var msg =
              '⚠️ Bill hiện tại (' + orderCode + ') đang có ' + cart.length + ' món đặt chung của nhóm.\n\n' +
              'Để tránh làm mất giỏ hàng của các bạn khác, hệ thống sẽ TẠO BILL MỚI cho quán "' + st.name + '".\n' +
              '(Bill cũ vẫn được giữ nguyên an toàn cho mọi người tiếp tục đặt).\n\n' +
              'Bạn có muốn tạo Bill mới và chuyển sang quán "' + st.name + '" không?';

            if (!confirm(msg)) return;

            orderCode = newOrderCode();
            cart = [];
            cartDel = {};
            F = {};
            activePayUrge = null;
            hideHostClaimBanner();
            stopPayUrgeAudio();
            onlineUsers = {};
            remoteFocus = {};
            if ($('customer')) $('customer').value = '';
            if ($('orderNote')) $('orderNote').value = '';
            if ($('discount')) $('discount').value = '0';
            if ($('shipFee')) $('shipFee').value = '0';
            initFields();
            writeInputs();
            syncUrgeCooldownFromStorage();
            syncPayUrgeCooldownFromStorage();
            switchStore(st.id, false);
            setupLive();
            renderCart();
            renderPayReminderPanel(false);
            $('storeModal').hidden = true;
            showToast('✓ Đã tạo Bill mới (' + orderCode + ') cho quán: ' + st.name);
            return;
          }

          switchStore(st.id, true);
          renderCart();
          $('storeModal').hidden = true;
          showToast('Đã chuyển sang quán: ' + st.name);
        };
      }

      var btnEdit = card.querySelector('.btn-edit-store');
      if (btnEdit) {
        btnEdit.onclick = function () {
          openStoreEditView(st);
        };
      }

      var btnDel = card.querySelector('.btn-del-store');
      if (btnDel) {
        btnDel.onclick = function (e) {
          e.stopPropagation();
          if (!confirm('Bạn có chắc muốn xóa quán "' + st.name + '" khỏi danh sách yêu thích và Google Sheet?')) return;
          var imgUrlsToDelete = (st.items || []).map(function (it) { return it && it.img; }).filter(Boolean);
          deleteUploadedImagesFromWorker(imgUrlsToDelete);
          var customs = getCustomStores().filter(function (x) { return x.id !== st.id; });
          saveCustomStores(customs);
          deleteStoreFromSheet(st.id);
          if (currentStore && currentStore.id === st.id) {
            switchStore('uu-milktea', true);
          }
          renderStoreListGrid();
          showToast('✓ Đã xóa quán "' + st.name + '" và đồng bộ Google Sheet!');
        };
      }

      card.style.cursor = 'pointer';
      card.onclick = function (e) {
        if (e.target.closest('.btn-store-subaction') || e.target.closest('.btn-store-del-corner')) {
          return;
        }
        if (btnSelect) btnSelect.click();
      };

      grid.appendChild(card);
    });
  }

  function cleanPrice(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    var s = String(val).trim().replace(/[\.,\sđd]/gi, '');
    var isK = /k/i.test(String(val));
    var num = parseInt(s, 10) || 0;
    if (isK || (num > 0 && num < 1000)) num = num * 1000;
    return num;
  }

  function openStoreEditView(storeToEdit) {
    if ($('storeListView')) $('storeListView').hidden = true;
    if ($('storeEditView')) $('storeEditView').hidden = false;
    if ($('tabStoreList')) $('tabStoreList').classList.remove('is-active');
    if ($('tabStoreCreate')) $('tabStoreCreate').classList.add('is-active');
    if ($('storeListFooterBtns')) $('storeListFooterBtns').hidden = true;
    if ($('storeEditFooterBtns')) $('storeEditFooterBtns').hidden = false;

    if ($('storeModalTitle')) {
      if (storeToEdit) {
        $('storeModalTitle').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Chỉnh Sửa Quán Yêu Thích';
      } else {
        $('storeModalTitle').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Tạo Quán Yêu Thích Mới';
      }
    }

    parsedStoreItems = [];
    parsedStoreToppings = [];
    parsedStoreCategories = [];

    if (storeToEdit) {
      $('editStoreId').value = storeToEdit.id;
      $('storeInputName').value = storeToEdit.name || '';
      $('storeInputCategory').value = storeToEdit.category || 'anvat';
      $('storeInputTagline').value = storeToEdit.tagline || '';
      var curIcon = storeToEdit.icon || '🫓';
      $('storeInputEmoji').value = curIcon;
      if ($('storeCustomEmojiInput')) $('storeCustomEmojiInput').value = curIcon;

      document.querySelectorAll('#emojiPickerRow .emoji-opt').forEach(function (opt) {
        opt.classList.toggle('is-active', opt.dataset.emoji === curIcon);
      });

      var opts = storeToEdit.options || {};
      $('chkOptSize').checked = !!opts.hasSize;
      $('chkOptSugar').checked = !!opts.hasSugar;
      $('chkOptIce').checked = !!opts.hasIce;
      $('chkOptTopping').checked = opts.hasToppings !== false;
      if ($('groupStoreToppings')) $('groupStoreToppings').style.display = $('chkOptTopping').checked ? 'block' : 'none';
      if ($('storeInputNoteChips')) $('storeInputNoteChips').value = (storeToEdit.noteChips || []).join(', ');

      var bInfo = storeToEdit.bankInfo || {};
      $('storeBankName').value = bInfo.bank || '';
      $('storeBankAccount').value = bInfo.account || '';
      $('storeBankOwner').value = bInfo.owner || '';

      var catIdToName = {};
      (storeToEdit.categories || []).forEach(function (c) {
        if (c.id) catIdToName[c.id] = c.name || c.id;
        if (c.name) catIdToName[c.name] = c.name;
      });

      parsedStoreItems = (storeToEdit.items || []).map(function (it) {
        var clone = Object.assign({}, it);
        if (clone.nhom && catIdToName[clone.nhom]) {
          clone.nhom = catIdToName[clone.nhom];
        }
        return clone;
      });
      parsedStoreToppings = (storeToEdit.toppings || []).map(function (t) { return Object.assign({}, t); });
      if (storeToEdit.id === 'uu-milktea' && (!parsedStoreToppings || !parsedStoreToppings.length)) {
        parsedStoreToppings = (STORE_UU_TOPPINGS_DEFAULT || []).map(function (t) { return Object.assign({}, t); });
      }

      (storeToEdit.categories || []).forEach(function (c) {
        var displayName = c.name || c.id;
        if (c.id !== 'topping' && displayName !== 'Topping' && parsedStoreCategories.indexOf(displayName) === -1) {
          parsedStoreCategories.push(displayName);
        }
      });
      parsedStoreItems.forEach(function (it) {
        var nh = it.nhom;
        if (nh && nh !== 'topping' && nh !== 'Topping' && parsedStoreCategories.indexOf(nh) === -1) {
          parsedStoreCategories.push(nh);
        }
      });
    } else {
      $('editStoreId').value = '';
      $('storeInputName').value = '';
      $('storeInputCategory').value = 'anvat';
      $('storeInputTagline').value = '';
      $('storeInputEmoji').value = '🫓';
      if ($('storeCustomEmojiInput')) $('storeCustomEmojiInput').value = '🫓';
      if ($('storeInputNoteChips')) $('storeInputNoteChips').value = '';
      document.querySelectorAll('#emojiPickerRow .emoji-opt').forEach(function (opt) {
        opt.classList.toggle('is-active', opt.dataset.emoji === '🫓');
      });
      $('chkOptSize').checked = true;
      $('chkOptSugar').checked = false;
      $('chkOptIce').checked = false;
      $('chkOptTopping').checked = false;
      if ($('groupStoreToppings')) $('groupStoreToppings').style.display = 'none';

      $('storeBankName').value = '';
      $('storeBankAccount').value = '';
      $('storeBankOwner').value = '';

      $('storeInputMenuText').value = '';
      $('storeInputToppingsText').value = '';
      parsedStoreCategories = [];
    }

    function updateStoreChipsPreview() {
      var preview = $('storeChipsPreview');
      var input = $('storeInputNoteChips');
      if (!preview || !input) return;
      var raw = input.value || '';
      var chips = raw.split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (!chips.length) {
        preview.innerHTML = '<span style="font-size:11.5px; color:#94A3B8; font-style:italic;">(Chưa có chip nào — gõ vào ô trên để thêm)</span>';
        return;
      }
      preview.innerHTML = '';
      chips.forEach(function (c) {
        var span = document.createElement('span');
        span.className = 'note-chip-btn is-active';
        span.style.cursor = 'default';
        span.textContent = c;
        preview.appendChild(span);
      });
    }

    if ($('storeInputNoteChips')) {
      $('storeInputNoteChips').oninput = updateStoreChipsPreview;
      updateStoreChipsPreview();
    }

    if ($('quickPastePanel')) $('quickPastePanel').hidden = true;
    renderStoreMenuBuilder();
  }

  function renderStoreMenuBuilder() {
    var container = $('storeCategoryCardsContainer');
    if (!container) return;
    container.innerHTML = '';

    var totalCount = parsedStoreItems.length;
    if ($('builderTotalCount')) $('builderTotalCount').textContent = totalCount;
    if ($('parsedItemCount')) $('parsedItemCount').textContent = totalCount;
    var hasSize = $('chkOptSize') ? $('chkOptSize').checked : false;

    // Ensure all items have their category listed in parsedStoreCategories
    var cats = parsedStoreCategories.slice();
    parsedStoreItems.forEach(function (it) {
      if (it.nhom && cats.indexOf(it.nhom) === -1) {
        cats.push(it.nhom);
      }
    });
    parsedStoreCategories = cats;

    if (!cats.length) {
      container.innerHTML =
        '<div class="menu-builder-empty" style="text-align:center; padding:24px 16px; background:#FFFFFF; border:1px dashed #CBD5E1; border-radius:10px;">' +
          '<div style="margin-bottom:8px; color:#94A3B8;"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>' +
          '<p style="font-weight:700; color:#334155; margin:0 0 4px; font-size:14px;">Chưa có phân loại món nào</p>' +
          '<p style="font-size:12.5px; color:#64748B; margin:0 0 12px; line-height:1.5;">' +
            'Bạn có thể nhập tên phân loại ở trên (Ví dụ: <b>Bánh tráng</b>, <b>Nước giải khát</b>) rồi bấm <b>+ Thêm phân loại</b>,<br>' +
            'hoặc bấm nút <b>Nhập nhanh từ văn bản</b> ở góc trên để dán menu từ Zalo.' +
          '</p>' +
        '</div>';
      renderToppingsBuilder();
      return;
    }

    cats.forEach(function (catName) {
      var card = document.createElement('div');
      card.className = 'cat-card-item';

      var catItems = parsedStoreItems.filter(function (x) { return x.nhom === catName; });

      var cardHeader = document.createElement('div');
      cardHeader.className = 'cat-card-header';
      cardHeader.innerHTML =
        '<div class="cat-card-title-wrap">' +
          '<span class="cat-card-icon" style="display:inline-flex;align-items:center;color:#0A7259;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>' +
          '<span class="cat-card-title">' + esc(catName) + '</span>' +
          '<span class="cat-card-badge">' + catItems.length + ' món</span>' +
        '</div>' +
        '<div class="cat-card-actions">' +
          '<button type="button" class="btn-del-cat" title="Xóa phân loại và tất cả món trong nhóm này"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:3px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Xóa nhóm</button>' +
        '</div>';

      cardHeader.querySelector('.btn-del-cat').onclick = function () {
        if (!confirm('Bạn có chắc muốn xóa phân loại "' + catName + '" và toàn bộ ' + catItems.length + ' món trong nhóm này?')) return;
        var removedImgs = parsedStoreItems
          .filter(function (x) { return x.nhom === catName && x.img; })
          .map(function (x) { return x.img; });
        deleteUploadedImagesFromWorker(removedImgs);
        parsedStoreItems = parsedStoreItems.filter(function (x) { return x.nhom !== catName; });
        parsedStoreCategories = parsedStoreCategories.filter(function (c) { return c !== catName; });
        renderStoreMenuBuilder();
      };
      card.appendChild(cardHeader);

      var itemsList = document.createElement('div');
      itemsList.className = 'cat-items-list';

      if (!catItems.length) {
        itemsList.innerHTML = '<p class="cat-empty-hint">Chưa có món nào. Thêm món bên dưới:</p>';
      } else {
        catItems.forEach(function (it) {
          var row = document.createElement('div');
          row.className = 'cat-item-row';
          var pStr = '';
          if (hasSize && it.giaL) {
            pStr = 'M ' + fmtK(it.giaM) + ' · L ' + fmtK(it.giaL);
          } else {
            pStr = fmt(it.giaM);
          }

          var resolvedImg = resolveItemImg(it, false);
          var hasCustomImg = !!(it.img && String(it.img).trim());

          // Ô thumbnail upload/kéo thả ảnh cho từng món
          var thumbWrap = document.createElement('div');
          thumbWrap.className = 'cat-item-thumb-wrap' + (resolvedImg ? ' has-img' : '');
          thumbWrap.title = resolvedImg
            ? 'Bấm hoặc kéo thả ảnh mới để đổi ảnh món này'
            : 'Bấm hoặc kéo thả ảnh từ máy để tải ảnh món lên (tự nén WebP 1:1)';

          var fileInp = document.createElement('input');
          fileInp.type = 'file';
          fileInp.accept = 'image/png,image/jpeg,image/webp';
          fileInp.className = 'cat-item-file-input';
          fileInp.hidden = true;

          if (resolvedImg) {
            thumbWrap.innerHTML =
              '<img src="' + esc(resolvedImg) + '" alt="' + esc(it.ten) + '" class="cat-item-thumb-img">' +
              '<span class="cat-item-thumb-overlay">Đổi</span>';
            if (hasCustomImg) {
              var btnRmImg = document.createElement('button');
              btnRmImg.type = 'button';
              btnRmImg.className = 'cat-item-thumb-rm';
              btnRmImg.title = 'Gỡ ảnh món này';
              btnRmImg.textContent = '×';
              btnRmImg.onclick = function (e) {
                e.stopPropagation();
                if (isUploadedWorkerImgUrl(it.img)) {
                  deleteUploadedImagesFromWorker([it.img]);
                }
                delete it.img;
                renderStoreMenuBuilder();
                showToast('Đã gỡ ảnh của món "' + it.ten + '"');
              };
              thumbWrap.appendChild(btnRmImg);
            }
          } else {
            thumbWrap.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
          }

          function handleItemImageFile(file) {
            if (!file) return;
            thumbWrap.classList.add('is-uploading');
            uploadMenuItemImage(file, it)
              .then(function (res) {
                it.img = res.url;
                thumbWrap.classList.remove('is-uploading');
                renderStoreMenuBuilder();
                showToast('✓ Đã tải ảnh cho "' + it.ten + '" (' + Math.max(1, Math.round((res.size || 0) / 1024)) + 'KB)');
              })
              .catch(function (err) {
                thumbWrap.classList.remove('is-uploading');
                showToast('⚠️ ' + (err && err.message ? err.message : 'Lỗi tải ảnh lên'));
              });
          }

          thumbWrap.onclick = function (e) {
            if (e.target.closest('.cat-item-thumb-rm')) return;
            fileInp.value = '';
            fileInp.click();
          };
          fileInp.onchange = function () {
            if (fileInp.files && fileInp.files[0]) {
              handleItemImageFile(fileInp.files[0]);
            }
          };
          thumbWrap.ondragover = function (e) {
            e.preventDefault();
            thumbWrap.classList.add('is-dragover');
          };
          thumbWrap.ondragleave = function () {
            thumbWrap.classList.remove('is-dragover');
          };
          thumbWrap.ondrop = function (e) {
            e.preventDefault();
            thumbWrap.classList.remove('is-dragover');
            var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (f) handleItemImageFile(f);
          };

          var nameEl = document.createElement('span');
          nameEl.className = 'cat-item-name';
          nameEl.textContent = it.ten;

          var priceEl = document.createElement('span');
          priceEl.className = 'cat-item-price';
          priceEl.textContent = pStr;

          var btnDelItem = document.createElement('button');
          btnDelItem.type = 'button';
          btnDelItem.className = 'btn-del-item';
          btnDelItem.title = 'Xóa món này';
          btnDelItem.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
          btnDelItem.onclick = function () {
            var iIdx = parsedStoreItems.indexOf(it);
            if (iIdx !== -1) {
              if (it.img && isUploadedWorkerImgUrl(it.img)) {
                deleteUploadedImagesFromWorker([it.img]);
              }
              parsedStoreItems.splice(iIdx, 1);
              renderStoreMenuBuilder();
            }
          };

          row.appendChild(fileInp);
          row.appendChild(thumbWrap);
          row.appendChild(nameEl);
          row.appendChild(priceEl);
          row.appendChild(btnDelItem);
          itemsList.appendChild(row);
        });
      }
      card.appendChild(itemsList);

      // Form thêm món mới vào phân loại này
      var addForm = document.createElement('div');
      addForm.className = 'cat-add-item-form';
      addForm.innerHTML =
        '<input type="text" class="input-add-name cust-input" placeholder="Tên món mới (Vd: Bánh tráng cuốn...)">' +
        '<input type="text" class="input-add-price-m cust-input" placeholder="' + (hasSize ? 'Giá M (vd: 20k)' : 'Đơn giá (vd: 20k)') + '">' +
        (hasSize ? '<input type="text" class="input-add-price-l cust-input" placeholder="Giá L (vd: 25k)">' : '') +
        '<button type="button" class="btn btn-sm btn-ghost-primary btn-add-item-to-cat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:3px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Thêm món</button>';

      var inpName = addForm.querySelector('.input-add-name');
      var inpPriceM = addForm.querySelector('.input-add-price-m');
      var inpPriceL = addForm.querySelector('.input-add-price-l');
      var btnAdd = addForm.querySelector('.btn-add-item-to-cat');

      function handleAddItem() {
        var tName = inpName.value.trim();
        if (!tName) {
          inpName.focus();
          return;
        }
        var pM = cleanPrice(inpPriceM.value);
        var pL = inpPriceL ? cleanPrice(inpPriceL.value) : 0;
        parsedStoreItems.push({
          id: 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
          ten: tName,
          nhom: catName,
          giaM: pM,
          giaL: pL
        });
        inpName.value = '';
        inpPriceM.value = '';
        if (inpPriceL) inpPriceL.value = '';
        renderStoreMenuBuilder();
        inpName.focus();
      }

      btnAdd.onclick = handleAddItem;
      [inpName, inpPriceM, inpPriceL].forEach(function (inp) {
        if (inp) {
          inp.onkeydown = function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddItem();
            }
          };
        }
      });

      card.appendChild(addForm);
      container.appendChild(card);
    });

    renderToppingsBuilder();
  }

  function renderToppingsBuilder() {
    var topList = $('storeToppingsList');
    if (!topList) return;
    topList.innerHTML = '';
    if (!parsedStoreToppings.length) {
      topList.innerHTML = '<p class="cat-empty-hint" style="margin:4px 0;">Chưa có topping / món thêm nào.</p>';
      return;
    }
    parsedStoreToppings.forEach(function (tp, idx) {
      var row = document.createElement('div');
      row.className = 'cat-item-row';
      row.innerHTML =
        '<span class="cat-item-name"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color:#0A7259;vertical-align:-1px;margin-right:4px;"><path d="M12 2l2.4 5.6L20 10l-4.2 4 1.2 5.8-5-3-5 3 1.2-5.8L4 10l5.6-2.4L12 2z"/></svg>' + esc(tp.ten) + '</span>' +
        '<span class="cat-item-price">+' + fmt(tp.gia) + '</span>' +
        '<button type="button" class="btn-del-item" title="Xóa topping này"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
      row.querySelector('.btn-del-item').onclick = function () {
        parsedStoreToppings.splice(idx, 1);
        renderToppingsBuilder();
      };
      topList.appendChild(row);
    });
  }

  function doParseMenuInputs() {
    var rawMenu = ($('storeInputMenuText') ? $('storeInputMenuText').value : '');
    var catVal = ($('storeInputCategory') ? $('storeInputCategory').value : 'anvat');
    var defaultCatName = 'Món chính';
    if (catVal === 'comtrua') defaultCatName = 'Cơm đĩa';
    else if (catVal === 'trasua') defaultCatName = 'Trà sữa';
    else if (catVal === 'cafe') defaultCatName = 'Cà phê';
    else if (catVal === 'anvat') defaultCatName = 'Bánh tráng & Ăn vặt';

    var parsed = parseMenuText(rawMenu, defaultCatName);
    if (!parsed.length) {
      alert('Không phân tích được món nào. Vui lòng kiểm tra lại văn bản dán vào.');
      return;
    }

    parsed.forEach(function (newItem) {
      var exIdx = parsedStoreItems.findIndex(function (x) {
        return x.ten.toLowerCase() === newItem.ten.toLowerCase() && x.nhom.toLowerCase() === newItem.nhom.toLowerCase();
      });
      if (exIdx !== -1) {
        parsedStoreItems[exIdx] = newItem;
      } else {
        parsedStoreItems.push(newItem);
      }
      if (parsedStoreCategories.indexOf(newItem.nhom) === -1) {
        parsedStoreCategories.push(newItem.nhom);
      }
    });

    var rawTops = ($('storeInputToppingsText') ? $('storeInputToppingsText').value : '');
    if (rawTops.trim()) {
      var tops = parseToppingsText(rawTops);
      tops.forEach(function (t) {
        var tIdx = parsedStoreToppings.findIndex(function (x) { return x.ten.toLowerCase() === t.ten.toLowerCase(); });
        if (tIdx !== -1) parsedStoreToppings[tIdx] = t;
        else parsedStoreToppings.push(t);
      });
    }

    renderStoreMenuBuilder();
    if ($('quickPastePanel')) $('quickPastePanel').hidden = true;
    showToast('✓ Đã nạp thành công ' + parsed.length + ' món vào Thực đơn!');
  }

  function doSaveStore() {
    var name = ($('storeInputName') ? $('storeInputName').value.trim() : '');
    if (!name) {
      alert('Vui lòng nhập Tên quán ăn / nước uống!');
      if ($('storeInputName')) $('storeInputName').focus();
      return;
    }

    if (!parsedStoreItems.length && $('storeInputMenuText') && $('storeInputMenuText').value.trim()) {
      doParseMenuInputs();
    }

    if (!parsedStoreItems.length) {
      alert('Vui lòng nhập ít nhất 1 món ăn trong danh sách món!');
      return;
    }

    var editId = ($('editStoreId') ? $('editStoreId').value : '');
    var storeId = editId || ('store_' + Date.now().toString(36));
    var storeEmoji = ($('storeInputEmoji') ? $('storeInputEmoji').value : '🍱') || '🍱';
    var storeCat = ($('storeInputCategory') ? $('storeInputCategory').value : 'comtrua');
    var storeTagline = ($('storeInputTagline') ? $('storeInputTagline').value.trim() : '');

    var uniqueNhom = [];
    parsedStoreCategories.forEach(function (c) {
      if (uniqueNhom.indexOf(c) === -1) uniqueNhom.push(c);
    });
    parsedStoreItems.forEach(function (it) {
      var nh = it.nhom || 'Món chính';
      if (uniqueNhom.indexOf(nh) === -1) uniqueNhom.push(nh);
    });
    if ($('chkOptTopping') && $('chkOptTopping').checked && parsedStoreToppings.length > 0) {
      if (uniqueNhom.indexOf('topping') === -1) uniqueNhom.push('topping');
    }

    var cats = uniqueNhom.map(function (nh) {
      var icon = '✨';
      var lower = nh.toLowerCase();
      if (lower.indexOf('cơm') !== -1) icon = '🍱';
      else if (lower.indexOf('canh') !== -1) icon = '🍲';
      else if (lower.indexOf('nước') !== -1 || lower.indexOf('uống') !== -1 || lower.indexOf('giải khát') !== -1) icon = '🥤';
      else if (lower.indexOf('trà') !== -1) icon = '🧋';
      else if (lower.indexOf('cà phê') !== -1) icon = '☕';
      else if (lower.indexOf('bánh tráng') !== -1) icon = '🫓';
      else if (lower.indexOf('bánh') !== -1) icon = '🥖';
      else if (lower.indexOf('bún') !== -1 || lower.indexOf('mì') !== -1 || lower.indexOf('phở') !== -1) icon = '🍜';
      else if (lower.indexOf('ăn vặt') !== -1) icon = '🥢';
      else if (nh === 'topping') icon = '✨';

      return {
        id: nh,
        name: nh === 'topping' ? 'Topping' : nh,
        icon: icon,
        title: nh === 'topping' ? 'Topping & Món thêm' : nh,
        sub: 'Danh sách các món trong nhóm ' + nh
      };
    });

    var rawChips = ($('storeInputNoteChips') ? $('storeInputNoteChips').value : '');
    var noteChipsList = rawChips ? rawChips.split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean) : [];

    var exStore = editId ? getStoreById(editId) : null;
    var unitStr = (exStore && exStore.itemUnit) ? exStore.itemUnit : (storeCat === 'comtrua' ? 'phần' : (storeCat === 'trasua' ? 'ly' : 'món'));

    var storeObj = {
      id: storeId,
      name: name,
      tagline: storeTagline,
      icon: storeEmoji,
      category: storeCat,
      itemUnit: unitStr,
      isBuiltin: exStore ? !!exStore.isBuiltin : false,
      options: {
        hasSize: $('chkOptSize') ? $('chkOptSize').checked : false,
        hasSugar: $('chkOptSugar') ? $('chkOptSugar').checked : false,
        hasIce: $('chkOptIce') ? $('chkOptIce').checked : false,
        hasToppings: $('chkOptTopping') ? $('chkOptTopping').checked : true
      },
      noteChips: noteChipsList,
      bankInfo: {
        bank: ($('storeBankName') ? $('storeBankName').value.trim() : ''),
        account: ($('storeBankAccount') ? $('storeBankAccount').value.trim() : ''),
        owner: ($('storeBankOwner') ? $('storeBankOwner').value.trim() : '')
      },
      categories: cats,
      items: parsedStoreItems,
      toppings: parsedStoreToppings
    };

    sanitizeStore(storeObj);

    // Update BUILTIN_STORES if matching
    for (var b = 0; b < BUILTIN_STORES.length; b++) {
      if (BUILTIN_STORES[b].id === storeId) {
        Object.assign(BUILTIN_STORES[b], storeObj);
        break;
      }
    }

    var customs = getCustomStores();
    var idx = -1;
    for (var i = 0; i < customs.length; i++) {
      if (customs[i].id === storeId) { idx = i; break; }
    }
    if (idx !== -1) {
      customs[idx] = storeObj;
    } else {
      customs.push(storeObj);
    }
    saveCustomStores(customs);
    pushStoreToSheet(storeObj);

    if (currentStore && currentStore.id === storeId) {
      Object.assign(currentStore, storeObj);
      MENU = (currentStore.items || []).concat(currentStore.toppings || []);
      if (!currentStore.categories.some(function(c) { return c.id === currentCat || c.name === currentCat; })) {
        currentCat = currentStore.categories[0] ? currentStore.categories[0].id : 'all';
      }
      updateStoreBranding();
      renderCategoryTabs();
      renderMenu();
    } else if (cart.length > 0) {
      if (confirm('Đã lưu quán! Bạn có muốn chuyển sang đặt đơn tại quán "' + name + '" ngay không?\n(Hệ thống sẽ tạo Bill mới cho quán này để không làm mất giỏ hàng đang đặt của nhóm)')) {
        orderCode = newOrderCode();
        cart = [];
        cartDel = {};
        F = {};
        activePayUrge = null;
        hideHostClaimBanner();
        stopPayUrgeAudio();
        onlineUsers = {};
        remoteFocus = {};
        if ($('customer')) $('customer').value = '';
        if ($('orderNote')) $('orderNote').value = '';
        if ($('discount')) $('discount').value = '0';
        if ($('shipFee')) $('shipFee').value = '0';
        initFields();
        writeInputs();
        syncUrgeCooldownFromStorage();
        syncPayUrgeCooldownFromStorage();
        switchStore(storeObj, false);
        setupLive();
        renderCart();
        renderPayReminderPanel(false);
      }
    } else {
      switchStore(storeObj, true);
    }

    $('storeModal').hidden = true;
    showToast('✓ Đã lưu cài đặt quán "' + name + '" và đồng bộ Google Sheet!');
  }

  /* ================= 11. WIRING & EVENTS ================= */

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
    el.addEventListener('change', function () {
      var num = parseMoney(el.value);
      el.value = num > 0 ? num.toLocaleString('vi-VN') : '0';
      fieldChanged(id);
    });
    el.addEventListener('blur', function () {
      var num = parseMoney(el.value);
      el.value = num > 0 ? num.toLocaleString('vi-VN') : '0';
      fieldChanged(id);
    });
  });
  if ($('orderNote')) {
    $('orderNote').addEventListener('input', function () { fieldChanged('orderNote'); });
    $('orderNote').addEventListener('change', function () { fieldChanged('orderNote'); });
  }

  // Host Participant Checkbox Dropdown
  if ($('hostDropdownBtn')) {
    $('hostDropdownBtn').onclick = function (e) {
      e.stopPropagation();
      var assigned = hasHostAssigned();
      if (assigned && !isCurrentHost()) {
        showToast('🔒 Chỉ Đại diện hiện tại (' + (getHostName() || 'Host') + ') mới được chuyển key!');
        return;
      }
      var panel = $('hostDropdownPanel');
      if (!panel) return;
      var willOpen = panel.hidden;
      if (willOpen) {
        renderHostParticipantsList();
        panel.hidden = false;
        $('hostDropdownBtn').classList.add('is-open');
      } else {
        panel.hidden = true;
        $('hostDropdownBtn').classList.remove('is-open');
      }
    };
  }
  if ($('hostDropdownPanel')) {
    $('hostDropdownPanel').onclick = function (e) {
      e.stopPropagation();
    };
  }
  document.addEventListener('click', function () {
    var hp = $('hostDropdownPanel');
    var hb = $('hostDropdownBtn');
    if (hp) hp.hidden = true;
    if (hb) hb.classList.remove('is-open');
  });

  // Nút Hối Đặt Hàng (Mở modal chọn mẫu thoại & broadcast chống spam 30s)
  if ($('btnUrgeTopbar')) {
    $('btnUrgeTopbar').onclick = openUrgeModal;
  }
  if ($('mobileUrgeBtn')) {
    $('mobileUrgeBtn').onclick = openUrgeModal;
  }
  if ($('btnCloseUrgeModal')) $('btnCloseUrgeModal').onclick = closeUrgeModal;
  if ($('btnCancelUrgeModal')) $('btnCancelUrgeModal').onclick = closeUrgeModal;
  if ($('btnConfirmUrgeSend')) $('btnConfirmUrgeSend').onclick = sendUrgeOrder;
  if ($('urgeModal')) {
    $('urgeModal').onclick = function (e) {
      if (e.target === $('urgeModal')) closeUrgeModal();
    };
  }
  if ($('btnReplayUrgeAudio')) {
    $('btnReplayUrgeAudio').onclick = function () {
      if (typeof lastAlertReplayFn === 'function') {
        lastAlertReplayFn();
      } else {
        playUrgeSound(lastReceivedUrgeVoiceId);
      }
    };
  }
  if ($('btnCloseUrgeAlert')) {
    $('btnCloseUrgeAlert').onclick = function () {
      if ($('urgeAlertBanner')) $('urgeAlertBanner').hidden = true;
    };
  }
  if ($('btnHostClaimConfirm')) {
    $('btnHostClaimConfirm').onclick = function () {
      if (!activeHostClaimTarget) { hideHostClaimBanner(); return; }
      var target = activeHostClaimTarget;
      hideHostClaimBanner();
      setMemberPaidState(target, true);
    };
  }
  if ($('btnHostClaimReject')) {
    $('btnHostClaimReject').onclick = function () {
      if (!activeHostClaimTarget) { hideHostClaimBanner(); return; }
      var target = activeHostClaimTarget;
      hideHostClaimBanner();
      rejectMemberPayClaim(target);
    };
  }
  if ($('btnCloseHostClaimBanner')) {
    $('btnCloseHostClaimBanner').onclick = hideHostClaimBanner;
  }

  // Share bill link
  if ($('btnShare')) {
    $('btnShare').onclick = function () {
      var url = getShareUrl();
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
      if (typeof syncWebPushSubscription === 'function') syncWebPushSubscription(false);

      // Nếu bản thân đang được chọn làm người đại diện dưới tên cũ thì cập nhật theo tên mới
      if ($('customer')) {
        var curCust = $('customer').value.trim();
        if (curCust && curCust === oldName) {
          $('customer').value = newName;
          fieldChanged('customer');
          updateHostDropdownUI();
        }
      }

      cart.forEach(function (c) {
        if (canEditRow(c)) {
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

  // Tạo bill mới & Chuyển / Tìm mã bill
  var RECENT_BILLS_KEY = 'uu_recent_bills';
  var billSearchSeq = 0;
  var billSearchDebounce = null;

  function loadRecentBillsLocal() {
    try {
      var list = JSON.parse(localStorage.getItem(RECENT_BILLS_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function recordRecentBillSnapshot(totalsObj) {
    if (!orderCode) return;
    var t = totalsObj || totals();
    var hasData = (cart.length > 0 || isOrderSubmitted() || !!getHostName());
    if (!hasData) return;
    try {
      var list = loadRecentBillsLocal().filter(function (x) {
        return x && x.ma_don && String(x.ma_don).toUpperCase() !== String(orderCode).toUpperCase();
      });
      list.unshift({
        ma_don: orderCode,
        hostName: getHostName() || '',
        storeName: currentStore ? currentStore.name : '',
        storeId: currentStore ? currentStore.id : '',
        itemCount: t.totalCups || 0,
        tong: t.grand || 0,
        submitted: isOrderSubmitted(),
        updatedAt: Date.now()
      });
      localStorage.setItem(RECENT_BILLS_KEY, JSON.stringify(list.slice(0, 30)));
    } catch (e) {}
  }

  function switchToBill(targetCode) {
    var cleanCode = String(targetCode || '').trim();
    if (!cleanCode) return;
    if (cleanCode === orderCode) {
      if ($('billSearchModal')) $('billSearchModal').hidden = true;
      if ($('historyModal')) $('historyModal').hidden = true;
      showToast('Bạn đang mở bill #' + orderCode + ' rồi!');
      return;
    }

    if (ws && wsOk) {
      try { ws.send(JSON.stringify({ type: 'peer_left', bill: orderCode, uid: myUid, from: clientId })); } catch (e) {}
    }
    if (bc) {
      try { bc.postMessage({ kind: 'peer_left', bill: orderCode, uid: myUid, from: clientId }); } catch (e) {}
    }

    cart = [];
    cartDel = {};
    F = {};
    activePayUrge = null;
    hideHostClaimBanner();
    seenPayUrgeIds = {};
    seenPayClaimIds = {};
    seenPayConfirmIds = {};
    seenUrgeIds = {};
    stopPayUrgeAudio();
    onlineUsers = {};
    remoteFocus = {};

    orderCode = cleanCode;
    isInitialSyncing = true;
    setTimeout(function () { isInitialSyncing = false; }, 2500);
    updateUrlParams();

    if ($('customer')) $('customer').value = '';
    if ($('orderNote')) $('orderNote').value = '';
    if ($('discount')) $('discount').value = '0';
    if ($('shipFee')) $('shipFee').value = '0';
    initFields();
    writeInputs();
    syncUrgeCooldownFromStorage();
    syncPayUrgeCooldownFromStorage();
    renderCart();
    renderPayReminderPanel(false);
    fetchBillServerStateFromSheet();
    wsConnect();

    if ($('billSearchModal')) $('billSearchModal').hidden = true;
    if ($('historyModal')) $('historyModal').hidden = true;
    if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
    showToast('✓ Đã mở bill #' + orderCode);
  }

  function buildCombinedLocalBills() {
    var map = {};
    function upsert(entry) {
      if (!entry || !entry.ma_don) return;
      var k = String(entry.ma_don).trim().toUpperCase();
      var prev = map[k];
      if (!prev) {
        map[k] = Object.assign({}, entry);
      } else {
        map[k] = {
          ma_don: entry.ma_don || prev.ma_don,
          hostName: entry.hostName || prev.hostName || '',
          storeName: entry.storeName || prev.storeName || '',
          itemCount: Math.max(Number(entry.itemCount) || 0, Number(prev.itemCount) || 0),
          tong: (entry.tong !== undefined && entry.tong !== null && entry.tong > 0) ? entry.tong : (prev.tong || 0),
          submitted: !!(entry.submitted || prev.submitted),
          updatedAt: Math.max(Number(entry.updatedAt) || 0, Number(prev.updatedAt) || 0),
          timeLabel: entry.timeLabel || prev.timeLabel || '',
          source: entry.source || prev.source || 'local'
        };
      }
    }

    if (orderCode && (cart.length > 0 || isOrderSubmitted() || getHostName())) {
      var curT = totals();
      upsert({
        ma_don: orderCode,
        hostName: getHostName() || '',
        storeName: currentStore ? currentStore.name : '',
        itemCount: curT.totalCups || 0,
        tong: curT.grand || 0,
        submitted: isOrderSubmitted(),
        updatedAt: Date.now(),
        source: 'local'
      });
    }
    loadRecentBillsLocal().forEach(function (r) {
      upsert(Object.assign({}, r, { source: 'local' }));
    });
    try {
      var hist = JSON.parse(localStorage.getItem('pos_hist') || '[]');
      (Array.isArray(hist) ? hist : []).forEach(function (h) {
        if (!h || !h.ma_don) return;
        upsert({
          ma_don: h.ma_don,
          hostName: (h.order && h.order.ten_khach) || '',
          itemCount: (h.order && Array.isArray(h.order.items)) ? h.order.items.length : 0,
          tong: Number(h.tong) || 0,
          submitted: !!h.synced,
          timeLabel: h.time || '',
          updatedAt: 0,
          source: 'sheet_local'
        });
      });
    } catch (e) {}

    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
  }

  function renderBillSearchResults(results, rawQuery, searchingRemote) {
    var wrap = $('billSearchResults');
    var stEl = $('billSearchStatus');
    if (!wrap) return;

    var qClean = String(rawQuery || '').trim();
    if (stEl) {
      if (searchingRemote) {
        stEl.hidden = false;
        stEl.textContent = 'Đang tìm trên phòng Live và Google Sheet…';
      } else if (results.length > 0) {
        stEl.hidden = false;
        stEl.textContent = 'Tìm thấy ' + results.length + ' bill' + (qClean ? (' khớp "' + qClean + '"') : ' gần đây') + ':';
      } else {
        stEl.hidden = true;
      }
    }

    wrap.innerHTML = '';
    var hasExactMatch = results.some(function (r) {
      return String(r.ma_don || '').trim().toUpperCase() === qClean.toUpperCase();
    });

    if (!results.length && !qClean) {
      wrap.innerHTML = '<div class="bill-search-empty">Chưa có bill nào gần đây. Hãy nhập mã bill (vd: U7K4M) để tìm hoặc vào phòng đặt chung!</div>';
      return;
    }

    results.forEach(function (item) {
      var card = document.createElement('div');
      var isCur = String(item.ma_don || '').trim().toUpperCase() === String(orderCode || '').trim().toUpperCase();
      card.className = 'bill-result-card' + (isCur ? ' is-current' : '');

      var statusCls = item.submitted ? 'is-saved' : (item.isLive ? 'is-live' : 'is-new');
      var statusTxt = item.submitted ? 'Đã chốt & lưu Sheet' : (item.isLive ? ('Đang đặt realtime' + (item.onlineCount ? (' · ' + item.onlineCount + ' online') : '')) : 'Gần đây');

      var metaParts = [];
      if (item.storeName) metaParts.push(item.storeName);
      if (item.hostName) metaParts.push('Đại diện: ' + item.hostName);
      if (item.itemCount > 0) metaParts.push(item.itemCount + ' món');
      if (item.tong > 0) metaParts.push(fmt(item.tong));
      if (!item.updatedAt && item.timeLabel) metaParts.push(item.timeLabel);

      var mainDiv = document.createElement('div');
      mainDiv.className = 'bill-result-main';
      mainDiv.innerHTML =
        '<div class="bill-result-top">' +
          '<span class="bill-result-code">#' + esc(item.ma_don) + '</span>' +
          '<span class="bill-result-pill ' + statusCls + '">' + esc(statusTxt) + '</span>' +
        '</div>' +
        '<div class="bill-result-meta">' + (metaParts.length ? esc(metaParts.join(' · ')) : 'Phòng bill sẵn sàng') + '</div>';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-open-bill';
      btn.textContent = isCur ? 'Đang mở' : 'Mở bill';
      btn.disabled = isCur;
      btn.onclick = function () { switchToBill(item.ma_don); };

      card.appendChild(mainDiv);
      card.appendChild(btn);
      wrap.appendChild(card);
    });

    if (qClean && /^[A-Za-z0-9_-]{3,24}$/.test(qClean) && !hasExactMatch && results.length === 0 && !searchingRemote) {
      var guessCode = qClean.toUpperCase();
      var directCard = document.createElement('div');
      directCard.className = 'bill-result-card';
      directCard.innerHTML =
        '<div class="bill-result-main">' +
          '<div class="bill-result-top">' +
            '<span class="bill-result-code">#' + esc(guessCode) + '</span>' +
            '<span class="bill-result-pill is-new">Mở phòng theo mã</span>' +
          '</div>' +
          '<div class="bill-result-meta">Chưa thấy dữ liệu lưu — bấm để vào/tạo phòng #' + esc(guessCode) + '</div>' +
        '</div>';
      var directBtn = document.createElement('button');
      directBtn.type = 'button';
      directBtn.className = 'btn-open-bill';
      directBtn.textContent = 'Vào phòng';
      directBtn.onclick = function () { switchToBill(guessCode); };
      directCard.appendChild(directBtn);
      wrap.appendChild(directCard);
    }
  }

  function performBillSearch(rawQuery) {
    var seq = ++billSearchSeq;
    var q = String(rawQuery || '').trim();
    var qLower = q.toLowerCase();
    var mergedMap = {};

    function mergeEntry(e) {
      if (!e || !e.ma_don) return;
      var k = String(e.ma_don).trim().toUpperCase();
      var prev = mergedMap[k] || {};
      mergedMap[k] = {
        ma_don: prev.ma_don || String(e.ma_don).trim(),
        hostName: e.hostName || prev.hostName || '',
        storeName: e.storeName || prev.storeName || '',
        itemCount: Math.max(Number(e.itemCount) || 0, Number(prev.itemCount) || 0),
        tong: (Number(e.tong) > 0 ? Number(e.tong) : (Number(prev.tong) || 0)),
        submitted: !!(e.submitted || prev.submitted),
        isLive: !!(e.isLive || prev.isLive),
        onlineCount: Math.max(Number(e.onlineCount) || 0, Number(prev.onlineCount) || 0),
        updatedAt: Math.max(Number(e.updatedAt) || 0, Number(prev.updatedAt) || 0),
        timeLabel: e.timeLabel || prev.timeLabel || ''
      };
    }

    function currentFilteredList() {
      var arr = Object.keys(mergedMap).map(function (k) { return mergedMap[k]; });
      if (qLower) {
        arr = arr.filter(function (it) {
          return String(it.ma_don || '').toLowerCase().indexOf(qLower) !== -1 ||
            String(it.hostName || '').toLowerCase().indexOf(qLower) !== -1 ||
            String(it.storeName || '').toLowerCase().indexOf(qLower) !== -1;
        });
      }
      arr.sort(function (a, b) {
        var aExact = qLower && String(a.ma_don || '').toLowerCase() === qLower ? 1 : 0;
        var bExact = qLower && String(b.ma_don || '').toLowerCase() === qLower ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
      return arr;
    }

    buildCombinedLocalBills().forEach(mergeEntry);

    var promises = [];
    var origin = wsHttpOrigin();
    if (origin) {
      promises.push(
        fetch(origin + '/bills?q=' + encodeURIComponent(q))
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) {
            if (j && j.ok && Array.isArray(j.bills)) {
              j.bills.forEach(function (b) {
                mergeEntry({
                  ma_don: b.bill,
                  hostName: b.hostName || '',
                  storeName: b.storeName || '',
                  itemCount: b.itemCount || b.linesCount || 0,
                  tong: b.subTotal || 0,
                  submitted: !!b.submitted,
                  isLive: true,
                  onlineCount: b.onlineCount || 0,
                  updatedAt: b.updatedAt || Date.now()
                });
              });
            }
          }).catch(function () {})
      );

      if (q && /^[A-Za-z0-9_-]{3,24}$/.test(q)) {
        var candidates = [q];
        var qUp = q.toUpperCase();
        if (candidates.indexOf(qUp) === -1) candidates.push(qUp);
        if (qUp.length === 4 && qUp.charAt(0) !== 'U') candidates.push('U' + qUp);
        candidates.forEach(function (codeCandidate) {
          promises.push(
            fetch(origin + '/bill/' + encodeURIComponent(codeCandidate) + '?info=1')
              .then(function (r) { return r.ok ? r.json() : null; })
              .then(function (j) {
                if (j && j.ok && j.exists) {
                  mergeEntry({
                    ma_don: j.bill || codeCandidate,
                    hostName: j.hostName || '',
                    storeName: j.storeName || '',
                    itemCount: j.itemCount || j.linesCount || 0,
                    tong: j.subTotal || 0,
                    submitted: !!j.submitted,
                    isLive: true,
                    onlineCount: j.onlineCount || 0,
                    updatedAt: Date.now()
                  });
                }
              }).catch(function () {})
          );
        });
      }
    }

    var sheetUrl = api();
    if (sheetUrl) {
      var sep = sheetUrl.indexOf('?') === -1 ? '?' : '&';
      promises.push(
        fetch(sheetUrl + sep + 'action=search_bills&q=' + encodeURIComponent(q) + '&t=' + Date.now())
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) {
            if (j && j.ok && Array.isArray(j.bills)) {
              j.bills.forEach(function (b) {
                mergeEntry({
                  ma_don: b.ma_don || b.bill,
                  hostName: b.hostName || '',
                  storeName: b.storeName || '',
                  tong: Number(b.tong_cong) || 0,
                  submitted: !!b.submitted,
                  updatedAt: Number(b.updatedAt) || Number(b.thoi_gian) || 0
                });
              });
            }
          }).catch(function () {})
      );

      if (q && /^[A-Za-z0-9_-]{3,24}$/.test(q)) {
        var sheetCandidates = [q];
        var qSup = q.toUpperCase();
        if (sheetCandidates.indexOf(qSup) === -1) sheetCandidates.push(qSup);
        if (qSup.length === 4 && qSup.charAt(0) !== 'U') sheetCandidates.push('U' + qSup);
        sheetCandidates.forEach(function (cCode) {
          promises.push(
            fetch(sheetUrl + sep + 'action=state&key=' + encodeURIComponent('BILL_' + cCode) + '&t=' + Date.now())
              .then(function (r) { return r.ok ? r.json() : null; })
              .then(function (j) {
                if (j && j.ok && j.state && j.state.value) {
                  var parsed = null;
                  try { parsed = JSON.parse(j.state.value); } catch (e) {}
                  if (parsed && (parsed.submitted || parsed.hostName || parsed.bill)) {
                    mergeEntry({
                      ma_don: parsed.bill || cCode,
                      hostName: parsed.hostName || '',
                      storeName: parsed.storeName || '',
                      submitted: !!parsed.submitted,
                      updatedAt: Number(j.state.updatedMs) || Number(parsed.updatedAt) || 0
                    });
                  }
                }
              }).catch(function () {})
          );
        });
      }
    }

    renderBillSearchResults(currentFilteredList(), q, promises.length > 0);
    if (promises.length > 0) {
      Promise.all(promises).then(function () {
        if (seq !== billSearchSeq) return;
        renderBillSearchResults(currentFilteredList(), q, false);
      });
    }
  }

  function openBillSearchModal(initialQuery) {
    if ($('moreDropdown')) $('moreDropdown').hidden = true;
    var modal = $('billSearchModal');
    if (!modal) return;
    modal.hidden = false;
    var inp = $('billSearchInput');
    if (inp) {
      if (typeof initialQuery === 'string') inp.value = initialQuery;
      setTimeout(function () {
        try { inp.focus(); inp.select(); } catch (e) {}
      }, 40);
      performBillSearch(inp.value);
    } else {
      performBillSearch('');
    }
  }

  function closeBillSearchModal() {
    if ($('billSearchModal')) $('billSearchModal').hidden = true;
  }

  if ($('btnTopbarBillSearch')) $('btnTopbarBillSearch').onclick = function () { openBillSearchModal(''); };
  if ($('btnCartFindBill')) $('btnCartFindBill').onclick = function () { openBillSearchModal(''); };
  if ($('btnMenuFindBill')) $('btnMenuFindBill').onclick = function () { openBillSearchModal(''); };
  if ($('orderCode')) {
    $('orderCode').onclick = function () { openBillSearchModal(''); };
  }
  if ($('btnCloseBillSearch')) $('btnCloseBillSearch').onclick = closeBillSearchModal;
  if ($('btnCloseBillSearchBtn')) $('btnCloseBillSearchBtn').onclick = closeBillSearchModal;
  if ($('billSearchModal')) {
    $('billSearchModal').onclick = function (e) {
      if (e.target === $('billSearchModal')) closeBillSearchModal();
    };
  }
  if ($('btnRunBillSearch')) {
    $('btnRunBillSearch').onclick = function () {
      performBillSearch($('billSearchInput') ? $('billSearchInput').value : '');
    };
  }
  if ($('billSearchInput')) {
    $('billSearchInput').oninput = function () {
      clearTimeout(billSearchDebounce);
      var val = this.value;
      billSearchDebounce = setTimeout(function () { performBillSearch(val); }, 220);
    };
    $('billSearchInput').onkeydown = function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(billSearchDebounce);
        performBillSearch(this.value);
      }
    };
  }

  function createNewOrder() {
    if (cart.length && !confirm('Tạo bill mới? Bill hiện tại sẽ không bị ảnh hưởng.')) return;
    cart = [];
    cartDel = {};
    F = {};
    activePayUrge = null;
    hideHostClaimBanner();
    stopPayUrgeAudio();
    onlineUsers = {};
    remoteFocus = {};
    orderCode = newOrderCode();
    updateUrlParams();
    if ($('customer')) $('customer').value = '';
    if ($('orderNote')) $('orderNote').value = '';
    if ($('discount')) $('discount').value = '0';
    if ($('shipFee')) $('shipFee').value = '0';
    initFields();
    writeInputs();
    syncUrgeCooldownFromStorage();
    syncPayUrgeCooldownFromStorage();
    renderCart();
    renderPayReminderPanel(false);
    wsConnect();
    showToast('Đã tạo bill mới: ' + orderCode);
  }
  if ($('btnMenuNew')) $('btnMenuNew').onclick = createNewOrder;
  if ($('btnNewInline')) $('btnNewInline').onclick = createNewOrder;

  // Lịch sử đơn (có lọc & bấm để mở lại bill)
  function renderHistoryModalList(filterText) {
    var ul = $('historyList');
    if (!ul) return;
    var q = String(filterText || '').trim().toLowerCase();
    var hist = JSON.parse(localStorage.getItem('pos_hist') || '[]');
    if (q) {
      hist = hist.filter(function (h) {
        return String(h.ma_don || '').toLowerCase().indexOf(q) !== -1 ||
          String(h.time || '').toLowerCase().indexOf(q) !== -1;
      });
    }
    ul.innerHTML = hist.length ? '' : '<li class="bill-search-empty">Chưa có đơn nào phù hợp trên máy này.</li>';
    hist.forEach(function (h) {
      var li = document.createElement('li');
      li.className = 'history-item';
      var left = document.createElement('div');
      left.className = 'history-item-main';
      left.innerHTML =
        '<span class="history-item-title">' + (h.synced ? '✓ ' : '⏳ ') + '#' + esc(h.ma_don) + ' · ' + Number(h.tong || 0).toLocaleString('vi-VN') + 'đ</span>' +
        '<span class="history-item-sub">' + esc(h.time || '') + '</span>';
      var openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'btn-open-bill';
      openBtn.textContent = 'Mở bill';
      li.onclick = function () { switchToBill(h.ma_don); };
      openBtn.onclick = function (e) { e.stopPropagation(); switchToBill(h.ma_don); };
      li.appendChild(left);
      li.appendChild(openBtn);
      ul.appendChild(li);
    });
  }

  if ($('btnNotifTopbar')) {
    $('btnNotifTopbar').onclick = function () {
      requestBrowserNotificationPermission(true);
    };
  }
  if ($('btnMenuNotifPerm')) {
    $('btnMenuNotifPerm').onclick = function () {
      if ($('moreDropdown')) $('moreDropdown').hidden = true;
      requestBrowserNotificationPermission(true);
    };
  }
  if ($('btnMenuHistory')) {
    $('btnMenuHistory').onclick = function () {
      if ($('moreDropdown')) $('moreDropdown').hidden = true;
      if ($('historyFilterInput')) $('historyFilterInput').value = '';
      renderHistoryModalList('');
      $('historyModal').hidden = false;
    };
  }
  if ($('historyFilterInput')) {
    $('historyFilterInput').oninput = function () {
      renderHistoryModalList(this.value);
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
      if (drinkerName && drinkerName !== myUname && (!myUname || FUN_NAMES.indexOf(myUname) !== -1 || /^Bạn #?\d+$/.test(myUname))) {
        myUname = drinkerName;
        try {
          localStorage.setItem('uu_pos_uname', myUname);
          sessionStorage.setItem(tabSessionId + '_uname', myUname);
        } catch (e) {}
        updateMyProfileUI();
        if (typeof syncWebPushSubscription === 'function') syncWebPushSubscription(false);
      }
      var noteVal = ($('custItemNote') ? $('custItemNote').value.trim() : '');

      var isFood = (currentStore && (currentStore.itemUnit === 'phần' || currentStore.category === 'anvat' || currentStore.category === 'comtrua'));
      if (curEditingLine) {
        // Cập nhật dòng hiện có
        var m = menuById(curEditingLine.id);
        if (m && m.nhom !== 'topping') {
          curEditingLine.size = curSelectedSize;
          if (curSelectedSize === 'XL') curEditingLine.price = m.giaXL || m.giaL || m.giaM;
          else if (curSelectedSize === 'L') curEditingLine.price = m.giaL || m.giaM;
          else curEditingLine.price = m.giaM;
        }
        curEditingLine.sugar = curSelectedSugar;
        curEditingLine.ice = curSelectedIce;
        curEditingLine.toppings = curSelectedToppings.map(function (t) { return Object.assign({}, t); });
        curEditingLine.note = noteVal;
        curEditingLine.uname = drinkerName;
        curEditingLine.owner = drinkerName;
        touch(curEditingLine);
        showToast(isFood ? ('Đã cập nhật phần của ' + drinkerName) : ('Đã cập nhật ly của ' + drinkerName));
      } else if (curCustomItem) {
        // Thêm ly mới
        var isTp = (curCustomItem.nhom === 'topping');
        var price = isTp ? curCustomItem.gia : (
          (curSelectedSize === 'XL') ? (curCustomItem.giaXL || curCustomItem.giaL || curCustomItem.giaM) :
          ((curSelectedSize === 'L') ? curCustomItem.giaL : curCustomItem.giaM)
        );
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
        isInitialSyncing = false;
        showToast(isFood ? ('Đã thêm 1 phần cho ' + drinkerName) : ('Đã thêm 1 ly cho ' + drinkerName));
      }

      closeItemCustomizer();
      renderCart();
    };
  }

  // Xuất ảnh Bill Canvas
  if ($('btnExportImage')) {
    $('btnExportImage').onclick = function () {
      var autoShowSplit = (hasHostAssigned() && isCurrentHost() && isOrderSubmitted());
      if ($('splitBillHtmlSection')) $('splitBillHtmlSection').hidden = !autoShowSplit;
      if ($('btnToggleSplitHtml')) $('btnToggleSplitHtml').classList.toggle('is-active', autoShowSplit);
      if ($('btnToggleSplitText')) $('btnToggleSplitText').textContent = autoShowSplit ? 'Ẩn Bảng chia tiền từng bạn' : 'Xem Bảng chia tiền từng bạn';
      if ($('chkIncludeSplitInCanvas')) $('chkIncludeSplitInCanvas').checked = true;
      exportCanvasBill();
    };
  }
  if ($('btnCloseImageModal')) $('btnCloseImageModal').onclick = function () { $('imageExportModal').hidden = true; };

  // Nút trigger show/hide phần HTML Bảng chia tiền từng bạn
  if ($('btnToggleSplitHtml')) {
    $('btnToggleSplitHtml').onclick = function () {
      var sec = $('splitBillHtmlSection');
      if (!sec) return;
      var isHidden = sec.hidden;
      sec.hidden = !isHidden;
      $('btnToggleSplitHtml').classList.toggle('is-active', isHidden);
      var textSpan = $('btnToggleSplitText');
      if (textSpan) {
        textSpan.textContent = isHidden ? 'Ẩn Bảng chia tiền từng bạn' : 'Xem Bảng chia tiền từng bạn';
      }
    };
  }

  // Tùy chọn kèm bảng chia tiền vào ảnh Canvas
  if ($('chkIncludeSplitInCanvas')) {
    $('chkIncludeSplitInCanvas').onchange = function () {
      exportCanvasBill();
    };
  }

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
              title: 'Hóa đơn ' + (currentStore ? currentStore.name : 'Office Order') + ': ' + orderCode,
              text: 'Đơn đặt món chung nhóm tại ' + (currentStore ? currentStore.name : 'quán'),
              files: [file]
            }).catch(function () {});
            return;
          }
          // Fallback share url
          var url = getShareUrl();
          navigator.share({ title: 'Bill ' + orderCode, url: url }).catch(function () {});
        }, 'image/png');
      } else {
        var url = getShareUrl();
        if (navigator.share) navigator.share({ title: 'Bill ' + orderCode, url: url }).catch(function () {});
        else window.prompt('Copy link bill:', url);
      }
    };
  }

  // Lưu Google Sheet
  if ($('btnSave')) $('btnSave').onclick = saveOrder;

  // Bảng Thu tiền trực tiếp ngay trên khung bill (dành cho Đại diện)
  if ($('btnTogglePayTracker')) {
    $('btnTogglePayTracker').onclick = function () {
      var box = $('hostPayTracker');
      if (!box) return;
      box.hidden = !box.hidden;
      $('btnTogglePayTracker').classList.toggle('is-open', !box.hidden);
      if (!box.hidden) renderHostPayTracker();
    };
  }
  if ($('btnClosePayTracker')) {
    $('btnClosePayTracker').onclick = function () {
      if ($('hostPayTracker')) $('hostPayTracker').hidden = true;
      if ($('btnTogglePayTracker')) $('btnTogglePayTracker').classList.remove('is-open');
    };
  }

  // Host QR Code Modal (Select file + Drag & Drop + Paste ảnh từ clipboard)
  function handleIncomingQrFile(file) {
    if (!file || (file.type && file.type.indexOf('image/') !== 0)) {
      showToast('Vui lòng chọn hoặc kéo thả đúng định dạng file ảnh QR!');
      return;
    }
    resizeImageFileToDataUrl(file, 1080, function (err, dataUrl) {
      if (err || !dataUrl) {
        showToast('Không đọc được file ảnh QR, hãy thử ảnh khác!');
        return;
      }
      if (draftHostQrSlots[0]) {
        draftHostQrSlots[0].bank = '';
        draftHostQrSlots[0].account = '';
        draftHostQrSlots[0].owner = '';
      }
      if ($('qrAccountNoInput')) $('qrAccountNoInput').value = '';
      updateHostQrPreview(dataUrl);
      if ($('btnRemoveHostQr')) $('btnRemoveHostQr').hidden = false;
      showToast('Đã nạp ảnh QR tĩnh! Bấm "Lưu Tài Khoản & QR" để gắn vào bill.');
    });
  }

  if ($('qrBankSelect')) {
    $('qrBankSelect').onchange = function () {
      var isCust = ($('qrBankSelect').value === 'CUSTOM');
      if ($('qrBankCodeInput')) {
        $('qrBankCodeInput').hidden = !isCust;
        if (isCust) $('qrBankCodeInput').focus();
      }
      syncInputsToDraftSlot();
      if (draftHostQrSlots[0] && draftHostQrSlots[0].qr) {
        updateHostQrPreview(draftHostQrSlots[0].qr);
      }
    };
  }
  ['qrBankCodeInput', 'qrAccountNoInput', 'qrAccountNameInput'].forEach(function (inpId) {
    if ($(inpId)) {
      $(inpId).oninput = function () {
        syncInputsToDraftSlot();
        if (draftHostQrSlots[0] && draftHostQrSlots[0].bank && draftHostQrSlots[0].account) {
          var liveUrl = buildSePayQrUrl(draftHostQrSlots[0].bank, draftHostQrSlots[0].account, 0, orderCode);
          updateHostQrPreview(liveUrl);
        }
      };
    }
  });

  if ($('btnOpenHostQr')) $('btnOpenHostQr').onclick = openHostQrModal;
  if ($('btnQuickHostQr')) $('btnQuickHostQr').onclick = openHostQrModal;
  if ($('btnViewHostQrsMember')) $('btnViewHostQrsMember').onclick = openHostQrViewerForMember;
  if ($('btnCloseHostQrModal')) $('btnCloseHostQrModal').onclick = closeHostQrModal;
  if ($('hostQrLabelInput')) {
    $('hostQrLabelInput').oninput = function () {
      syncInputsToDraftSlot();
      renderHostQrSlotsBar();
    };
  }
  if ($('hostQrNoteInput')) {
    $('hostQrNoteInput').oninput = function () {
      syncInputsToDraftSlot();
    };
  }
  if ($('hostQrModal')) {
    $('hostQrModal').onclick = function (e) {
      if (e.target === $('hostQrModal')) closeHostQrModal();
    };
  }
  if ($('btnPickQrFile') && $('hostQrFileInput')) {
    $('btnPickQrFile').onclick = function () { $('hostQrFileInput').click(); };
    $('hostQrFileInput').onchange = function (e) {
      var file = e.target.files && e.target.files[0];
      if (file) handleIncomingQrFile(file);
      e.target.value = '';
    };
  }
  if ($('hostQrPreviewWrap')) {
    var dz = $('hostQrPreviewWrap');
    dz.onclick = function (e) {
      if (e && e.target && e.target.closest && e.target.closest('#btnZoomHostPreviewQr')) return;
      if ($('hostQrFileInput')) $('hostQrFileInput').click();
    };
    ['dragenter', 'dragover'].forEach(function (evName) {
      dz.addEventListener(evName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.add('is-dragover');
      });
    });
    ['dragleave', 'dragend'].forEach(function (evName) {
      dz.addEventListener(evName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.remove('is-dragover');
      });
    });
    dz.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dz.classList.remove('is-dragover');
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files[0]) handleIncomingQrFile(files[0]);
    });
  }
  document.addEventListener('paste', function (e) {
    var qrModal = $('hostQrModal');
    if (!qrModal || qrModal.hidden) return;
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image/') === 0) {
        var f = items[i].getAsFile();
        if (f) {
          handleIncomingQrFile(f);
          break;
        }
      }
    }
  });
  if ($('btnGenerateVietQr')) $('btnGenerateVietQr').onclick = generateVietQrToDataUrl;
  if ($('btnSaveHostQr')) $('btnSaveHostQr').onclick = saveHostQr;
  if ($('btnRemoveHostQr')) $('btnRemoveHostQr').onclick = removeHostQr;

  // Phóng to mã QR để quét dễ hơn (#qrZoomModal)
  if ($('btnZoomPayQr')) {
    $('btnZoomPayQr').onclick = function (e) {
      e.stopPropagation();
      if (activePayQrZoomData) openQrZoomModal(activePayQrZoomData);
    };
  }
  if ($('btnZoomHostPreviewQr')) {
    $('btnZoomHostPreviewQr').onclick = function (e) {
      e.stopPropagation();
      if (!pendingHostQrData) return;
      syncInputsToDraftSlot();
      var noteVal = $('hostQrNoteInput') ? $('hostQrNoteInput').value.trim() : '';
      var labelVal = $('hostQrLabelInput') ? $('hostQrLabelInput').value.trim() : '';
      var filled = draftHostQrSlots.filter(function (s) { return s && s.qr; });
      var activeSlotObj = draftHostQrSlots[draftHostQrIdx];
      var startIdx = filled.indexOf(activeSlotObj);
      if (startIdx < 0) startIdx = 0;
      openQrZoomModal({
        slots: filled.length ? filled : [{ id: 'qr_0', label: labelVal, qr: pendingHostQrData, note: noteVal }],
        slotIdx: startIdx,
        src: pendingHostQrData,
        baseTitle: 'Xem trước mã QR nhận tiền',
        title: 'Xem trước mã QR nhận tiền',
        sub: 'Kiểm tra quét thử bằng camera điện thoại trước khi lưu',
        amount: '',
        note: noteVal
      });
    };
  }
  if ($('btnCloseQrZoomModal')) $('btnCloseQrZoomModal').onclick = closeQrZoomModal;
  if ($('btnCloseQrZoomBtn')) $('btnCloseQrZoomBtn').onclick = closeQrZoomModal;
  if ($('qrZoomModal')) {
    $('qrZoomModal').onclick = function (e) {
      if (e.target === $('qrZoomModal')) closeQrZoomModal();
    };
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if ($('donateConfirmModal') && !$('donateConfirmModal').hidden) {
        closeDonateConfirmModal();
      } else if ($('qrZoomModal') && !$('qrZoomModal').hidden) {
        closeQrZoomModal();
      }
    }
  });

  // Hối chốt đơn tính tiền (Member → Đại diện)
  if ($('btnUrgeFinalize')) $('btnUrgeFinalize').onclick = sendUrgeFinalizeOrder;
  if ($('btnHostFinalizeNow')) {
    $('btnHostFinalizeNow').onclick = function () {
      hideHostFinalizeBanner();
      if ($('btnSave') && !$('btnSave').disabled) {
        $('btnSave').click();
      } else if (typeof saveOrder === 'function') {
        saveOrder();
      }
    };
  }
  if ($('btnHostFinalizeLater')) $('btnHostFinalizeLater').onclick = hideHostFinalizeBanner;
  if ($('btnCloseHostFinalizeBanner')) $('btnCloseHostFinalizeBanner').onclick = hideHostFinalizeBanner;

  // Modal xác nhận thanh toán hộ (Donate)
  if ($('btnCloseDonateModal')) $('btnCloseDonateModal').onclick = closeDonateConfirmModal;
  if ($('btnCancelDonate')) $('btnCancelDonate').onclick = closeDonateConfirmModal;
  if ($('btnConfirmDonate')) $('btnConfirmDonate').onclick = confirmDonateAndOpenQr;
  if ($('donateConfirmModal')) {
    $('donateConfirmModal').onclick = function (e) {
      if (e.target === $('donateConfirmModal')) closeDonateConfirmModal();
    };
  }
  syncUrgeFinalizeCooldownFromStorage();

  // Modal Hối trả tiền (chỉ Đại diện sau khi Chốt & Lưu Sheet)
  if ($('btnOpenUrgePay')) $('btnOpenUrgePay').onclick = openUrgePayModal;
  if ($('btnModalUrgePay')) $('btnModalUrgePay').onclick = openUrgePayModal;
  if ($('btnCloseUrgePayModal')) $('btnCloseUrgePayModal').onclick = closeUrgePayModal;
  if ($('btnCancelUrgePayModal')) $('btnCancelUrgePayModal').onclick = closeUrgePayModal;
  if ($('btnConfirmUrgePaySend')) $('btnConfirmUrgePaySend').onclick = sendUrgePayOrder;
  if ($('urgePayModal')) {
    $('urgePayModal').onclick = function (e) {
      if (e.target === $('urgePayModal')) closeUrgePayModal();
    };
  }

  // Floating Payment Reminder Panel (#payReminderPanel) — Click header/nút để thu gọn / mở rộng
  function togglePayReminderCollapse() {
    var panel = $('payReminderPanel');
    if (!panel || panel.hidden) return;
    payReminderCollapsed = !payReminderCollapsed;
    panel.classList.toggle('is-collapsed', payReminderCollapsed);
    var toggleBtn = $('btnTogglePayReminder');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', payReminderCollapsed ? 'false' : 'true');
    var badge = $('payReminderBadge');
    if (badge) badge.textContent = payReminderCollapsed ? 'NHẮC THANH TOÁN (Bấm để mở QR)' : 'NHẮC THANH TOÁN RIÊNG';
  }
  if ($('btnTogglePayReminder')) {
    $('btnTogglePayReminder').onclick = function (e) {
      e.stopPropagation();
      togglePayReminderCollapse();
    };
  }
  if ($('payReminderHeader')) {
    $('payReminderHeader').onclick = function (e) {
      if (e.target && e.target.closest && e.target.closest('#btnPlayPayReminderAudio')) return;
      togglePayReminderCollapse();
    };
  }
  if ($('btnPlayPayReminderAudio')) {
    $('btnPlayPayReminderAudio').onclick = function (e) {
      e.stopPropagation();
      var vid = (activePayUrge && activePayUrge.voiceId) ? activePayUrge.voiceId : 'pay-1';
      playPayUrgeSound(vid, true);
    };
  }

  // Mobile Drawer Toggle + Body Scroll Lock + Swipe-Down to Dismiss
  var drawerSavedScrollY = 0;
  var suppressNextHandleClick = false;

  function isMobileDrawerViewport() {
    return window.innerWidth <= 960;
  }

  function lockBodyScrollForDrawer() {
    if (!isMobileDrawerViewport()) return;
    if (document.body.classList.contains('is-cart-drawer-open')) return;
    drawerSavedScrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('is-cart-drawer-open');
    document.body.classList.add('is-cart-drawer-open');
    document.body.style.top = '-' + drawerSavedScrollY + 'px';
  }

  function unlockBodyScrollForDrawer() {
    if (!document.body.classList.contains('is-cart-drawer-open')) return;
    document.documentElement.classList.remove('is-cart-drawer-open');
    document.body.classList.remove('is-cart-drawer-open');
    document.body.style.top = '';
    window.scrollTo(0, drawerSavedScrollY);
  }

  function openMobileDrawer() {
    var sec = $('cartSection');
    var bd = $('drawerBackdrop');
    if (sec) {
      sec.classList.remove('is-dragging');
      sec.style.transform = '';
      sec.classList.add('is-open');
    }
    if (bd) {
      bd.classList.remove('is-dragging');
      bd.style.opacity = '';
      bd.classList.add('is-active');
    }
    lockBodyScrollForDrawer();
  }

  function closeMobileDrawer() {
    var sec = $('cartSection');
    var bd = $('drawerBackdrop');
    if (sec) {
      sec.classList.remove('is-dragging');
      sec.classList.remove('is-open');
      if (sec.style.transform) {
        void sec.offsetWidth;
        sec.style.transform = '';
      }
    }
    if (bd) {
      bd.classList.remove('is-dragging');
      bd.classList.remove('is-active');
      bd.style.opacity = '';
    }
    unlockBodyScrollForDrawer();
  }

  (function setupMobileDrawerSwipe() {
    var sec = $('cartSection');
    var bd = $('drawerBackdrop');
    var handle = $('cartDrawerHandle');
    if (!sec) return;

    var startX = 0;
    var startY = 0;
    var startTime = 0;
    var dragDy = 0;
    var dragging = false;
    var fromHandleOrHeader = false;
    var trackingTouch = false;
    var activeMouseDrag = false;
    var touchScrollEl = null;

    function findNearestScrollable(el) {
      var cur = el;
      while (cur && cur !== sec) {
        if (cur.nodeType === 1) {
          var st = window.getComputedStyle(cur);
          var oy = st.overflowY;
          if ((oy === 'auto' || oy === 'scroll') && cur.scrollHeight > cur.clientHeight + 2) {
            return cur;
          }
        }
        cur = cur.parentNode;
      }
      return null;
    }

    function applyDragVisual(dy) {
      var clamped = Math.max(0, dy);
      dragDy = clamped;
      sec.style.transform = 'translateY(' + clamped + 'px)';
      if (bd) {
        var h = sec.offsetHeight || 480;
        var ratio = Math.max(0, 1 - clamped / h);
        bd.style.opacity = String(ratio);
      }
    }

    function finishDrag(shouldDismissCheck) {
      if (!dragging) return;
      dragging = false;
      sec.classList.remove('is-dragging');
      if (bd) bd.classList.remove('is-dragging');

      var elapsed = Math.max(16, Date.now() - startTime);
      var vy = dragDy / elapsed;
      var h = sec.offsetHeight || 480;
      var dismiss = shouldDismissCheck && (dragDy > Math.min(110, h * 0.25) || (dragDy > 32 && vy > 0.45));

      if (dismiss) {
        suppressNextHandleClick = true;
        setTimeout(function () { suppressNextHandleClick = false; }, 180);
        closeMobileDrawer();
      } else {
        sec.style.transform = '';
        if (bd) bd.style.opacity = '';
      }
      dragDy = 0;
    }

    // Prevent background scroll behind backdrop
    if (bd) {
      bd.addEventListener('touchmove', function (e) {
        if (isMobileDrawerViewport() && sec.classList.contains('is-open')) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    sec.addEventListener('touchstart', function (e) {
      if (!isMobileDrawerViewport() || !sec.classList.contains('is-open')) return;
      if (!e.touches || e.touches.length !== 1) return;
      var target = e.target;
      var tag = target && target.tagName ? target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'OPTION') return;

      var t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startTime = Date.now();
      dragDy = 0;
      dragging = false;
      trackingTouch = true;

      var onHandle = !!(handle && target && handle.contains(target));
      var headerEl = sec.querySelector('.cart-header');
      var onHeader = !!(headerEl && target && headerEl.contains(target) && !(target.closest && target.closest('button, a, input')));
      fromHandleOrHeader = onHandle || onHeader;
      touchScrollEl = fromHandleOrHeader ? null : findNearestScrollable(target);
    }, { passive: true });

    sec.addEventListener('touchmove', function (e) {
      if (!trackingTouch || !isMobileDrawerViewport() || !sec.classList.contains('is-open')) return;
      if (!e.touches || e.touches.length !== 1) return;
      var t = e.touches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;

      if (!dragging) {
        if (dy <= 6 || Math.abs(dy) <= Math.abs(dx) * 1.1) {
          if (dy < -8 || Math.abs(dx) > 16) trackingTouch = false;
          return;
        }
        var secAtTop = (sec.scrollTop <= 1);
        var childAtTop = (!touchScrollEl || touchScrollEl.scrollTop <= 1);
        if (!fromHandleOrHeader && (!secAtTop || !childAtTop)) {
          return;
        }
        dragging = true;
        sec.classList.add('is-dragging');
        if (bd) bd.classList.add('is-dragging');
      }

      if (dragging) {
        if (e.cancelable) e.preventDefault();
        applyDragVisual(dy);
      }
    }, { passive: false });

    sec.addEventListener('touchend', function () {
      if (!trackingTouch && !dragging) return;
      trackingTouch = false;
      finishDrag(true);
    }, { passive: true });

    sec.addEventListener('touchcancel', function () {
      trackingTouch = false;
      finishDrag(false);
    }, { passive: true });

    // Mouse drag support on handle & header (desktop DevTools mobile mode / touchscreens)
    function onMouseDownDrag(e) {
      if (e.button !== 0 || !isMobileDrawerViewport() || !sec.classList.contains('is-open')) return;
      if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea')) return;
      activeMouseDrag = true;
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
      dragDy = 0;
      dragging = false;
    }
    if (handle) handle.addEventListener('mousedown', onMouseDownDrag);
    var headerElForMouse = sec.querySelector('.cart-header');
    if (headerElForMouse) headerElForMouse.addEventListener('mousedown', onMouseDownDrag);

    window.addEventListener('mousemove', function (e) {
      if (!activeMouseDrag) return;
      var dy = e.clientY - startY;
      if (!dragging && dy > 6) {
        dragging = true;
        sec.classList.add('is-dragging');
        if (bd) bd.classList.add('is-dragging');
      }
      if (dragging) {
        applyDragVisual(dy);
      }
    });

    window.addEventListener('mouseup', function () {
      if (!activeMouseDrag) return;
      activeMouseDrag = false;
      finishDrag(true);
    });

    window.addEventListener('resize', function () {
      if (!isMobileDrawerViewport() && document.body.classList.contains('is-cart-drawer-open')) {
        closeMobileDrawer();
      }
    });
  })();

  if ($('mobileCartToggle')) $('mobileCartToggle').onclick = openMobileDrawer;
  if ($('mobileOpenCartBtn')) $('mobileOpenCartBtn').onclick = openMobileDrawer;
  if ($('cartDrawerHandle')) {
    $('cartDrawerHandle').onclick = function () {
      if (suppressNextHandleClick) return;
      closeMobileDrawer();
    };
  }
  if ($('drawerBackdrop')) $('drawerBackdrop').onclick = closeMobileDrawer;

  /* ================= 12. KHỞI TẠO HỆ THỐNG ================= */
  var initialStoreId = urlStoreId;
  if (!initialStoreId) {
    try { initialStoreId = localStorage.getItem('office_order_active_store_id') || 'uu-milktea'; } catch (e) {}
  }
  switchStore(initialStoreId, false);
  setupStoreModal();
  setupProfileModal();
  updateMyProfileUI();
  initFields();
  tryRestoreMyHostQr(false);

  if (urlBillCode) {
    isInitialSyncing = true; // Chờ sync từ server/peer, không đè cart rỗng
    setTimeout(function () { isInitialSyncing = false; }, 2500);
  }
  renderCart();
  fetchMenuFromSheet();
  syncStoresFromSheet(true);
  fetchBillServerStateFromSheet();
  syncUrgeCooldownFromStorage();
  syncPayUrgeCooldownFromStorage();
  updateNotificationButtonUI();
  setupLive();

  // PWA Service Worker & Install Prompt
  (function setupPwa() {
    var deferredPwaPrompt = null;
    var installBtn = $('btnMenuInstallPwa');
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPwaPrompt = e;
      if (installBtn) installBtn.hidden = false;
    });
    window.addEventListener('appinstalled', function () {
      deferredPwaPrompt = null;
      if (installBtn) installBtn.hidden = true;
      showToast('✓ Đã cài đặt Office Order thành công!');
    });
    if (installBtn) {
      installBtn.onclick = function () {
        if ($('moreDropdown')) $('moreDropdown').hidden = true;
        if (!deferredPwaPrompt) {
          showToast('Hãy dùng menu trình duyệt → "Thêm vào Màn hình chính"!');
          return;
        }
        deferredPwaPrompt.prompt();
        deferredPwaPrompt.userChoice.then(function () {
          deferredPwaPrompt = null;
          installBtn.hidden = true;
        }).catch(function () {});
      };
    }
    var canRegisterSw = ('serviceWorker' in navigator) &&
      (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    if (canRegisterSw) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {});
      });
    }
  })();

})();
