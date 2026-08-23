# Business Logic: Hệ Thống Lập Lịch Nhân Viên

## 1. Tổng Quan

Hệ thống lập lịch nhân viên trong MaiAICRM sử dụng **mô hình 2 tầng**:

1. **Template Lịch Tuần** - Giờ làm việc mặc định cho mỗi ngày trong tuần
2. **Ghi Đè Theo Ngày** - Ngoại lệ cho ngày cụ thể (ca làm đặc biệt, ngày lễ, nghỉ phép)

Điều này thay thế mô hình lập lịch theo ngày cũ, trong đó phải thiết lập giờ làm việc cho từng ngày riêng lẻ.

---

## 2. Mô Hình Dữ Liệu

### 2.1 Template Lịch Tuần

Được lưu trữ trong `staff.weeklySchedule` dưới dạng JSON:

```javascript
{
  "monday": {
    "active": boolean,           // true = đang làm việc, false = ngày nghỉ
    "startTime": "HH:MM",        // ví dụ: "09:00"
    "endTime": "HH:MM",          // ví dụ: "17:00"
    "breakStart": "HH:MM"|null,  // ví dụ: "12:00"
    "breakEnd": "HH:MM"|null,    // ví dụ: "13:00"
    "station": string|null       // ví dụ: "Bàn 1"
  },
  "tuesday": {...},
  "wednesday": {...},
  "thursday": {...},
  "friday": {...},
  "saturday": {...},
  "sunday": {...}
}
```

**Ràng Buộc:**
- Cả 7 ngày bắt buộc phải có
- Thời gian ở định dạng 24 giờ (HH:MM)
- `endTime > startTime` (nếu active = true)
- Thời gian nghỉ phép tùy chọn; nếu cả hai có: `breakStart < breakEnd`
- Thời gian nghỉ phải nằm trong ca làm: `startTime ≤ breakStart < breakEnd ≤ endTime`

### 2.2 Ghi Đè Theo Ngày

Được lưu trữ trong bảng `staffschedule`:

```javascript
{
  "staffId": number,
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "breakStart": "HH:MM"|null,
  "breakEnd": "HH:MM"|null,
  "isDayOff": boolean,          // true = nhân viên không có mặt ngày này
  "note": string|null,          // ví dụ: "Sự kiện đặc biệt", "Kỳ nghỉ"
}
```

**Ràng Buộc:**
- Duy nhất: Một bản ghi cho mỗi cặp (staffId, date)
- Chỉ lưu các ngoại lệ, không phải mọi ngày

---

## 3. Logic Xác Định Lịch Làm Việc

Khi kiểm tra khả năng làm việc của nhân viên cho một ngày cụ thể, sử dụng ưu tiên này:

```
NẾU ghi đè theo ngày tồn tại:
    NẾU override.isDayOff == true:
        → Nhân viên KHÔNG CÓ MẶT (không khả dụng)
    NGOÀI RA:
        → Sử dụng lịch ghi đè (startTime, endTime, thời gian nghỉ phép)
        
NGOÀI RA NẾU lịch tuần tồn tại:
    Lấy tên ngày từ ngày tháng (ví dụ: 2025-01-15 = Thứ Tư)
    NẾU weekly[Thứ Tư].active == true:
        → Sử dụng lịch tuần
    NGOÀI RA:
        → Ngày nghỉ trong lịch tuần (không khả dụng)
        
NGOÀI RA:
    → Không tìm thấy lịch làm (lỗi: nhân viên không khả dụng)
```

**Ví dụ 1: Ngày thường thường ngày**
```
Ngày: 2025-01-15 (Thứ Tư)
Không có ghi đè cho ngày này
Lịch tuần: Thứ Tư.active = true, 09:00-17:00

→ Kết quả: Nhân viên làm việc 09:00-17:00
```

