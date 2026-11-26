# Office Order — Chrome Extension (Thông báo & Loa thoại nền)

Extension giúp các thành viên văn phòng **tắt hẳn tab `office-order.pages.dev`** mà vẫn nhận được đầy đủ thông báo đẩy và **phát loa thoại `.mp3`** khi có:
- 📣 Hối đặt món
- ⏰ Hối chốt đơn tính tiền (gửi tới Đại diện)
- 💸 Hối chuyển khoản (gửi tới người chưa trả)
- 🔔 Báo đã chuyển khoản / 🎁 Donate hộ (gửi tới Đại diện)
- ⚡ Xác nhận đã nhận tiền (SePay / Đại diện)

## Cách cài đặt nhanh trong 30 giây (Chrome / Edge / Brave / Cốc Cốc)
1. Tải thư mục `chrome-extension/` về máy (giải nén nếu được gửi file `.zip`).
2. Mở trình duyệt và gõ vào thanh địa chỉ: `chrome://extensions` (hoặc `edge://extensions`).
3. Bật công tắc **Developer mode (Chế độ dành cho nhà phát triển)** ở góc trên bên phải.
4. Bấm **Load unpacked (Tải tiện ích đã giải nén)** → chọn đúng thư mục `chrome-extension`.
5. (Khuyên dùng) Bấm biểu tượng mảnh ghép 🧩 góc trên trình duyệt → ghim **Office Order** lên thanh công cụ.

## Cách sử dụng
- **Tự động hoàn toàn**: Chỉ cần mở 1 link bill trên `https://office-order.pages.dev/?bill=...`, Extension sẽ tự nhớ tên/UID và theo dõi ngầm bill đó (hỗ trợ theo dõi nhiều bill trong ngày).
- **Chống trùng thông báo**: Nếu tab web của bill đang mở, Extension sẽ tự nhường cho trang web phát để không bị vang 2 lần.
- **Im lặng khi họp**: Bấm vào icon Extension góc trên trình duyệt để tắt nhanh loa thoại hoặc chọn **Im lặng 1h / Hết hôm nay**.
