# Ú Ụ Milk Tea — website + POS

Repo gồm 4 phần tách biệt:

| Phần | File | Dùng ở đâu |
|---|---|---|
| Web công khai | `index.html`, `assets/` | Cloudflare Pages |
| POS web nội bộ (bill chung live) | `pos-live/` | Pages (site riêng) + Worker relay |
| POS chạy trong Google Sheet | `POS.html`, `pos-apps-script.gs` | Apps Script, không deploy |
| Relay WebSocket cloud | `pos-live-worker/` | Cloudflare Workers + Durable Objects |

## 1. Web công khai
Deploy bằng cách build sạch rồi kéo thư mục lên Cloudflare Pages
(xem `AGENTS.md` cho lệnh build và quy tắc loại file nội bộ).

## 2. POS live (văn phòng)
`pos-live/` là bản web của POS, realtime **client-side**:

- Cùng trình duyệt, nhiều tab: BroadcastChannel, không cần server.
- Nhiều máy: đi qua WebSocket relay `pos-live-worker/`.

### Deploy
1. `cd pos-live-worker && npx wrangler login && npx wrangler deploy`
   → ra link `https://<worker>.workers.dev`.
2. Dán link đó (đổi `https://` thành `wss://`) vào hằng `FORCE_WS`
   trong `pos-live/live.js`.
3. Build lại `dist-live/` (AGENTS.md) rồi kéo lên Pages.

### Dùng
1. Mở site POS, bấm **Copy link bill**, gửi `?bill=MÃ` cho nhau.
2. Thêm/xoá món, size, topping, đường, đá, ghi chú — máy khác thấy ngay,
   gộp theo từng dòng nên không đè nhau.
3. **Lưu vào Sheet** mới gọi Apps Script (`/exec` dán ở ⚙ Cài đặt) ghi
   `DONHANG` / `CHITIET`.

### Chạy local (không cần cloud)
```bash
cd pos-live && npm i ws && node server.js
```
Mở 2 tab `index.html?bill=TEST` để thử; đa máy thì dán `ws://IP:8787`
ở ⚙ Cài đặt (để trống = tự đoán).

## 3. POS trong Google Sheet
Xem `HUONG-DAN-POS-SHEET.md`. Dán `pos-apps-script.gs` vào `Code.gs`,
tạo file HTML tên `POS` với nội dung `POS.html`, load lại Sheet là có
menu **🧋 POS Ú Ụ**. Không cần Deploy web app.

Sheet tạo ra: `MENU` (sửa giá tại đây), `DONHANG`, `CHITIET`, `STATE`.

## 4. Gửi cho người khác dùng
Chỉ cần 3 file trong `README-SHARE.md` (`pos-apps-script.gs`, `POS.html`,
`README-SHARE.md`) — bản Sheet độc lập, không dùng web.

## Ghi chú nghiệp vụ
- Thanh toán chỉ ghi note (Tiền mặt / Chuyển khoản / ShopeeFood).
- Bill xuất PDF (khổ A5), gửi Zalo cho khách.
- Sửa giá trong sheet `MENU`, POS tự cập nhật khi tải lại.