# QA & Acceptance Criteria

## A. Functional
- [ ] Home hoạt động.
- [ ] Continue hoạt động nếu đã có save.
- [ ] Map hiển thị đúng zone.
- [ ] Locked zone không vào được.
- [ ] Mission start/complete đúng.
- [ ] Câu trả lời được kiểm đúng.
- [ ] Hint hoạt động.
- [ ] Reward không cộng lặp do double click.
- [ ] Progress lưu sau reload.
- [ ] Reset progress hoạt động có confirm.
- [ ] Sound setting lưu.

## B. Learning
- [ ] Bảng 2–9 có thể xuất hiện.
- [ ] Zone ưu tiên đúng nhóm bảng.
- [ ] Fact sai được tăng ưu tiên.
- [ ] Không lặp fact sai liên tục gây khó chịu.
- [ ] Correct answer cập nhật mastery.
- [ ] Wrong answer cập nhật mastery.
- [ ] Response time được lưu nếu spec dùng.
- [ ] Hint không trực tiếp phá game ngay từ đầu.

## C. Child UX
- [ ] Trẻ nhìn Home biết phải bấm gì.
- [ ] Trẻ nhìn Map biết mission nào hiện tại.
- [ ] Mission intro dưới ~2 câu ngắn.
- [ ] Action button lớn.
- [ ] Không có màn hình chữ dày.
- [ ] Sai không tạo cảm giác game over.
- [ ] Không cần đọc tutorial dài.
- [ ] Feedback của phép tính tạo thay đổi trong scene.

## D. Visual
- [ ] UI không giống worksheet.
- [ ] Map tạo cảm giác adventure.
- [ ] Ba zone khác nhau trực quan.
- [ ] Phép tính dễ đọc.
- [ ] Button states rõ.
- [ ] Correct/wrong không chỉ phân biệt bằng màu.

## E. Mobile / Safari
- [ ] Không horizontal overflow ngoài ý muốn.
- [ ] Không có control bị Safari bar che.
- [ ] Touch target đủ lớn.
- [ ] Không phụ thuộc hover.
- [ ] Orientation không phá UI.
- [ ] Text/input không zoom bất ngờ.
- [ ] Audio không autoplay gây lỗi/chặn.
- [ ] Reload không mất progress.

## F. Performance
- [ ] First load hợp lý trên mobile.
- [ ] Không dùng ảnh quá lớn.
- [ ] Animation không giật rõ.
- [ ] Không có memory leak dễ thấy qua session 10–15 phút.
- [ ] Không console error/warning nghiêm trọng.

## G. Product Gate
Trước khi chốt MVP, tự trả lời:

1. Nếu bỏ toàn bộ hình đẹp đi, gameplay còn có logic không?
2. Nếu bỏ toán đi, mission có hành động rõ không?
3. Toán có thực sự tác động vào hành động hay chỉ là popup chặn đường?
4. Trẻ sai có muốn thử lại?
5. Sau mission đầu, có động lực mở mission tiếp không?

Nếu câu 3 = “chỉ là popup”, cần thiết kế lại integration.