**Ví dụ 2: Ca làm đặc biệt (ghi đè)**
```
Ngày: 2025-01-15 (Thứ Tư)
Ghi đè tồn tại: 14:00-22:00 (ca tối)
Lịch tuần: Thứ Tư.active = true, 09:00-17:00

→ Kết quả: Nhân viên làm việc 14:00-22:00 (ghi đè có ưu tiên)
```

**Ví dụ 3: Ngày lễ (ghi đè ngày nghỉ)**
```
Ngày: 2025-02-10 (Thứ Hai)
Ghi đè tồn tại: isDayOff = true, note = "Ngày Lễ Quốc Gia"
Lịch tuần: Thứ Hai.active = true, 09:00-17:00

→ Kết quả: Nhân viên KHÔNG CÓ MẶT (không khả dụng) - ghi đè chặn tất cả đặt lịch
```

**Ví dụ 4: Thứ Sáu thường ngày nghỉ**
```
Ngày: 2025-01-24 (Thứ Sáu)
Không có ghi đè cho ngày này
Lịch tuần: Thứ Sáu.active = false (ngày nghỉ mặc định)

→ Kết quả: Nhân viên KHÔNG CÓ MẶT (không khả dụng)
```

---

## 4. Xác Thực Đặt Lịch Cuộc Hẹn

Khi khách hàng đặt lịch cuộc hẹn, hệ thống xác thực khả năng:

### 4.1 Kiểm Tra Trước Khi Đặt Lịch

```
1. Xác định lịch làm việc của nhân viên cho ngày cuộc hẹn
   → Phải có lịch hợp lệ (không phải ngày nghỉ, không phải không khả dụng)

2. Xác thực thời gian cuộc hẹn với lịch đã xác định:
   appointment.startTime >= schedule.startTime
   appointment.endTime ≤ schedule.endTime

3. Xác thực cuộc hẹn không trùng với thời gian nghỉ phép:
   NẾU lịch có thời gian nghỉ:
       KHÔNG (appointment.startTime < breakEnd AND appointment.endTime > breakStart)

4. Kiểm tra không có xung đột lịch:
   Không có cuộc hẹn khác cho nhân viên này tại thời gian này

5. Kiểm tra cửa hàng đang mở cửa:
   Cuộc hẹn phải nằm trong giờ hoạt động của cửa hàng
```

### 4.2 Các Trường Hợp Lỗi

| Kịch Bản | Tin Nhắn Lỗi | Trạng Thái |
|----------|---------------|-----------|
| Nhân viên không hoạt động | "Nhân viên không khả dụng" | 400 |
| Nhân viên đang nghỉ phép | "Nhân viên không khả dụng" | 400 |
| Ngày ghi đè là ngày nghỉ | "Nhân viên không có mặt vào ngày được chọn" | 409 |
| Không có lịch tuần cho ngày này | "Nhân viên không có lịch làm việc cho ngày được chọn" | 409 |
| Cuộc hẹn trước khi bắt đầu làm việc | "Cuộc hẹn nằm ngoài giờ làm việc của nhân viên" | 409 |
| Cuộc hẹn sau khi kết thúc làm việc | "Cuộc hẹn nằm ngoài giờ làm việc của nhân viên" | 409 |
| Cuộc hẹn trùng với thời gian nghỉ | "Cuộc hẹn trùng với thời gian nghỉ của nhân viên (12:00–13:00)" | 409 |
| Xung đột giờ với cuộc hẹn hiện tại | "Khung giờ đã được đặt lịch" | 409 |

---

## 5. Quy Tắc Kinh Doanh

### 5.1 Trạng Thái Nhân Viên

```
status = "active"    → Có thể tiếp nhận cuộc hẹn
status = "busy"      → Có thể tiếp nhận cuộc hẹn (nhưng hiện đang bận)
status = "on_leave"  → Không thể tiếp nhận bất kỳ cuộc hẹn nào
status = "inactive"  → Không thể tiếp nhận bất kỳ cuộc hẹn nào
```

