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
    bankInfo: { bank: '', account: '', owner: '' },
    categories: [
      {
        id: 'monchinh',
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
        nhom: 'monchinh',
        giaM: 25000,
        giaL: 30000,
        giaXL: 35000,
        img: 'assets/img/vua-tron/mi-quang.webp',
        note: 'Đồng giá 25k (tùy chọn 30k · 35k)'
      },
      {
        id: 'vt02',
        ten: 'Bún nước tương',
        nhom: 'monchinh',
        giaM: 25000,
        giaL: 30000,
        giaXL: 35000,
        img: 'assets/img/vua-tron/bun-nuoc-tuong.webp',
        note: 'Đồng giá 25k (tùy chọn 30k · 35k)'
      },
      {
        id: 'vt03',
        ten: 'Bún mắm nêm',
        nhom: 'monchinh',
        giaM: 25000,
        giaL: 30000,
        giaXL: 35000,
        img: 'assets/img/vua-tron/bun-mam-nem.webp',
        note: 'Đồng giá 25k (tùy chọn 30k · 35k)'
      },
      {
        id: 'vt04',
        ten: 'Bánh ướt',
        nhom: 'monchinh',
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
  function getCustomStores() {
    try {
      var raw = localStorage.getItem('office_order_custom_stores');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveCustomStores(list) {
    try {
      localStorage.setItem('office_order_custom_stores', JSON.stringify(list));
    } catch (e) {}
  }

  /* Đồng bộ danh sách quán từ Google Sheet */
  function syncStoresFromSheet(isSilent) {
    var apiUrl = DEFAULT_API;
    if (!apiUrl) return;
    var fetchUrl = apiUrl + (apiUrl.indexOf('?') === -1 ? '?' : '&') + 'action=stores&t=' + Date.now();
    fetch(fetchUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.ok && Array.isArray(data.stores) && data.stores.length) {
          var customs = getCustomStores();
          data.stores.forEach(function (sheetStore) {
            var bIdx = -1;
            for (var i = 0; i < BUILTIN_STORES.length; i++) {
              if (BUILTIN_STORES[i].id === sheetStore.id) { bIdx = i; break; }
            }
            if (bIdx !== -1) {
              var oldItems = BUILTIN_STORES[bIdx].items || [];
              var oldToppings = BUILTIN_STORES[bIdx].toppings || [];
              Object.assign(BUILTIN_STORES[bIdx], sheetStore);
              if ((!sheetStore.items || !sheetStore.items.length) && oldItems.length) {
                BUILTIN_STORES[bIdx].items = oldItems;
              }
              if ((!sheetStore.toppings || !sheetStore.toppings.length) && oldToppings.length) {
                BUILTIN_STORES[bIdx].toppings = oldToppings;
              }
            } else {
              var cIdx = -1;
              for (var j = 0; j < customs.length; j++) {
                if (customs[j].id === sheetStore.id) { cIdx = j; break; }
              }
              if (cIdx !== -1) {
                var oldCItems = customs[cIdx].items || [];
                var oldCToppings = customs[cIdx].toppings || [];
                Object.assign(customs[cIdx], sheetStore);
                if ((!sheetStore.items || !sheetStore.items.length) && oldCItems.length) {
                  customs[cIdx].items = oldCItems;
                }
                if ((!sheetStore.toppings || !sheetStore.toppings.length) && oldCToppings.length) {
                  customs[cIdx].toppings = oldCToppings;
                }
              } else {
                customs.push(sheetStore);
              }
            }
          });
          saveCustomStores(customs);
          renderStoreListGrid();

          // Nếu URL có chỉ định store và hiện tại chưa chuyển đúng
          if (urlStoreId && (!currentStore || currentStore.id !== urlStoreId)) {
            var target = getStoreById(urlStoreId);
            if (target && target.id === urlStoreId) {
              switchStore(target, false);
            }
          } else if (currentStore && (!MENU || !MENU.length)) {
            switchStore(currentStore.id, false);
          }

          if (!isSilent) showToast('✓ Đã đồng bộ ' + data.stores.length + ' quán từ Google Sheet!');
        }
      })
      .catch(function (err) {
        if (!isSilent) showToast('Không thể kết nối Google Sheet: ' + (err.message || 'Lỗi mạng'));
      });
  }

  /* Đẩy quán mới / cập nhật lên Google Sheet */
  function pushStoreToSheet(storeObj) {
    var apiUrl = DEFAULT_API;
    if (!apiUrl || !storeObj) return;
    try {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'save_store', store: storeObj })
      }).catch(function () {});
    } catch (e) {}
  }

  function getAllStores() {
    var customs = getCustomStores();
    return BUILTIN_STORES.concat(customs);
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

    currentStore = store;
    try {
      localStorage.setItem('office_order_active_store_id', currentStore.id);
    } catch (e) {}

    var allItems = (currentStore.items || []).concat(currentStore.toppings || []);
    // Nếu là quán Ú Ụ mà items bị rỗng thì lấy fallback gốc
    if (!allItems.length && currentStore.id === 'uu-milktea') {
      allItems = STORE_UU_ITEMS_DEFAULT.concat(STORE_UU_TOPPINGS_DEFAULT);
      currentStore.items = STORE_UU_ITEMS_DEFAULT.slice();
      currentStore.toppings = STORE_UU_TOPPINGS_DEFAULT.slice();
    }
    MENU = allItems.slice();

    if (currentStore.categories && currentStore.categories.length) {
      currentCat = currentStore.categories[0].id;
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
        sbEmoji.textContent = currentStore.icon || '🍱';
      }
    }
    if (sbName) sbName.textContent = currentStore.name;
    if (sbTagline) sbTagline.textContent = currentStore.tagline || (currentStore.category === 'comtrua' ? 'Cơm văn phòng' : 'Ăn uống thả ga');

    var bpEmoji = $('bannerStoreEmoji');
    var bpName = $('bannerStoreName');
    if (bpEmoji) bpEmoji.textContent = currentStore.icon || '🏪';
    if (bpName) bpName.textContent = currentStore.name;

    document.title = currentStore.name + ' · Office Order';
  }

  function renderCategoryTabs() {
    var nav = $('tabs');
    if (!nav || !currentStore) return;
    nav.innerHTML = '';

    var cats = currentStore.categories || [];
    cats.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'tab';
      btn.className = 'v-tab' + (cat.id === currentCat ? ' is-active' : '');
      btn.dataset.cat = cat.id;

      var iconHtml = '<span class="v-tab-emoji">' + (cat.icon || '✨') + '</span>';
      btn.innerHTML =
        '<span class="v-tab-icon">' + iconHtml + '</span>' +
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
    'vt04': 'assets/img/vua-tron/banh-uot.webp'
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
    return {
      lines: cart,
      tomb: cartDel,
      fields: F,
      by: clientId,
      dev: deviceName(),
      ucolor: myUcolor,
      storeId: currentStore ? currentStore.id : '',
      storeData: currentStore
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
      if (currentCat !== 'all' && m.nhom !== currentCat) return false;
      if (q && m.ten.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });

    var catObj = (currentStore.categories || []).find(function (c) { return c.id === currentCat; });
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

      var itemImg = isTopping ? (TOPPING_IMGS[m.id] || m.img) : (PRODUCT_IMGS[m.id] || m.img);
      var imgHtml = '';
      if (itemImg) {
        imgHtml =
          '<div class="pcard-img-wrap">' +
            '<img src="' + itemImg + '" alt="' + esc(m.ten) + '" loading="lazy" onerror="this.onerror=null;this.parentElement.className=\'pcard-img-wrap pcard-emoji-wrap\';this.parentElement.innerHTML=\'<span class=\\\'pcard-emoji\\\'>' + (currentStore.icon || '🍱') + '</span>\';">' +
          '</div>';
      } else {
        var itemEmoji = m.emoji || (catObj && catObj.icon) || currentStore.icon || '🍱';
        imgHtml =
          '<div class="pcard-img-wrap pcard-emoji-wrap">' +
            '<span class="pcard-emoji">' + itemEmoji + '</span>' +
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
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'pill-btn' + (curSelectedSize === so.id ? ' is-active' : '');
          btn.dataset.size = so.id;
          btn.textContent = so.label + ' · ' + fmtK(so.price);
          btn.onclick = function () {
            curSelectedSize = so.id;
            sizeGrp.querySelectorAll('.pill-btn').forEach(function (x) { x.classList.remove('is-active'); });
            btn.classList.add('is-active');
            updateCustomizerPrice();
          };
          sizeGrp.appendChild(btn);
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
      var storeTops = (currentStore && currentStore.toppings) || [];
      secTopping.style.display = (!hideOptions && opts.hasToppings && storeTops.length > 0) ? 'block' : 'none';
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

      var topImg = TOPPING_IMGS[tp.id] || tp.img || '';
      var thumbHtml = topImg ?
        ('<img class="top-chip-thumb" src="' + topImg + '" alt="' + esc(tp.ten) + '" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\';this.parentElement.insertAdjacentHTML(\'afterbegin\', \'<span class=\\\'top-chip-thumb\\\' style=\\\'display:flex;align-items:center;justify-content:center;font-size:20px;background:#F1F5F9;\\\'>✨</span>\');">') :
        ('<span class="top-chip-thumb" style="display:flex;align-items:center;justify-content:center;font-size:20px;background:#F1F5F9;">✨</span>');

      var div = document.createElement('div');
      div.className = 'top-chip' + (found ? ' is-selected' : '');
      div.innerHTML =
        thumbHtml +
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
      var szStr = formatSizeLabel(c.size);
      desc.title = c.name + (szStr ? ' (' + szStr + ')' : '') + (shortOpt ? ' · ' + shortOpt : '');
      desc.innerHTML =
        '<strong class="c-name">' + esc(c.name) + '</strong>' +
        (szStr ? '<span class="c-sz">(' + esc(szStr) + ')</span>' : '') +
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
    var unitStr = (currentStore && currentStore.itemUnit) || 'món';
    if ($('cupCountBadge')) $('cupCountBadge').textContent = t.totalCups + ' ' + unitStr;

    // Cập nhật thanh Mobile bar
    if ($('mobileCartTotal')) $('mobileCartTotal').textContent = fmt(t.grand);
    if ($('mobileCartCount')) $('mobileCartCount').textContent = t.totalCups + ' ' + unitStr;

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
    var canvasTitle = (currentStore.icon ? currentStore.icon + ' ' : '') + currentStore.name.toUpperCase() + ' · ĐƠN ĐẶT CHUNG';
    ctx.fillText(canvasTitle, pad, curY);

    curY += 20;
    ctx.fillStyle = '#64748B';
    ctx.font = '600 12px ' + window.getComputedStyle(document.body).fontFamily;
    var nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
    ctx.fillText('Mã: ' + orderCode + ' · ' + nowStr, pad, curY);

    curY += 19;
    ctx.fillStyle = '#1E293B';
    ctx.font = '700 12px ' + window.getComputedStyle(document.body).fontFamily;
    var cUnit = (currentStore && currentStore.itemUnit) || 'món';
    ctx.fillText('Đại diện: ' + hostName + ' · Tổng: ' + t.totalCups + ' ' + cUnit, pad, curY);

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
      var szStr = formatSizeLabel(c.size);
      var itemName = c.name + (szStr ? ' (' + szStr + ')' : '');
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

      var cUnit = (currentStore && currentStore.itemUnit) || 'món';
      ctx.fillStyle = '#1E293B';
      ctx.font = '700 12px ' + window.getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'left';
      var personLineLabel = '● ' + p.name + ' (' + p.cups + ' ' + cUnit + '): ' + fmt(p.drinkSub);
      ctx.fillText(personLineLabel, pad, curY);

      var adjStr = '';
      if (share > 0) adjStr = ' (+ship ' + fmt(share) + ')';
      else if (share < 0) adjStr = ' (-giảm ' + fmt(Math.abs(share)) + ')';

      if (adjStr) {
        var preW = ctx.measureText(personLineLabel).width;
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
    var postTxt = ' theo bill trên · Chúc bạn ngon miệng! ' + (currentStore.icon || '✨');
    if (currentStore.bankInfo && currentStore.bankInfo.account) {
      postTxt = ' (STK ' + currentStore.bankInfo.bank + ' ' + currentStore.bankInfo.account + ') · Chúc bạn ngon miệng! ' + (currentStore.icon || '✨');
    }

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

  /* ================= 10.5. STORE MODAL & MANAGEMENT ================= */
  var parsedStoreItems = [];
  var parsedStoreToppings = [];
  var parsedStoreCategories = [];

  function setupStoreModal() {
    var modal = $('storeModal');
    if (!modal) return;

    // Open store modal triggers
    var openBtns = ['btnOpenStoreSidebar', 'btnOpenStoreBanner', 'btnOpenStoreAction', 'btnMenuStores'];
    openBtns.forEach(function (bid) {
      if ($(bid)) {
        $(bid).onclick = function () {
          if ($('moreDropdown')) $('moreDropdown').hidden = true;
          openStoreListView();
          modal.hidden = false;
        };
      }
    });

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
    if ($('storeModalTitle')) $('storeModalTitle').textContent = '🏪 Quán Yêu Thích & Menu Đặt Món';
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

      var activeBadgeHtml = isActive ? '<span class="store-active-badge">✓ ĐANG CHỌN</span>' : '';

      var actionBtnsHtml = '';
      if (!isActive) {
        actionBtnsHtml += '<button class="btn-select-store" type="button">👉 Mở đơn quán này</button>';
      } else {
        actionBtnsHtml += '<span style="font-size:12px; font-weight:700; color:#0A7259; padding: 7px 0;">Đang mở quán này</span>';
      }

      if (!st.isBuiltin) {
        actionBtnsHtml += '<button class="btn-store-subaction btn-edit-store" type="button" title="Chỉnh sửa quán">✏️ Sửa</button>';
        actionBtnsHtml += '<button class="btn-store-subaction danger btn-del-store" type="button" title="Xóa quán">🗑️</button>';
      }

      card.innerHTML =
        '<div class="store-card-head">' +
          '<div class="store-card-emoji">' + (st.icon || '🏪') + '</div>' +
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
            initFields();
            switchStore(st.id, false);
            setupLive();
            renderCart();
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
        btnDel.onclick = function () {
          if (!confirm('Bạn có chắc muốn xóa quán "' + st.name + '" khỏi danh sách yêu thích?')) return;
          var customs = getCustomStores().filter(function (x) { return x.id !== st.id; });
          saveCustomStores(customs);
          if (currentStore.id === st.id) {
            switchStore('uu-milktea', true);
          }
          renderStoreListGrid();
          showToast('Đã xóa quán ' + st.name);
        };
      }

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
      $('storeModalTitle').textContent = storeToEdit ? '✏️ Chỉnh Sửa Quán Yêu Thích' : '➕ Tạo Quán Yêu Thích Mới';
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

      var bInfo = storeToEdit.bankInfo || {};
      $('storeBankName').value = bInfo.bank || '';
      $('storeBankAccount').value = bInfo.account || '';
      $('storeBankOwner').value = bInfo.owner || '';

      parsedStoreItems = (storeToEdit.items || []).slice();
      parsedStoreToppings = (storeToEdit.toppings || []).slice();

      (storeToEdit.categories || []).forEach(function (c) {
        if (c.id !== 'topping' && parsedStoreCategories.indexOf(c.name || c.id) === -1) {
          parsedStoreCategories.push(c.name || c.id);
        }
      });
      parsedStoreItems.forEach(function (it) {
        if (it.nhom && it.nhom !== 'topping' && parsedStoreCategories.indexOf(it.nhom) === -1) {
          parsedStoreCategories.push(it.nhom);
        }
      });
    } else {
      $('editStoreId').value = '';
      $('storeInputName').value = '';
      $('storeInputCategory').value = 'anvat';
      $('storeInputTagline').value = '';
      $('storeInputEmoji').value = '🫓';
      if ($('storeCustomEmojiInput')) $('storeCustomEmojiInput').value = '🫓';
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
          '<div style="font-size:32px; margin-bottom:8px;">📂</div>' +
          '<p style="font-weight:700; color:#334155; margin:0 0 4px; font-size:14px;">Chưa có phân loại món nào</p>' +
          '<p style="font-size:12.5px; color:#64748B; margin:0 0 12px; line-height:1.5;">' +
            'Bạn có thể nhập tên phân loại ở trên (Ví dụ: <b>Bánh tráng</b>, <b>Nước giải khát</b>) rồi bấm <b>+ Thêm phân loại</b>,<br>' +
            'hoặc bấm nút <b>⚡ Nhập nhanh từ văn bản</b> ở góc trên để dán menu từ Zalo.' +
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
          '<span class="cat-card-icon">📂</span>' +
          '<span class="cat-card-title">' + esc(catName) + '</span>' +
          '<span class="cat-card-badge">' + catItems.length + ' món</span>' +
        '</div>' +
        '<div class="cat-card-actions">' +
          '<button type="button" class="btn-del-cat" title="Xóa phân loại và tất cả món trong nhóm này">✕ Xóa nhóm</button>' +
        '</div>';

      cardHeader.querySelector('.btn-del-cat').onclick = function () {
        if (!confirm('Bạn có chắc muốn xóa phân loại "' + catName + '" và toàn bộ ' + catItems.length + ' món trong nhóm này?')) return;
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

          row.innerHTML =
            '<span class="cat-item-name">' + esc(it.ten) + '</span>' +
            '<span class="cat-item-price">' + pStr + '</span>' +
            '<button type="button" class="btn-del-item" title="Xóa món này">✕</button>';

          row.querySelector('.btn-del-item').onclick = function () {
            var iIdx = parsedStoreItems.indexOf(it);
            if (iIdx !== -1) {
              parsedStoreItems.splice(iIdx, 1);
              renderStoreMenuBuilder();
            }
          };
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
        '<button type="button" class="btn btn-sm btn-ghost-primary btn-add-item-to-cat">+ Thêm món</button>';

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
        '<span class="cat-item-name">✨ ' + esc(tp.ten) + '</span>' +
        '<span class="cat-item-price">+' + fmt(tp.gia) + '</span>' +
        '<button type="button" class="btn-del-item" title="Xóa topping này">✕</button>';
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

    var unitStr = (storeCat === 'comtrua' ? 'phần' : (storeCat === 'trasua' ? 'ly' : 'món'));

    var storeObj = {
      id: storeId,
      name: name,
      tagline: storeTagline,
      icon: storeEmoji,
      category: storeCat,
      itemUnit: unitStr,
      isBuiltin: false,
      options: {
        hasSize: $('chkOptSize') ? $('chkOptSize').checked : false,
        hasSugar: $('chkOptSugar') ? $('chkOptSugar').checked : false,
        hasIce: $('chkOptIce') ? $('chkOptIce').checked : false,
        hasToppings: $('chkOptTopping') ? $('chkOptTopping').checked : true
      },
      bankInfo: {
        bank: ($('storeBankName') ? $('storeBankName').value.trim() : ''),
        account: ($('storeBankAccount') ? $('storeBankAccount').value.trim() : ''),
        owner: ($('storeBankOwner') ? $('storeBankOwner').value.trim() : '')
      },
      categories: cats,
      items: parsedStoreItems,
      toppings: parsedStoreToppings
    };

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

    if (cart.length > 0) {
      if (confirm('Đã lưu quán! Bạn có muốn mở ngay quán này để đặt đơn không?\n(Hệ thống sẽ tạo Bill mới cho quán này để không làm mất giỏ hàng đang đặt của nhóm)')) {
        orderCode = newOrderCode();
        cart = [];
        cartDel = {};
        F = {};
        initFields();
        switchStore(storeObj, false);
        setupLive();
        renderCart();
      }
    } else {
      switchStore(storeObj, true);
    }

    $('storeModal').hidden = true;
    showToast('✓ Đã lưu quán: ' + name);
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
    updateUrlParams();
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
        showToast(isFood ? ('Đã thêm 1 phần cho ' + drinkerName) : ('Đã thêm 1 ly cho ' + drinkerName));
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
  var initialStoreId = urlStoreId;
  if (!initialStoreId) {
    try { initialStoreId = localStorage.getItem('office_order_active_store_id') || 'uu-milktea'; } catch (e) {}
  }
  switchStore(initialStoreId, false);
  setupStoreModal();
  setupProfileModal();
  updateMyProfileUI();
  initFields();

  if (urlBillCode) {
    isInitialSyncing = true; // Chờ sync từ server/peer, không đè cart rỗng
    setTimeout(function () { isInitialSyncing = false; }, 2500);
  }
  renderCart();
  fetchMenuFromSheet();
  syncStoresFromSheet(true);
  setupLive();

})();
