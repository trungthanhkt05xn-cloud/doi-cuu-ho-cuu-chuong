# Learning Engine

## Mục tiêu
Giúp trẻ:
1. hiểu phép nhân;
2. nhớ kết quả;
3. tăng độ nhanh;
4. củng cố phép yếu.

## Question unit

Khóa chuẩn:
`a × b`, với a,b thuộc phạm vi phù hợp.

MVP ưu tiên bảng 2–9.

Lưu ý tính giao hoán:
`6×7` và `7×6` có liên quan nhưng không nên coi hoàn toàn giống nhau trong tracking.

## Data tracked cho mỗi fact

Ví dụ key: `6x7`.

```json
{
  "attempts": 0,
  "correct": 0,
  "wrong": 0,
  "streak": 0,
  "lastSeen": null,
  "lastResult": null,
  "avgResponseMs": null,
  "mastery": 0.0
}
```

## Mastery gợi ý

MVP không cần machine learning.

Có thể tính heuristic:

- đúng: tăng mastery;
- sai: giảm;
- đúng liên tiếp: bonus;
- trả lời quá chậm: tăng ít hơn;
- lâu chưa gặp: ưu tiên review nhẹ.

Giữ mastery trong 0–1.

## Selection strategy

Một batch câu hỏi nên gồm hỗn hợp:

- 50% target facts của zone;
- 30% weak/review facts;
- 20% easy/confidence facts.

Con số có thể điều chỉnh sau playtest.

Không lặp lại chính xác một fact liên tục sau khi sai.

Ví dụ:
- sai `7×8`;
- cho hint;
- vài câu sau đưa `8×7`;
- sau thêm vài lượt quay lại `7×8`.

## Hint ladder

### Hint 1
Nhắc theo nhóm:
`7 × 8 = 7 nhóm, mỗi nhóm 8`

### Hint 2
Biểu diễn trực quan đơn giản:
`8 + 8 + 8 + 8 + 8 + 8 + 8`

### Hint 3
Gợi mốc:
`7 × 8 = (5 × 8) + (2 × 8)`

Không hiển thị tất cả hint cùng lúc.

## Answer modes

Dùng variation:
- keypad nhập số;
- 3 đáp án lớn;
- chọn đường đúng;
- kéo vật phẩm đến đáp án.

Không sử dụng một loại UI cho mọi mission.

## Accuracy vs speed
MVP ưu tiên accuracy trước.

Không có timer áp lực.

Có thể ghi response time ngầm để adaptive engine dùng.

## Learning dashboard
MVP không cần dashboard phức tạp cho trẻ.

Có thể hiển thị:
- bảng nào đã “khỏe”;
- bảng nào cần luyện thêm;
dưới dạng visual đơn giản.

Parent dashboard là phase sau.
