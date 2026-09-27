# Game Design

## 1. World structure

### Zone 1 — Sunny Village / Làng Nắng
Mục đích:
- onboarding;
- bảng 2, 3, 4;
- gameplay đơn giản.

Ví dụ nhiệm vụ:
- sửa cầu gỗ;
- cứu mèo khỏi mái nhà;
- mở cổng trang trại;
- sửa bánh xe.

### Zone 2 — Whispering Forest / Rừng Thì Thầm
Mục đích:
- bảng 4, 5, 6;
- tăng exploration.

Ví dụ:
- tìm đường qua các cổng;
- thắp đèn chỉ đường;
- cứu sinh vật bị mắc kẹt;
- ghép vật phẩm để mở lối.

### Zone 3 — Crystal Cove / Vịnh Pha Lê
Mục đích:
- bảng 6, 7, 8, 9;
- mission khó hơn.

Ví dụ:
- mở hang kho báu;
- sửa hải đăng;
- xây bè;
- giải cứu thuyền.

Sau MVP có thể thêm:
- Clockwork City;
- Sky Islands;
- Space Station;
- Ancient Temple.

## 2. Mission mechanics

### Mechanic A — Unlock
Ví dụ:
Cổng có 4 vòng khóa. Mỗi vòng cần một phép nhân đúng.

Math → khóa phát sáng → cổng mở từng phần.

### Mechanic B — Repair
Ví dụ:
Cầu thiếu các thanh gỗ.

Mỗi câu đúng đặt được một mảnh cầu.

Math → animation gắn mảnh → nhân vật tiến thêm.

### Mechanic C — Path Finding
Có 2–3 đường.

Mỗi đường gắn với một đáp án.

Chọn đúng → nhân vật đi đúng hướng.
Chọn sai → đường bị chặn nhẹ + hint, không game over.

### Mechanic D — Rescue
Một nhân vật bị kẹt.

Mỗi phép tính hoàn thành một hành động:
- kéo dây;
- bật công tắc;
- nâng cầu;
- mở lồng.

### Mechanic E — Collect / Build
Thu thập vật phẩm để hoàn thành mục tiêu.

Ví dụ:
“Cần 6 hộp, mỗi hộp 4 viên pin. Tổng cộng cần bao nhiêu pin?”

Giai đoạn luyện nhanh có thể giản hóa chỉ còn:
`6 × 4 = ?`

## 3. Reward

MVP:
- Stars;
- Rescue badges;
- map completion;
- cosmetic stickers đơn giản.

Không nên:
- loot box;
- reward ngẫu nhiên gây nghiện;
- currency phức tạp;
- shop.

## 4. Progression

Một zone gồm:
- 4–6 mission thường;
- 1 rescue finale.

Unlock zone kế:
- hoàn thành phần lớn mission;
- không bắt buộc perfect score.

## 5. Failure model

Không có “thua cuộc” vì một phép tính sai.

Sai:
- animation nhẹ;
- thông báo ngắn;
- hint;
- thử lại hoặc phương án hỗ trợ;
- tiếp tục gameplay.

Không:
- mất mạng;
- mất toàn bộ progress;
- trừ điểm lớn;
- âm thanh tiêu cực mạnh.

## 6. Replay

Mission đã hoàn thành vẫn replay được.

Adaptive engine dùng replay để:
- đưa lại phép yếu;
- tạo variation câu;
- tăng fluency.

## 7. Difficulty

Không chỉ dựa vào bảng cửu chương.

Độ khó gồm:
- loại phép tính;
- độ quen thuộc;
- thời gian phản hồi;
- distractor nếu dùng lựa chọn;
- số bước của mission.

Không tăng mọi thứ cùng lúc.