**Quy tắc**: Lịch tuần bị bỏ qua nếu `staff.status` là `on_leave` hoặc `inactive`.

### 5.2 Ràng Buộc Giờ Làm Việc

```
startTime < endTime          (bắt buộc)
breakStart < breakEnd        (nếu thiết lập thời gian nghỉ)
startTime ≤ breakStart       (thời gian nghỉ bắt đầu trong giờ làm)
breakEnd ≤ endTime           (thời gian nghỉ kết thúc trong giờ làm)
breakEnd - breakStart ≥ 15   (thời gian nghỉ tối thiểu 15 phút, quy tắc kinh doanh)
```

### 5.3 Thiết Lập Lịch Tuần

**Mô hình mặc định** (phổ biến nhất trong các spa):
```
Thứ Hai - Thứ Sáu:  09:00-17:00, Nghỉ phép 12:00-13:00
Thứ Bảy:           KHÔNG CÓ MẶT
Chủ Nhật:          KHÔNG CÓ MẶT
```

**Mô hình phục vụ 24 giờ**:
```
Tất cả các ngày:    Mở cửa, thay đổi tùy theo gán ca
```

**Mô hình bán thời gian**:
```
Thứ Hai, Thứ Tư, Thứ Sáu:  09:00-17:00
Thứ Ba, Thứ Năm:           KHÔNG CÓ MẶT
Thứ Bảy:                   11:00-15:00 (ca cuối tuần tùy chọn)
Chủ Nhật:                  KHÔNG CÓ MẶT
```

### 5.4 Hành Vi Ghi Đè

**Ghi đè có ưu tiên tuyệt đối:**
- Không thể bị ghi đè bởi lịch tuần
- Không thể bị giới hạn về thời gian bởi giờ hoạt động của cửa hàng (quản trị viên quyết định)
- Có thể đánh dấu bất kỳ ngày nào là ngày nghỉ, bất kể lịch tuần

**Các kịch bản ghi đè phổ biến:**
- Yêu cầu khẩn cấp/đơn hàng gấp: Nhân viên làm việc muộn (18:00-20:00)
- Kỳ nghỉ được lên lịch: Đánh dấu nhiều ngày là ngày nghỉ
- Ngày lễ quốc gia: Đánh dấu toàn hệ thống ngày nghỉ
- Đóng cửa khẩn cấp: Đánh dấu ngày đóng cửa với isDayOff=true
- Đào tạo nhân viên: Đánh dấu không khả dụng trong thời gian đào tạo

---

## 6. Quy Tắc Toàn Vẹn Dữ Liệu

### 6.1 Xác Thực Khi Tạo/Cập Nhật Nhân Viên

```javascript
Xác thực weeklySchedule:
  ✓ Cả 7 ngày phải có
  ✓ Tất cả các ngày active=true phải có thời gian hợp lệ
  ✓ Tất cả các ngày inactive phải có active=false, không cần thời gian
  ✓ Định dạng thời gian là HH:MM (24 giờ)
  ✓ endTime > startTime
  ✓ Nếu có thời gian nghỉ: breakStart < breakEnd
  ✓ Thời gian nghỉ phải nằm trong giờ làm việc
  
Trả về chi tiết lỗi nếu bất kỳ ràng buộc nào không đạt:
  "Lỗi lịch tuần: friday.endTime phải sau startTime"
```

### 6.2 Xác Thực Khi Tạo/Cập Nhật Ghi Đè

```javascript
Xác thực ghi đè:
  ✓ Định dạng ngày là YYYY-MM-DD
  ✓ Nếu không phải ngày nghỉ: phải cung cấp startTime, endTime và hợp lệ
  ✓ Nếu ngày nghỉ: isDayOff=true, thời gian có thể trống
  ✓ Các ràng buộc giống như lịch tuần (endTime > startTime, v.v.)
  ✓ Không có bản ghi trùng lặp (staffId, date)
```

---

