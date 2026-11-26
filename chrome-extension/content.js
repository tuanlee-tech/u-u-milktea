/* Office Order Extension — Content Script (tự động đồng bộ UID, tên & mã bill đang mở) */
(function () {
  'use strict';

  // Đánh dấu Extension đang hoạt động để web tự chống trùng Web Push
  try {
    document.documentElement.dataset.uuExtActive = '1';
    window.dispatchEvent(new CustomEvent('uu-ext-ready'));
  } catch (e) {}

  let lastSentKey = '';

  function readCurrentSession() {
    let uid = '';
    let uname = '';
    try {
      uid = localStorage.getItem('uu_pos_uid') || '';
      uname = localStorage.getItem('uu_pos_uname') || '';
    } catch (e) {}

    let bill = '';
    try {
      const sp = new URLSearchParams(location.search);
      bill = (sp.get('bill') || '').trim();
    } catch (e) {}
    if (!bill) {
      const codeEl = document.getElementById('orderCode');
      if (codeEl && codeEl.textContent) {
        bill = codeEl.textContent.trim();
      }
    }
    return { bill, uid, uname, url: location.href };
  }

  function syncToBackground(force) {
    const s = readCurrentSession();
    if (!s.bill && !s.uid) return;
    const key = [s.bill, s.uid, s.uname].join('|');
    if (!force && key === lastSentKey) return;
    lastSentKey = key;
    try {
      chrome.runtime.sendMessage({
        type: 'SYNC_BILL_SESSION',
        bill: s.bill,
        uid: s.uid,
        uname: s.uname,
        url: s.url
      }, function () {
        void chrome.runtime.lastError;
      });
    } catch (e) {}
  }

  syncToBackground(true);
  setTimeout(function () { syncToBackground(false); }, 1500);
  setInterval(function () { syncToBackground(false); }, 5000);
  window.addEventListener('popstate', function () { syncToBackground(true); });
  window.addEventListener('storage', function () { syncToBackground(false); });
})();
