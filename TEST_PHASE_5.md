# 🧪 Test Instructions - Phase 5: Applications & Peer Reviews

## 🎯 Mục tiêu Testing

Kiểm tra tích hợp Firestore cho **Applications** và **Peer Reviews** với realtime sync và anonymization.

---

## 🔧 Chuẩn bị

### 1. Đảm bảo Firebase đã được cấu hình

```bash
# Check .env file
cat .env

# Should contain:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=ued-projecthub
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 2. Khởi động Development Server

```bash
npm run dev
```

### 3. Mở Firebase Console

- URL: https://console.firebase.google.com/project/ued-projecthub
- Tab 1: **Authentication** → Users
- Tab 2: **Firestore Database** → Data
- Tab 3: Ứng dụng (http://localhost:5173)

---

## ✅ Test Cases

### Test 1: Applications - Send Join Request (Gửi yêu cầu tham gia nhóm)

**Scenario:** Sinh viên gửi yêu cầu tham gia nhóm đồ án

**Steps:**

1. Đăng nhập với tài khoản sinh viên (email/password)
2. Chuyển đến màn hình **Matchmaking** (Tìm nhóm)
3. Click nút "Gửi yêu cầu tham gia nhóm" hoặc tương tự
4. Điền thông tin:
   - Skills: React, TypeScript, Figma
   - Note: "Em xin phép tham gia nhóm để học tập kinh nghiệm"
5. Click "Gửi yêu cầu"

**Expected Results:**

- ✅ Toast hiện: "Đã gửi yêu cầu tham gia nhóm thành công! Trạng thái: Chờ duyệt (Pending)."
- ✅ Console log: `📨 Applications updated: 1`
- ✅ Firebase Console → `applications` collection có document mới với:
  - `applicantId`: User ID hiện tại
  - `targetGroupId`: "nhom_04"
  - `status`: "pending"
  - `appliedAt`: Timestamp hiện tại
  - Các field khác: name, studentId, skills, note...

---

### Test 2: Applications - Realtime Sync (Multiple Users)

**Scenario:** Kiểm tra realtime sync khi có user khác gửi application

**Steps:**

1. **User 1** (Group Leader): Đăng nhập và mở màn hình "Review Applicants"
2. **User 2** (Applicant): Đăng nhập ở tab/browser khác
3. **User 2**: Gửi yêu cầu tham gia nhóm (như Test 1)
4. **User 1**: Quan sát màn hình (KHÔNG refresh)

**Expected Results:**

- ✅ **User 1** console log: `📨 Applications updated: X` (X tăng lên)
- ✅ **User 1** UI tự động hiện application mới (< 1 giây)
- ✅ Không cần refresh trang

---

### Test 3: Applications - Accept Applicant

**Scenario:** Trưởng nhóm chấp nhận hồ sơ ứng tuyển

**Steps:**

1. Đăng nhập với tài khoản Group Leader (có `isGroupLeader: true`)
2. Mở màn hình "Review Applicants" (hoặc "Xem hồ sơ ứng tuyển")
3. Chọn 1 application có status "pending"
4. Click nút "Chấp nhận" / "Accept"

**Expected Results:**

- ✅ Toast: "Đã chấp nhận thành viên vào Nhóm 04! Sĩ số nhóm đã được cập nhật."
- ✅ Console log: `📨 Applications updated: X`
- ✅ Firebase Console → application document có `status: "accepted"` và `reviewedAt: Timestamp`
- ✅ UI cập nhật status thành "Accepted" (realtime)

---

### Test 4: Applications - Reject Applicant

**Scenario:** Trưởng nhóm từ chối hồ sơ ứng tuyển

**Steps:**

1. Đăng nhập với tài khoản Group Leader
2. Mở màn hình "Review Applicants"
3. Chọn 1 application có status "pending"
4. Click nút "Từ chối" / "Reject"

**Expected Results:**

- ✅ Toast: "Đã từ chối hồ sơ ứng tuyển."
- ✅ Console log: `📨 Applications updated: X`
- ✅ Firebase Console → application document có `status: "rejected"` và `reviewedAt: Timestamp`
- ✅ UI cập nhật status thành "Rejected" (realtime)

---

### Test 5: Peer Reviews - Save Draft

**Scenario:** Sinh viên lưu bản nháp đánh giá chéo

**Steps:**

1. Đăng nhập với tài khoản sinh viên (có `teamId: "nhom_04"`)
2. Chuyển đến màn hình **Peer Review** (Đánh giá chéo)
3. Chọn 1 thành viên để đánh giá (ví dụ: "Trần Thu Hà")
4. Điền điểm:
   - C1 (Mức độ & tiến độ): 4
   - C2 (Chất lượng & kỹ thuật): 5
   - C3 (Thái độ & teamwork): 4
   - Comment: "Bạn làm việc rất tốt, tiến độ ổn định"
5. Click nút "Lưu nháp" / "Save Draft"

**Expected Results:**

- ✅ Toast: "Đã lưu bản nháp đánh giá chéo."
- ✅ Console log: `⭐ Peer reviews updated: X`
- ✅ Firebase Console → `peerReviews` collection có document:
  - `reviewId`: `nhom_04_m2_{reviewerHash}_{targetHash}`
  - `groupId`: "nhom_04"
  - `milestoneId`: "m2"
  - `reviewerIdHash`: Hash string (ví dụ: "anon_abc123")
  - `targetIdHash`: Hash string (ví dụ: "anon_def456")
  - `reviewerId`: Real user ID (chỉ giảng viên thấy)
  - `targetId`: Real target ID
  - `c1`, `c2`, `c3`: Điểm số đã nhập
  - `comment`: Bình luận
  - `status`: "evaluating"
  - `updatedAt`: Timestamp

---

### Test 6: Peer Reviews - Submit and Next

**Scenario:** Sinh viên nộp đánh giá và chuyển sang thành viên tiếp theo

**Steps:**

1. Tiếp tục từ Test 5 (đã lưu draft)
2. Kiểm tra lại điểm số và comment
3. Click nút "Nộp và tiếp tục" / "Submit and Next"

**Expected Results:**

- ✅ Toast: "Đã lưu đánh giá! Đang chuyển sang thành viên tiếp theo."
- ✅ Console log: `⭐ Peer reviews updated: X`
- ✅ Firebase Console → peer review document có:
  - `status`: "done"
  - `submittedAt`: Timestamp
- ✅ UI tự động chuyển sang thành viên tiếp theo để đánh giá
- ✅ Nếu đánh giá hết tất cả thành viên:
  - Toast: "🎉 Bạn đã hoàn thành toàn bộ đánh giá chéo cho các thành viên trong nhóm!"

---

### Test 7: Peer Reviews - Anonymization Check

**Scenario:** Kiểm tra tính năng ẩn danh trong đánh giá chéo

**Steps:**

1. Thực hiện Test 5 hoặc Test 6 để tạo peer review
2. Mở Firebase Console → `peerReviews` collection
3. Chọn 1 document vừa tạo

**Expected Results:**

- ✅ Document có các field:
  - `reviewerIdHash`: String dạng "anon_xxxxx" (hash)
  - `targetIdHash`: String dạng "anon_yyyyy" (hash)
  - `reviewerId`: Real user ID (visible for security rules check)
  - `targetId`: Real target ID (visible for security rules check)
- ✅ Hash function tạo consistent hash:
  - Cùng reviewer + target → Cùng hash
  - Khác reviewer hoặc target → Khác hash

**Test Hash Consistency:**

```javascript
// Console test
const hash1 = generateAnonymousHash("user1", "target1", "salt");
const hash2 = generateAnonymousHash("user1", "target1", "salt");
console.log(hash1 === hash2); // Should be true

