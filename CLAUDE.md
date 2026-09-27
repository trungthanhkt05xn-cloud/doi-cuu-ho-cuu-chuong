# CLAUDE.md — Project Operating Rules

Bạn đang phát triển **Math Rescue Adventure**, một web game học bảng cửu chương cho học sinh lớp 3.

## 1. Product lock
Concept đã chốt:
- thế giới phiêu lưu có bản đồ;
- người chơi khám phá từng vùng;
- mỗi vùng có các nhiệm vụ cứu hộ / sửa chữa / mở khóa / tìm đường;
- phép tính cửu chương là một phần của hành động trong gameplay.

Không quay lại brainstorm concept trừ khi người dùng yêu cầu.

## 2. Product priority
Ưu tiên theo thứ tự:

1. FUN
2. CLARITY
3. ENGAGEMENT
4. LEARNING EFFECTIVENESS
5. RETENTION
6. VISUAL POLISH
7. TECHNICAL ELEGANCE

Không tối ưu kiến trúc phần mềm nếu làm chậm việc kiểm chứng gameplay.

## 3. Target user
- Học sinh lớp 3, 8–9 tuổi.
- Không giả định trẻ đọc hướng dẫn dài.
- Touch-first.
- Mỗi hành động chính cần dễ hiểu trong vài giây.
- Không trừng phạt nặng khi trả lời sai.

## 4. MVP scope
Phải có:
- Home / Start.
- Adventure Map.
- Ít nhất 3 zone.
- Mỗi zone có mission.
- 3–5 loại mission mechanic có thể reuse.
- Multiplication tables 2–9.
- Adaptive question selection cơ bản.
- Hint khi sai.
- Reward/progression nhẹ.
- localStorage.
- responsive iPhone/iPad/desktop.
- chạy được trên Safari iOS/iPadOS.

Không làm trong MVP:
- đăng nhập;
- backend;
- cloud sync;
- leaderboard online;
- multiplayer;
- in-app purchase;
- social feed;
- chat;
- hệ thống avatar phức tạp;
- framework nặng nếu không cần thiết.

## 5. Technical principle
Ưu tiên:
- HTML5
- CSS3
- Vanilla JavaScript ES modules

Chỉ dùng dependency nếu giải quyết vấn đề thực tế rõ ràng.

MVP phải có thể chạy bằng static hosting.

Không bắt buộc build tool nếu không cần.

## 6. Architecture
Tách logic thành các module rõ:
- game state;
- mission engine;
- learning engine;
- question bank/generator;
- progression;
- storage;
- UI rendering;
- audio/animation helper.

Learning logic không được gắn cứng vào một mission.

## 7. Learning principles
Không random câu hỏi thuần túy.

Theo dõi tối thiểu:
- số lần đúng;
- số lần sai;
- chuỗi đúng;
- thời gian trả lời gần nhất;
- độ yếu tương đối của từng phép tính;
- thời điểm xuất hiện gần nhất.

Ưu tiên phép tính yếu xuất hiện lại nhưng không spam liên tục.

Sai:
1. phản hồi thân thiện;
2. cho hint;
3. cho thử lại hoặc câu tương đương;
4. đưa lại phép tính sau vài lượt.

Không dùng countdown mặc định trong MVP.

## 8. UX rules
- Mobile-first.
- Portrait là ưu tiên chính; landscape vẫn không vỡ layout.
- Touch target tối thiểu khoảng 44x44 CSS px.
- Text lớn, ít chữ.
- Không dùng modal dày đặc.
- Không hiện nhiều thông tin số cùng lúc.
- Primary action luôn rõ.
- Trạng thái đúng/sai phải nhận biết được cả bằng icon/animation, không chỉ màu.
- Không đặt control sát mép dưới gây xung đột với Safari UI.
- Tôn trọng safe area bằng `env(safe-area-inset-*)` khi phù hợp.

## 9. Visual direction
Phong cách:
- 2D illustrated adventure;
- tươi sáng, sạch, có chiều sâu;
- đẹp nhưng không quá “baby”;
- các vùng trên map có cá tính khác nhau;
- animation ngắn, có mục đích.

Tránh:
- UI kiểu worksheet;
- bảng số dày đặc;
- gradient neon quá mức;
- asset AI méo/lỗi;
- quá nhiều particle gây rối.

## 10. Performance
- Không preload asset quá lớn.
- Hình ảnh tối ưu cho mobile.
- Không animation tốn CPU/GPU liên tục.
- Game phải phản hồi nhanh trên iPhone/iPad đời không mới.
- Không block main thread bằng tác vụ không cần thiết.

## 11. Development workflow
Trước khi code:
1. đọc toàn bộ `docs/`;
2. tóm tắt phạm vi;
3. đưa implementation plan ngắn;
4. chỉ ra rủi ro;
5. sau đó mới code.

Trong khi code:
- chia milestone nhỏ;
- mỗi milestone phải chạy được;
- tránh refactor lớn không cần thiết;
- giữ project chạy được sau mỗi bước.

Sau mỗi milestone:
- smoke test;
- regression các flow chính;
- kiểm mobile layout;
- kiểm lỗi console;
- ghi lại status.

## 12. Definition of done
Không coi feature hoàn thành nếu chỉ “code chạy”.

Phải kiểm:
- trẻ có hiểu hành động không;
- phép toán có gắn với hành động không;
- sai có gây bực không;
- flow có bị ngắt quãng không;
- có bug trên Safari/mobile không;
- local progress có lưu đúng không.

## 13. Anti-overengineering
Nếu có hai phương án cho kết quả tương đương:
- chọn phương án đơn giản hơn;
- ít dependency hơn;
- ít file hơn;
- dễ debug hơn;
- dễ mở rộng vừa đủ hơn.

Không tự tạo hệ thống generic phức tạp để “sau này có thể cần”.

## 14. Communication
Khi cần thay đổi spec:
- nêu lý do;
- mô tả trade-off;
- không tự thay đổi quyết định product đã LOCK.

Khi không chắc:
- ưu tiên phương án đơn giản và có thể kiểm thử.
