# POS Ú Ụ Milk Tea — mở ngay trong Google Sheet

## Cách mới (khuyên dùng): POS nằm trong Sheet, không cần Deploy
1. Mở Sheet quán → **Extensions → Apps Script**.
2. Dán toàn bộ `pos-apps-script.gs` vào file `Code.gs` → Save → Run `ensure_` 1 lần để cấp quyền.
3. Trong Apps Script bấm **+ → HTML** → đặt tên đúng `POS` → xóa trắng → dán toàn bộ file `POS.html` trong repo này vào → Save.
4. Quay lại Sheet, load lại trang → menu **🧋 POS Ú Ụ → Mở POS bán hàng** (sidebar) hoặc **Mở POS cửa sổ lớn**.
5. Bấm bill → **Lưu vào Sheet** ghi thẳng vào `DONHANG/CHITIET` → **Xuất PDF** (Ctrl+P → Save as PDF).

## Cách cũ: `pos.html` rời (vẫn giữ)

POS gồm: `pos.html` (màn bấm bill) + Google Sheet (lưu đơn + sửa giá).

## 1. Tạo Google Sheet
1. Vào sheets.google.com → Blank spreadsheet → đặt tên `POS UU Milk Tea`.
2. Để nguyên trống, Apps Script sẽ tự tạo 3 sheet: `MENU`, `DONHANG`, `CHITIET`.

## 2. Dán Apps Script
1. Trong file Sheet: **Extensions → Apps Script**.
2. Xóa code mẫu, copy toàn bộ file `pos-apps-script.gs` trong repo này dán vào, bấm **Save** (💾).
3. Bấm **Run → ensure_** lần đầu → cấp quyền (chọn tài khoản quán → Advanced → Go to… → Allow).
4. Quay lại Sheet, load lại trang sẽ thấy 3 sheet đã có sẵn full menu + giá.

## 3. Deploy lấy link
1. Trong Apps Script: **Deploy → New deployment → Web app**.
2. `Execute as`: **Me**. `Who has access`: **Anyone**.
3. Bấm **Deploy** → copy **Web App URL** (`https://script.google.com/macros/s/…/exec`).

## 4. Nối POS
1. Mở `pos.html` (host chung với web hoặc mở file trực tiếp đều được).
2. Bấm **⚙ Cài đặt** → dán Web App URL → **Lưu cài đặt**.
3. Dòng trạng thái chuyển xanh “Đã nối Sheet” là xong.

## 5. Bán hàng hằng ngày
1. Tab **Trà sữa / Sữa tươi / Trà / Trà trái cây / Topping** → bấm **M / L / + Thêm**.
2. Bill bên phải: nhập tên khách, chọn **Thanh toán** (Tiền mặt / CK / ShopeeFood — chỉ ghi note vào Sheet theo yêu cầu), chọn kênh, sửa giá nếu cần (vd Ú ụ full topping 30–32k), nhập giảm giá / ship / ghi chú.
3. Bấm **Lưu vào Sheet** → bấm **Xuất PDF** → chọn “Save as PDF” → gửi Zalo cho khách.
4. Hết bill bấm **Làm mới**. Mất mạng vẫn bán được: đơn giữ trên máy (mục **Đơn đã lưu**), có mạng bấm Lưu lại.

## 6. Đổi giá / thêm món (không cần sửa code)
- Sửa trực tiếp trong sheet `MENU`: cột `giaM / giaL / gia`, `active=0` để ẩn món.
- POS tải lại trang là có giá mới.

## 7. Xem báo cáo
- Sheet `DONHANG`: mỗi dòng 1 bill (mã đơn, giờ, khách, kênh, thanh toán note, tổng).
- Sheet `CHITIET`: từng ly trong bill.
- Dùng Filter / PivotTable của Sheet để xem doanh thu ngày / tháng, món bán chạy.

## Ghi chú
- Thanh toán hiện tại **chỉ ghi note** (không QR, không đối soát) đúng yêu cầu quán.
- Bill PDF khổ A5 gọn, in hoặc gửi Zalo đều đẹp.
- Muốn thêm máy khác: chỉ cần mở `pos.html` + dán cùng Web App URL.
