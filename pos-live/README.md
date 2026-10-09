# POS Live — bản web riêng cho văn phòng (realtime client-side)

Không realtime với Sheet. Sheet chỉ chạm 2 lúc: tải menu khi mở trang,
và bấm **Lưu vào Sheet** (submit).

## Chạy
- 1 máy / nhiều tab: mở `index.html` (host static hoặc mở file trực tiếp).
  Các tab cùng trình duyệt tự thấy nhau qua BroadcastChannel.
- Nhiều máy: trên 1 máy chạy `npm i ws && node server.js`,
  các máy khác vào ⚙ Cài đặt điền `ws://IP-may-chay-server:8787`.

## Dùng chung 1 bill
Bấm **Copy link bill**, gửi link `?bill=MÃ` cho nhau. Sửa đâu hiện đó,
gộp theo từng dòng nên không đè nhau.

## Nút Lưu
**Lưu vào Sheet** mới gọi Apps Script (link `/exec` dán ở ⚙ Cài đặt),
ghi vào `DONHANG` / `CHITIET` như bản POS thường.
