# AGENTS.md — Quy ước deploy Cloudflare Pages

Cloudflare Pages (upload tay) chỉ nhận **folder**, không nhận zip.
Mỗi khi user nói deploy / build bản sạch, agent PHẢI xuất ra 2 folder
sạch ở root repo, ghi đè nếu đã có, rồi liệt kê nội dung để user kéo thả:

## 1. `dist-site/` — web công khai Ú Ụ Milk Tea
Gồm: `index.html`, `menu.jpg`, `_headers`, toàn bộ `assets/`
TRỪ file nội bộ: `assets/js/pos.js`, `assets/css/pos.css`.
Ảnh gốc không dùng cũng loại (chỉ giữ `assets/img/opt/` và `assets/img/toppings/opt/`):
`assets/img/*.jpg`, `assets/img/toppings/*.jpg`, `assets/img/toppings/*.png`.
KHÔNG BAO GỒM: `pos.html`, `POS.html`, `pos-apps-script.gs`,
`pos-live/`, `dist-live/`, mọi `*.zip`, mọi `*.md` (README/HUONG-DAN),
thư mục `pos-share-sheet-only/`, `node_modules/`.

## 2. `dist-live/` — POS live văn phòng (site riêng)
Gồm (lấy từ `pos-live/`): `index.html`, `live.js`, `style.css`,
`assets/img/opt/logo.webp` (giữ đúng cấu trúc `assets/...`).
KHÔNG BAO GỒM: `server.js`, `README.md`, `package*.json`,
`node_modules/`, `fonts.css` (không được reference).

## 3. Kiểm tra bắt buộc sau khi build
- `grep -r "script.google.com/macros" dist-site/` phải TRỐNG
  (link Apps Script nội bộ không được lọt ra web công khai).
- `grep -n "pos.html\|POS" dist-site/index.html` phải TRỐNG.
- `dist-live/index.html` và `dist-live/live.js` phải tồn tại.
- In cây file 2 folder ra cho user kiểm tra trước khi kéo lên Pages.

## 4. Lệnh mẫu
rm -rf dist-site dist-live
mkdir -p dist-site dist-live
cp index.html menu.jpg _headers dist-site/
cp -r assets dist-site/ && rm -f dist-site/assets/js/pos.js dist-site/assets/css/pos.css
find dist-site/assets/img -maxdepth 1 -name '*.jpg' -delete
find dist-site/assets/img/toppings -maxdepth 1 \( -name '*.jpg' -o -name '*.png' \) -delete
mkdir -p dist-live/assets/img/opt
cp pos-live/index.html pos-live/live.js pos-live/style.css dist-live/
cp pos-live/assets/img/opt/logo.webp dist-live/assets/img/opt/
