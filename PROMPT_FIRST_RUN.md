# Prompt chạy lần đầu trong Claude Code

Hãy đọc toàn bộ project, đặc biệt:
- `CLAUDE.md`
- `START_HERE.md`
- tất cả file trong `docs/`

Concept đã được LOCK. Không brainstorm lại concept.

Nhiệm vụ của bạn là xây dựng MVP của **Math Rescue Adventure**: một web game mobile-first dành cho học sinh lớp 3 học bảng cửu chương 2–9.

## Yêu cầu làm việc

1. Trước khi viết code, hãy:
   - tóm tắt lại product scope trong tối đa 15 dòng;
   - đề xuất kiến trúc tối thiểu;
   - lập implementation plan theo milestone;
   - chỉ ra 5 rủi ro quan trọng nhất;
   - rà xem spec có điểm nào mâu thuẫn hay thiếu để triển khai MVP hay không.

2. Không được over-engineer.
   - Ưu tiên HTML/CSS/Vanilla JS.
   - Không backend.
   - Không account.
   - Không framework lớn nếu không có lý do kỹ thuật rõ.
   - Không tạo hàng loạt abstraction trước khi gameplay hoạt động.

3. Sau phần phân tích, bắt đầu triển khai ngay MVP theo milestone đã đề xuất.

4. Sau mỗi milestone:
   - tự chạy kiểm tra;
   - sửa lỗi trước khi chuyển tiếp;
   - kiểm tra console;
   - kiểm tra responsive;
   - cập nhật `PROJECT_STATUS.md`.

5. Gameplay phải tuân thủ:
   - game trước, quiz sau;
   - phép tính phải tạo ra hành động trong thế giới game;
   - sai → phản hồi thân thiện → hint → thử lại / gặp lại sau;
   - không dùng countdown gây áp lực mặc định;
   - adaptive learning cơ bản;
   - trẻ 8–9 tuổi phải hiểu được thao tác gần như không cần hướng dẫn.

6. UI:
   - đẹp, trực quan, vui nhưng không quá trẻ con;
   - touch-first;
   - tối ưu iPhone/iPad Safari;
   - animation ngắn và có mục đích;
   - map phải tạo cảm giác khám phá;
   - mỗi zone có visual identity riêng;
   - các nút/action lớn, dễ bấm.

7. MVP cần có ít nhất:
   - Start/Home;
   - Adventure Map;
   - 3 zone;
   - mission system;
   - tối thiểu 3 loại mission mechanic;
   - cửu chương 2–9;
   - adaptive question engine;
   - hint system;
   - reward/progression;
   - localStorage;
   - settings cơ bản: sound on/off, reset progress;
   - mobile responsive;
   - desktop usable.

8. Khi một lựa chọn giữa “đẹp hơn” và “ổn định/dễ hiểu hơn” xung đột trong MVP, ưu tiên dễ hiểu và ổn định, sau đó polish.

9. Không dừng ở mockup. Phải tạo phiên bản chạy được.

10. Cuối cùng thực hiện final QC theo `docs/QA_ACCEPTANCE.md` và ghi rõ:
   - PASS;
   - PARTIAL;
   - FAIL;
   cho từng nhóm tiêu chí.

Bắt đầu.