## 7. Các Kịch Bản Đặc Biệt

### 7.1 Nếu nhân viên không có lịch tuần?

**Tương thích dữ liệu cũ:**
```
NẾU staff.weeklySchedule == null:
    Quay lại chỉ sử dụng ghi đè theo ngày
    Mỗi ngày cuộc hẹn PHẢI có mục ghi đè
    NẾU không tìm thấy ghi đè: Lỗi "Nhân viên không có lịch làm"
```

### 7.2 Nếu nhân viên có cả lịch tuần VÀ ghi đè?

**Giải quyết:**
```
Ghi đè LUÔN thắng (được kiểm tra trước)
Nếu không có ghi đè cho ngày: sử dụng lịch tuần
```

### 7.3 Nhân viên có thể làm việc vào ngày được lên lịch nghỉ không?

**Có ghi đè - CÓ:**
```
Lịch tuần: Thứ Bảy = KHÔNG CÓ MẶT
Ghi đè 2025-01-18 (Thứ Bảy): 14:00-18:00 ✓
→ Nhân viên có thể làm việc vào thứ Bảy này
```

**Không ghi đè - KHÔNG:**
```
Lịch tuần: Thứ Bảy = KHÔNG CÓ MẶT
Không có ghi đè cho 2025-01-18
→ Nhân viên không thể làm việc vào thứ Bảy này
```

### 7.4 Cuộc hẹn đa dịch vụ

```
Cuộc hẹn với 2 dịch vụ:
  Dịch vụ 1: 10:00-10:30
  Dịch vụ 2: 10:30-11:00
  Thời gian tổng: 10:00-11:00

Xác thực coi như khối duy nhất:
  Toàn bộ 10:00-11:00 phải nằm trong giờ làm việc của nhân viên
  Không thể vượt qua thời gian nghỉ phép của nhân viên
```

### 7.5 Cuộc hẹn liên tiếp nhau

```
Cuộc hẹn 1: Nhân viên A, 10:00-10:30
Cuộc hẹn 2: Nhân viên A, 10:30-11:00

✓ Hợp lệ (không có khoảng trống, không trùng lặp)

Cuộc hẹn 1: Nhân viên A, 10:00-10:30
Cuộc hẹn 2: Nhân viên A, 10:25-11:00

✗ Không hợp lệ (trùng lặp 5 phút)
```

---

## 8. Xử Lý Múi Giờ

**Quy tắc quan trọng:**
```
Tất cả các thời gian ở múi giờ ĐỊA PHƯƠNG
Tất cả các ngày ở múi giờ ĐỊA PHƯƠNG
Sử dụng UTC midnight (00:00:00 UTC) để tính toán ngày
Không bao giờ áp dụng chuyển đổi múi giờ cho ngày
```

**Ví dụ:**
```
Nhân viên ở Hồ Chí Minh (GMT+7)
Ngày cuộc hẹn: "2025-01-15"

Lưu trữ nội bộ dưới dạng: 2025-01-15T00:00:00.000Z
Tên ngày từ UTC midnight này = Thứ Tư
Sử dụng lịch Thứ Tư từ template tuần

KHÔNG CHUYỂN ĐỔI MÚI GIỜ!
```

---

## 9. Nhật Ký Kiểm Tra

### 9.1 Cần ghi nhật ký cái gì

```
✓ Những thay đổi về lịch tuần của nhân viên
  - Giá trị cũ, giá trị mới, dấu thời gian, người thay đổi
  
✓ Những thay đổi về ghi đè theo ngày
  - Giá trị cũ, giá trị mới, dấu thời gian, người thay đổi
  
✓ Những lần đặt lịch cuộc hẹn thất bại (lỗi xác thực)
  - Nhân viên, ngày, thời gian, lý do, dấu thời gian
  
✓ Cuộc hẹn thành công
  - Nhân viên, ngày, thời gian, dịch vụ, dấu thời gian
```

