# UX / UI Specification

## 1. UX goal
Trẻ 8–9 tuổi mở game lên phải:
- biết nút nào để bắt đầu;
- nhìn map và hiểu nơi nào chơi được;
- hiểu mục tiêu mission bằng hình + câu ngắn;
- bấm chính xác bằng ngón tay;
- không cần đọc hướng dẫn dài.

## 2. Visual direction

### Style
- 2D adventure illustration.
- Clear silhouettes.
- Rounded cards/buttons vừa phải.
- Depth bằng layer, shadow nhẹ, parallax nhẹ.
- Không quá preschool.
- Không dùng giao diện “school worksheet”.

### Color
Không khóa palette cứng ở MVP.
Nguyên tắc:
- background dịu;
- action chính nổi rõ;
- status success/error có icon hỗ trợ;
- text contrast tốt.

## 3. Key screens

### Screen A — Home
Thành phần:
- logo/title;
- nút “Bắt đầu phiêu lưu”;
- Continue nếu có save;
- sound/settings icon nhỏ.

Không cho trẻ chọn 10 menu ngay.

### Screen B — Adventure Map
- map chiếm phần lớn màn hình;
- zone hiển thị như các điểm đến;
- locked zone thể hiện rõ nhưng hấp dẫn;
- current mission có pulse nhẹ;
- hiển thị stars/progress vừa đủ.

### Screen C — Mission Intro
- 1 minh họa;
- 1 câu mục tiêu;
- nút bắt đầu.

Ví dụ:
“Cây cầu bị gãy! Hãy giúp sửa cầu để các bạn qua sông.”

### Screen D — Mission Gameplay
Ưu tiên:
- scene/action ở 45–60% phía trên;
- question/action area phía dưới;
- answer buttons lớn;
- progress nhỏ, không gây áp lực.

### Screen E — Success
- animation ngắn 1–2 giây;
- mission result;
- reward;
- nút “Tiếp tục”.

Không tạo popup nhiều lớp.

### Screen F — Hint
Hint nằm gần câu hỏi.
Không che toàn màn hình nếu không cần.

## 4. Touch
- target khoảng 44px trở lên;
- spacing đủ để trẻ không bấm nhầm;
- không phụ thuộc hover;
- drag mechanic chỉ dùng khi thật sự ổn định trên mobile.

## 5. Typography
- sans-serif rõ;
- chữ phép tính rất lớn;
- body ngắn;
- tránh font trang trí cho nội dung toán.

## 6. Motion
Animation mục tiêu:
- reward;
- phản hồi hành động;
- hướng dẫn ánh nhìn.

Không animation chỉ để “cho đẹp”.

Duration phần lớn:
150–500ms.

Cinematic success có thể 1–2s.

## 7. Audio
- click nhẹ;
- success vui;
- error mềm;
- ambience rất nhẹ nếu dùng.

Phải có mute.

Không autoplay audio khó chịu ngay khi tải trang.

## 8. Safari / iOS
- dùng viewport phù hợp;
- tránh fixed footer sát mép;
- dùng safe area;
- tránh interaction dựa vào hover;
- test orientation;
- không để input làm zoom trang ngoài ý muốn;
- font input >=16px nếu dùng input HTML thực.

## 9. Accessibility
- contrast đủ;
- icon + text/status;
- không chỉ dùng đỏ/xanh;
- thao tác quan trọng không cần precision cao.
