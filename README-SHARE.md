# POS Ú Ụ Milk Tea — dùng trực tiếp trong Google Sheet

Gói này gồm: `pos-apps-script.gs`, `POS.html`.

## Cài 1 lần (~5 phút)
1. Tạo Google Sheet mới → **Extensions → Apps Script**.
2. Dán toàn bộ `pos-apps-script.gs` vào file `Code.gs` → Save.
3. Run `ensure_` 1 lần để cấp quyền. Chọn tài khoản → nếu màn hình
   cảnh báo thiếu HTTPS thì click **Advanced → Proceed to [site] (unsafe)**
   để tiếp tục → Allow.
4. Trong Apps Script bấm **+ → HTML**, đặt tên đúng `POS`,
   dán toàn bộ `POS.html` → Save.
5. Về Sheet bấm F5 → menu **🧋 POS Ú Ụ → Mở POS bán hàng**.

## Bán hằng ngày
1. Bấm tab món → M / L để thêm vào bill.
2. Mỗi dòng có nút topping riêng, cộng tiền vào ly đó.
3. Nhập tên khách, thanh toán (chỉ ghi note), giảm giá / ship / ghi chú.
4. Bấm **Lưu vào Sheet** → **Xuất PDF** gửi Zalo.
5. Sửa giá: sửa trực tiếp sheet `MENU`, tải lại sidebar.
