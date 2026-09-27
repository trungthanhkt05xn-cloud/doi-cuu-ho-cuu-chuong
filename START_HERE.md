# Math Rescue Adventure — Project Handoff

## Trạng thái
Concept đã được người dùng **LOCK**:

> Kết hợp **Đội Cứu Hộ Cửu Chương** + **Đảo Kho Báu Bí Mật** thành một thế giới phiêu lưu có bản đồ.  
> Mỗi vùng trên bản đồ có các nhiệm vụ cứu hộ/khám phá khác nhau; phép tính là cơ chế để thực hiện hành động trong game, không phải quiz rời rạc.

## Đối tượng
- Học sinh lớp 3, khoảng 8–9 tuổi.
- Ưu tiên dùng trực tiếp trên Safari iPhone/iPad; hỗ trợ desktop browser.
- Bé phải hiểu được game gần như không cần người lớn hướng dẫn.

## Mục tiêu bản đầu
Xây dựng MVP web giúp học thuộc bảng cửu chương 2–9 bằng gameplay phiêu lưu + cứu hộ.

MVP cần:
- bản đồ có vùng/mission;
- nhiệm vụ ngắn;
- câu hỏi cửu chương tích hợp vào hành động;
- phản hồi đẹp, không gây áp lực khi sai;
- adaptive learning cơ bản;
- lưu tiến trình local;
- giao diện mobile-first;
- hoạt động ổn trên Safari iOS/iPadOS.

## Cách dùng với Claude Code

1. Giải nén thư mục này.
2. Mở thư mục bằng Claude Code.
3. Đọc `CLAUDE.md`.
4. Copy nội dung `PROMPT_FIRST_RUN.md` vào Claude Code.
5. Yêu cầu Claude thực hiện theo từng milestone, không tự mở rộng phạm vi.

## Nguyên tắc quan trọng
- Game trước, bài học ẩn bên trong.
- Không biến thành “quiz toán có animation”.
- Không dùng backend, account, multiplayer ở MVP.
- Không dùng framework lớn nếu HTML/CSS/JS thuần đáp ứng đủ.
- Không làm nhiều game mode ở MVP.
- Không tự thêm feature ngoài spec trước khi core loop thật sự vui và rõ.
