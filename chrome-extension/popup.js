/* Office Order Extension — Popup Dashboard */
const $ = (id) => document.getElementById(id);

function fmtVnd(n) {
  const v = Math.round(Number(n) || 0);
  return v > 0 ? (v.toLocaleString('vi-VN') + 'đ') : '0đ';
}

function fmtTime(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function renderState(data) {
  if (!data || !data.ok) return;
  const user = data.user || {};
  const settings = data.settings || { audioEnabled: true, mutedUntil: 0 };
  const bills = Array.isArray(data.bills) ? data.bills : [];
  const wsStatus = data.wsStatus || {};

  $('userLabel').textContent = user.uname
    ? ('Xin chào, ' + user.uname)
    : 'Mở 1 link bill để tự đồng bộ tên';

  $('chkAudio').checked = settings.audioEnabled !== false;

  const muted = !!(settings.mutedUntil && Number(settings.mutedUntil) > Date.now());
  const livePill = $('livePill');
  const muteStatus = $('muteStatus');
  if (muted) {
    livePill.textContent = '🔕 Im lặng';
    livePill.classList.add('is-muted');
    muteStatus.textContent = 'Đang im lặng đến ' + fmtTime(settings.mutedUntil);
    muteStatus.classList.add('is-muted');
    $('btnUnmute').hidden = false;
  } else {
    const connectedCnt = Object.values(wsStatus).filter(Boolean).length;
    livePill.textContent = connectedCnt > 0 ? ('● Live (' + connectedCnt + ')') : '● Sẵn sàng';
    livePill.classList.remove('is-muted');
    muteStatus.textContent = 'Thông báo & loa nền đang BẬT';
    muteStatus.classList.remove('is-muted');
    $('btnUnmute').hidden = true;
  }

  $('billCount').textContent = String(bills.length);
  const list = $('billsList');
  list.innerHTML = '';

  if (!bills.length) {
    list.innerHTML =
      '<div class="bill-empty">' +
        'Chưa có bill nào đang theo dõi.<br>' +
        'Chỉ cần mở bất kỳ link bill nào trên <b>office-order.pages.dev</b>, Extension sẽ tự nhận &amp; lắng nghe ngầm cho bạn!' +
      '</div>';
    return;
  }

  bills.forEach((b) => {
    const card = document.createElement('div');
    card.className = 'bill-card';
    const isOnline = !!wsStatus[b.bill];
    const statusTxt = b.submitted ? 'Đã chốt đơn' : 'Đang đặt món';
    const unpaidHtml = b.myUnpaid > 0
      ? (' · <span class="bill-unpaid">Còn trả ' + fmtVnd(b.myUnpaid) + '</span>')
      : '';

    card.innerHTML =
      '<div class="bill-info">' +
        '<div class="bill-top">' +
          '<span class="bill-ws-dot ' + (isOnline ? '' : 'off') + '" title="' + (isOnline ? 'Đang kết nối nền' : 'Đang nối lại...') + '"></span>' +
          '<span class="bill-store"></span>' +
          '<span class="bill-code">#' + b.bill + '</span>' +
        '</div>' +
        '<div class="bill-meta">' +
          '<span>' + statusTxt + '</span>' +
          (b.hostName ? ('<span>· ĐD: ' + b.hostName + '</span>') : '') +
          unpaidHtml +
        '</div>' +
      '</div>' +
      '<button type="button" class="btn-rm-bill" title="Ngừng theo dõi bill này">×</button>';

    card.querySelector('.bill-store').textContent = b.storeName || 'Office Order';

    card.onclick = (e) => {
      if (e.target.closest('.btn-rm-bill')) return;
      chrome.runtime.sendMessage({ type: 'OPEN_BILL', bill: b.bill }, () => window.close());
    };
    card.querySelector('.btn-rm-bill').onclick = (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'REMOVE_BILL', bill: b.bill }, () => refresh());
    };
    list.appendChild(card);
  });
}

function refresh() {
  chrome.runtime.sendMessage({ type: 'GET_POPUP_STATE' }, (res) => {
    if (chrome.runtime.lastError) return;
    renderState(res);
  });
}

$('chkAudio').onchange = () => {
  chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    settings: { audioEnabled: $('chkAudio').checked }
  }, () => refresh());
};

$('btnMute1h').onclick = () => {
  chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    settings: { mutedUntil: Date.now() + 60 * 60 * 1000 }
  }, () => refresh());
};

$('btnMuteDay').onclick = () => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    settings: { mutedUntil: end.getTime() }
  }, () => refresh());
};

$('btnUnmute').onclick = () => {
  chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    settings: { mutedUntil: 0 }
  }, () => refresh());
};

$('btnOpenWeb').onclick = () => {
  chrome.runtime.sendMessage({ type: 'OPEN_BILL', bill: '' }, () => window.close());
};

$('btnTestAlert').onclick = () => {
  chrome.runtime.sendMessage({ type: 'TEST_ALERT' });
};

refresh();