const hash3 = generateAnonymousHash("user2", "target1", "salt");
console.log(hash1 === hash3); // Should be false
```

---

### Test 8: Peer Reviews - Realtime Sync (Multiple Reviewers)

**Scenario:** Nhiều sinh viên đánh giá cùng lúc

**Steps:**

1. **User 1**: Đăng nhập và mở Peer Review màn hình
2. **User 2**: Đăng nhập ở tab/browser khác, mở Peer Review
3. **User 1**: Submit đánh giá cho "Trần Thu Hà"
4. **User 2**: Quan sát console và UI (KHÔNG refresh)

**Expected Results:**

- ✅ **User 2** console log: `⭐ Peer reviews updated: X`
- ✅ **User 2** UI có thể thấy review count tăng (nếu có UI hiện tổng số reviews)
- ✅ Realtime sync < 1 giây
- ✅ Không conflict giữa 2 users

---

### Test 9: Console Logs Debugging

**Scenario:** Kiểm tra console logs cho debugging

**Steps:**

1. Đăng nhập vào hệ thống
2. Mở DevTools → Console
3. Thực hiện các actions (send application, save peer review, etc.)

**Expected Console Logs:**

**Applications:**

```
🔄 Subscribing to applications for group: nhom_04
📨 Applications updated: 1
📨 Applications updated: 2
🔌 Unsubscribing from applications
```

**Peer Reviews:**

```
🔄 Subscribing to peer reviews for group: nhom_04 milestone: m2
⭐ Peer reviews updated: 0
⭐ Peer reviews updated: 1
⭐ Peer reviews updated: 2
🔌 Unsubscribing from peer reviews
```

---

### Test 10: Logout and Cleanup

**Scenario:** Kiểm tra cleanup khi logout

**Steps:**

1. Đăng nhập và đợi subscriptions load (console logs xuất hiện)
2. Click "Đăng xuất" / "Logout"

**Expected Results:**

- ✅ Console logs:
  - `🔌 Unsubscribing from applications`
  - `🔌 Unsubscribing from peer reviews`
- ✅ State reset về `[]`:
  - `applicants: []`
  - `peerReviews: []`
- ✅ Không còn realtime listeners (check Firebase Console → Usage)

---

## 🐛 Error Handling Tests

### Test 11: No TeamId - Applications

**Scenario:** User chưa có teamId (chưa tham gia nhóm nào)

**Steps:**

1. Tạo user mới không có `teamId` field
2. Đăng nhập
3. Console logs

**Expected Results:**

- ✅ Console: `🔄 Subscribing to applications for group: undefined`
- ✅ `applicants` set về `[]`
- ✅ KHÔNG có lỗi crash

---

### Test 12: No TeamId - Peer Reviews

**Scenario:** User chưa có teamId

**Steps:**

1. Tạo user mới không có `teamId` field
2. Đăng nhập
3. Mở Peer Review màn hình

**Expected Results:**

- ✅ Console: `🔄 Subscribing to peer reviews for group: undefined milestone: m2`
- ✅ `peerReviews` set về `[]`
- ✅ Toast: "Bạn chưa thuộc nhóm nào." (nếu cố gắng save review)

---

### Test 13: Network Error Simulation

**Scenario:** Mất kết nối Internet

**Steps:**

1. Đăng nhập và load dữ liệu
2. Mở DevTools → Network tab → Throttling: Offline
3. Thử accept application hoặc submit peer review

**Expected Results:**

- ✅ Toast: "Lỗi khi chấp nhận ứng viên." hoặc "Lỗi khi nộp đánh giá chéo."
- ✅ Console error log hiện (không crash app)
- ✅ Khi online lại, realtime sync tự động phục hồi

---

## 📊 Performance Tests

### Test 14: Large Dataset Performance

**Scenario:** Kiểm tra performance với nhiều applications/reviews

**Steps:**

1. Tạo 50 applications bằng script hoặc Firebase Console
2. Đăng nhập và load màn hình Applications
3. Đo thời gian load

**Expected Results:**

- ✅ Load time < 2 giây (50 items)
- ✅ UI không bị lag khi scroll
- ✅ Realtime updates vẫn mượt

---

### Test 15: Subscription Memory Leak

**Scenario:** Kiểm tra memory leak khi switch screens nhiều lần

**Steps:**

1. Đăng nhập
2. Lặp lại 10 lần:
   - Chuyển đến màn hình Applications
   - Chuyển đến màn hình Peer Reviews
   - Chuyển đến màn hình Dashboard
3. Mở DevTools → Memory → Take Heap Snapshot

**Expected Results:**

- ✅ Console logs có "Unsubscribing" sau mỗi lần chuyển screen
- ✅ Memory không tăng đột biến
- ✅ Không có dangling listeners

---

## ✅ Checklist Hoàn thành Phase 5

- [ ] Test 1: Send Join Request ✅
- [ ] Test 2: Applications Realtime Sync ✅
- [ ] Test 3: Accept Applicant ✅
- [ ] Test 4: Reject Applicant ✅
- [ ] Test 5: Peer Reviews Save Draft ✅
- [ ] Test 6: Peer Reviews Submit and Next ✅
- [ ] Test 7: Anonymization Check ✅
- [ ] Test 8: Peer Reviews Realtime Sync ✅
- [ ] Test 9: Console Logs Debugging ✅
- [ ] Test 10: Logout Cleanup ✅
- [ ] Test 11: No TeamId - Applications ✅
- [ ] Test 12: No TeamId - Peer Reviews ✅
- [ ] Test 13: Network Error Simulation ✅
- [ ] Test 14: Large Dataset Performance ✅
- [ ] Test 15: Subscription Memory Leak ✅

---

## 🚨 Known Limitations (Phase 5)

1. **Security Rules:** Hiện tại đang ở test mode (public read/write)
   - **Risk:** Anyone có thể read/write mọi data
   - **Fix:** Phase 6 sẽ implement production security rules

2. **Milestone Hardcoded:** Peer reviews hiện chỉ dùng `milestoneId: "m2"`
   - **Risk:** Không dynamic theo milestone selection
   - **Fix:** Sau Phase 6 có thể thêm milestone selector

3. **No Offline Support:** Chưa có `enableIndexedDbPersistence()`
   - **Risk:** Mất kết nối → Mất data chưa sync
   - **Fix:** Phase 6 sẽ enable offline persistence

4. **No Loading States:** Async functions không có loading indicators
   - **Risk:** User không biết operation đang chạy
   - **Fix:** Phase 6 sẽ thêm loading skeletons

---

## 📝 Testing Notes

- Tất cả tests nên pass sau khi Phase 5 hoàn thành
- Console logs (`🔄`, `📨`, `⭐`, `🔌`) giúp debug realtime flows
- Firebase Console là best friend cho việc verify data structure
- Realtime sync timeout: < 1 giây (local), < 3 giây (production với slow network)

**Happy Testing! 🎉**
