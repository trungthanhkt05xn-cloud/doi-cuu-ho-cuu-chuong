# Đội Cứu Hộ Cửu Chương · Math Rescue Adventure

Web game phiêu lưu giúp bé lớp 3 học bảng nhân 2–9. Static, không backend, không cài đặt.
Tài liệu sản phẩm: [`START_HERE.md`](START_HERE.md), [`docs/`](docs/), trạng thái: [`PROJECT_STATUS.md`](PROJECT_STATUS.md).

## Chạy local
ES modules cần chạy qua HTTP (không mở trực tiếp `file://`):

```bash
python -m http.server 8000      # hoặc: npx serve .
# mở http://localhost:8000
```
Thử trên iPhone/iPad cùng Wi-Fi: `python -m http.server 8000 --bind 0.0.0.0` rồi mở `http://<IP-máy-tính>:8000`.

## Deploy static
Upload nguyên thư mục (chỉ cần `index.html`, `css/`, `js/`, `assets/`) lên bất kỳ static host nào:
- **GitHub Pages**: push repo → Settings → Pages → Deploy from branch (root).
- **Netlify / Cloudflare Pages**: kéo-thả thư mục, không cần build command.
- **Vercel**: `vercel --prod` (framework: Other, không build).

## Cấu trúc
```
index.html
css/base.css            tokens, nút, Home, Settings, Album
css/game.css            bản đồ, màn nhiệm vụ, đáp án, scene, responsive
js/app.js               khởi động, điều hướng màn hình (history), Home, Settings
js/state.js             state + localStorage (có version, chịu được dữ liệu hỏng)
js/audio.js             âm thanh tổng hợp WebAudio (không file, không autoplay)
js/learning/engine.js   theo dõi phép tính, mastery, chọn câu thích ứng, ôn giãn cách, đáp án nhiễu, gợi ý
js/game/catalog.js      dữ liệu vùng + 15 nhiệm vụ (thêm nhiệm vụ = thêm dữ liệu)
js/game/progression.js  luật mở khóa, sao, sticker, huy hiệu
js/game/missionEngine.js  phiên nhiệm vụ (không biết gì về hình ảnh)
js/ui/art.js            bộ vẽ SVG (thay bằng art thật sau này tại đây)
js/ui/map.js            bản đồ phiêu lưu
js/ui/missionView.js    intro → chơi → thành công, UI đáp án, gợi ý
js/ui/mechanics/*.js    5 cơ chế: repair, unlock, path, rescue, light
js/ui/album.js          Sổ cứu hộ: huy hiệu, sticker, sức mạnh từng bảng
```