### 9.2 Báo cáo kinh doanh

```
Có thể tạo:
- Tỷ lệ sử dụng nhân viên (% thời gian được đặt lịch so với khả dụng)
- Các ngoại lệ về lịch làm (bao nhiêu ghi đè trên nhân viên mỗi tháng)
- Xung đột về cuộc hẹn (những lần từ chối đặt lịch)
- Thời lượng ca làm trung bình trên mỗi nhân viên
```

---

## 10. Quy Tắc Chuyển Đổi (Từ Theo Ngày Sang Lịch Tuần)

### 10.1 Cho nhân viên mới

```
Tạo với lịch tuần trực tiếp
Không cần các mục theo ngày
```

### 10.2 Cho nhân viên hiện tại (di chuyển dữ liệu)

```
Tùy chọn A: Di chuyển dữ liệu thủ công
  1. Quản trị viên xem xét lịch tuần hiện tại
  2. Trích xuất mô hình phổ biến nhất → lịch tuần
  3. Giữ các ngoại lệ trong ghi đè theo ngày
  4. Xác minh trước khi lưu

Tùy chọn B: Tự động phát hiện
  1. Hệ thống quét các mục theo ngày trong 30 ngày qua
  2. Tìm mô hình lặp lại (ví dụ: Thứ Hai-Thứ Sáu 09:00-17:00)
  3. Tạo lịch tuần từ mô hình
  4. Di chuyển các ngày không khớp sang ghi đè
  5. Quản trị viên xem xét đề xuất trước khi cam kết

Tùy chọn C: Chạy song song
  1. Giữ dữ liệu theo ngày hiện tại
  2. Bắt đầu sử dụng lịch tuần cho cuộc hẹn mới
  3. Loại bỏ dữ liệu cũ theo thời gian
```

---

## 11. Xem Xét Hiệu Suất

### 11.1 Tối Ưu Hóa Truy Vấn

**Khi đặt lịch cuộc hẹn:**
```sql
SELECT staff.id, staff.status, staff.weeklySchedule
FROM staff
WHERE staff.id = ?

SELECT * FROM staffschedule
WHERE staffId = ? AND date = ?

-- Hai truy vấn, không vấn đề N+1
-- Phân tích cú pháp JSON duy nhất cho weeklySchedule
```

### 11.2 Chiến Lược Lưu Trữ Đệm

```javascript
// Lưu trữ đệm lịch tuần trong 1 giờ
CacheKey: `staff:${staffId}:weekly_schedule`
TTL: 3600 giây

// Lưu trữ đệm giờ hoạt động của cửa hàng trong 1 ngày
CacheKey: `store:operating_hours`
TTL: 86400 giây

// Vô hiệu hóa khi thay đổi
  UPDATE staff.weeklySchedule
  → Xóa bộ nhớ đệm cho nhân viên đó
  → Xóa bộ nhớ đệm xung đột cuộc hẹn
```

---

## 12. Danh Sách Kiểm Tra Thử Nghiệm

### 12.1 Thử Nghiệm Đơn Vị

- [ ] validateWeeklySchedule() chấp nhận cấu trúc hợp lệ
- [ ] validateWeeklySchedule() từ chối các ngày bị thiếu
- [ ] validateWeeklySchedule() từ chối thời gian không hợp lệ
- [ ] validateWeeklySchedule() từ chối thời gian nghỉ nằm ngoài ca
- [ ] resolveDaySchedule() trả về ghi đè khi hiện tại
- [ ] resolveDaySchedule() trả về lịch tuần khi không có ghi đè
- [ ] resolveDaySchedule() trả về null khi không có lịch
- [ ] dayNameFromDateStr() trả về tên ngày chính xác

### 12.2 Thử Nghiệm Tích Hợp

- [ ] Tạo nhân viên với lịch tuần → lưu trữ chính xác
- [ ] Cập nhật lịch tuần của nhân viên → lưu trữ chính xác
- [ ] Tạo ghi đè → có ưu tiên trên lịch tuần
- [ ] Xóa ghi đè → sử dụng lịch tuần lại
- [ ] Đặt lịch cuộc hẹn sử dụng lịch tuần → xác thực chính xác
- [ ] Đặt lịch cuộc hẹn sử dụng ghi đè → xác thực chính xác
- [ ] Cuộc hẹn ngoài giờ làm việc → bị từ chối
- [ ] Cuộc hẹn trùng với thời gian nghỉ → bị từ chối

### 12.3 Thử Nghiệm Trường Hợp Biên

- [ ] Nhân viên không có weeklySchedule (dữ liệu cũ)
- [ ] Nhân viên chỉ có ghi đè, không có lịch tuần
- [ ] Ngày nghỉ trong lịch tuần, nhưng ghi đè để làm việc → hoạt động
- [ ] Ghi đè ngày nghỉ → chặn tất cả cuộc hẹn
- [ ] Thời gian kết thúc 23:59 → hoạt động chính xác
- [ ] Trường hợp biên nửa đêm → được xử lý chính xác
- [ ] Cuộc hẹn 1 phút → xác thực chính xác
- [ ] Cuộc hẹn 8 giờ → xác thực chính xác

---

## 13. Hợp Đồng API

### 13.1 Tạo/Cập Nhật Nhân Viên

**Yêu cầu:**
```json
{
  "name": "Nguyễn Thị Hoa",
  "role": "Tuyên Bố Cao Cấp",
  "status": "active",
  "weeklySchedule": {
    "monday": {
      "active": true,
      "startTime": "09:00",
      "endTime": "17:00",
      "breakStart": "12:00",
      "breakEnd": "13:00",
      "station": "Bàn 1"
    },
    "tuesday": {...},
    ...
  },
  "schedule": {
    "date": "2025-01-15",
    "startTime": "14:00",
    "endTime": "22:00",
    "isDayOff": false
  }
}
```

**Phản Hồi:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Nguyễn Thị Hoa",
    "weeklySchedule": {...},
    "schedules": [
      {
        "id": 1,
        "date": "2025-01-15",
        "startTime": "14:00",
        "endTime": "22:00",
        ...
      }
    ]
  }
}
```

**Phản Hồi Lỗi:**
```json
{
  "success": false,
  "message": "Lỗi lịch tuần: thứ hai.endTime phải sau startTime"
}
```

### 13.2 Đặt Lịch Cuộc Hẹn

**Xác thực nội bộ:**
```
1. Phân giải staff.weeklySchedule[tênNgày]
   HOẶC ghi đè cho ngày đó
   
2. Xác thực thời gian đặt lịch với lịch đã xác định

3. Kiểm tra không có xung đột

4. Lưu trữ cuộc hẹn
```

---

## 14. Tóm Tắt

**Trước Đây (Mô Hình Cũ):**
- ❌ Thiết lập lịch mỗi ngày (365 mục/năm cho mỗi nhân viên)
- ❌ Khó bảo trì
- ❌ Dễ xảy ra lỗi (các ngày bị thiếu)
- ❌ Truy vấn chậm (nhiều mục theo ngày cần kiểm tra)

**Sau Đây (Mô Hình Mới):**
- ✅ Thiết lập một lần mỗi tuần (7 mục tổng cộng cho mỗi nhân viên)
- ✅ Dễ bảo trì
- ✅ Ít lỗi hơn
- ✅ Truy vấn nhanh (trường JSON duy nhất)
- ✅ Ghi đè linh hoạt cho các ngoại lệ
- ✅ Tương thích ngược

**Nguyên tắc chính:**
```
Lịch tuần = hành vi mặc định
Ghi đè theo ngày = chỉ ngoại lệ
```

Điều này làm cho hệ thống trực quan và hiệu quả cho các nhu cầu kinh doanh spa/dịch vụ điển hình.
