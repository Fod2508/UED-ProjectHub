# 🧪 Test Firestore Realtime Sync - Quick Guide

## 🎯 Mục tiêu test

Kiểm tra xem tasks và milestones có đồng bộ realtime qua Firestore hay không.

---

## ✅ Test 1: Import Demo Data

### Các bước:

1. **Đăng ký tài khoản mới** (nếu chưa có)
   - Email: `student1@ued.udn.vn`
   - Password: `student123`
   - Name: `Sinh Viên 1`
   - Mã SV: `211150530001`
   - Lớp: `21CNTT1`

2. **Login thành công**
   - Thấy popup "Chào mừng bạn đến với UED-ProjectHub!"

3. **Click "Import dữ liệu demo"**
   - Đợi 2-3 giây
   - Page tự reload

4. **Verify**
   - Vào Kanban view → Thấy 10 tasks
   - Vào Milestones view → Thấy 4 milestones

### ✅ Expected Console Logs:

```
🔄 Subscribing to tasks for group: nhom_04
🔄 Migrating initial data...
📅 Migrating schedule matrix...
🎯 Migrating milestones...
📋 Migrating tasks...
✅ Migration complete!
📋 Tasks updated: 10
🎯 Milestones updated: 4
```

---

## ✅ Test 2: Create Task (Single User)

### Các bước:

1. Vào **Kanban View**
2. Click **"+ Tạo công việc mới"**
3. Điền form:
   ```
   Tiêu đề:       Test Task từ Firestore
   Mô tả:         Testing realtime sync
   Tag:           Testing
   Người thực hiện: Sinh Viên 1
   Hạn:           23/01/2025
   Trạng thái:    Mới tạo
   ```
4. Click **"Tạo"**

### ✅ Expected Results:

- Toast: "Đã tạo tác vụ mới: Test Task từ Firestore (#TSK-11)"
- Task xuất hiện trong cột "Mới tạo"
- Console log: "📋 Tasks updated: 11"

### 🔍 Verify in Firestore:

1. Firebase Console → Firestore → `tasks` collection
2. Tìm document mới nhất
3. Check fields:
   ```
   title: "Test Task từ Firestore"
   code: "#TSK-11"
   groupId: "nhom_04"
   createdBy: "{your-user-id}"
   createdAt: {timestamp}
   ```

---

## ✅ Test 3: Move Task (Drag & Drop)

### Các bước:

1. Kéo task **"Test Task từ Firestore"**
2. Từ cột "Mới tạo" → Thả vào cột "Đang thực hiện"

### ✅ Expected Results:

- Task di chuyển sang cột mới
- Console log: "📋 Tasks updated: 11"
- Firestore document updated: `status: "Đang thực hiện"`

---

## ✅ Test 4: Update Task

### Các bước:

1. Click vào task card
2. Sửa tiêu đề thành: "Test Task UPDATED"
3. Save

### ✅ Expected Results:

- Task title thay đổi
- Console log: "📋 Tasks updated: 11"
- Firestore: `title: "Test Task UPDATED"`

---

## ✅ Test 5: Delete Task

### Các bước:

1. Click vào task card
2. Click nút **"Xóa"**
3. Confirm

### ✅ Expected Results:

- Task biến mất
- Toast: "Đã xóa tác vụ."
- Console log: "📋 Tasks updated: 10"
- Firestore document bị xóa

---

## 🔥 Test 6: Realtime Sync (Multi-user) - QUAN TRỌNG NHẤT!

### Setup:

**Mở 2 browsers khác nhau:**

- Browser A: Chrome
- Browser B: Edge (hoặc Chrome Incognito)

### Các bước:

#### 1. Login cùng tài khoản

- **Browser A:** Login `student1@ued.udn.vn`
- **Browser B:** Login `student1@ued.udn.vn` (cùng account)
- Cả 2 đều vào **Kanban View**

#### 2. Test tạo task

- **Browser A:** Tạo task mới "Task from Browser A"
- **Browser B:** **Tự động thấy task mới** (không cần refresh!)

### ✅ Expected Results:

**Browser A:**

```
Toast: "Đã tạo tác vụ mới: Task from Browser A (#TSK-11)"
Console: "📋 Tasks updated: 11"
```

**Browser B (realtime sync):**

```
Console: "📋 Tasks updated: 11"
Task "Task from Browser A" xuất hiện NGAY LẬP TỨC (< 1 giây)
```

#### 3. Test move task

- **Browser A:** Kéo task sang "Đang thực hiện"
- **Browser B:** **Thấy task di chuyển realtime**

#### 4. Test update task

- **Browser A:** Sửa title task
- **Browser B:** **Thấy title thay đổi realtime**

#### 5. Test delete task

- **Browser A:** Xóa task
- **Browser B:** **Thấy task biến mất realtime**

---

## ✅ Test 7: Milestone Realtime Sync

### Các bước:

1. **Browser A:** Switch role → Giảng viên
2. Vào **Milestones View**
3. Click **"+ Thêm cột mốc mới"**
4. Điền:
   ```
   Tên:          Cột mốc 5: Test Realtime
   Giai đoạn:    Testing phase
   Sản phẩm:     Test deliverables
   Hạn:          31/01/2025
   Trọng số:     10
   ```
5. Click **"Thêm"**

### ✅ Expected Results:

**Browser A:**

- Toast: "Đã thêm cột mốc mới."
- Console: "🎯 Milestones updated: 5"

**Browser B:**

- Console: "🎯 Milestones updated: 5"
- Milestone mới xuất hiện NGAY LẬP TỨC

---

## 🔍 Debug Checklist

Nếu realtime sync không hoạt động, check:

### 1. Console Logs

```javascript
// Mở F12 → Console
// Phải thấy:
🔄 Subscribing to tasks for group: nhom_04
📋 Tasks updated: X
🔄 Subscribing to milestones for course: course_2024_2025
🎯 Milestones updated: X
```

### 2. Firebase Console

- Vào: https://console.firebase.google.com/u/0/project/ued-projecthub/firestore
- Collection `tasks` → Xem documents
- Collection `milestones` → Xem documents
- Xác nhận data tồn tại

### 3. Network Tab

- F12 → Network tab
- Filter: `firestore`
- Thấy requests đến Firestore API

### 4. User Info

```javascript
// Console:
console.log(currentUser);

// Expected:
{
  id: "xyz123...",
  teamId: "nhom_04",  // ← Phải có teamId!
  ...
}
```

### 5. Firestore Rules

- Firebase Console → Firestore → Rules
- Xác nhận: `allow read, write: if true;` (test mode)

---

## ⚠️ Common Issues

### Issue 1: "📋 Tasks updated: 0"

**Cause:** Group chưa có tasks

**Fix:**

- Import demo data
- Hoặc tạo task mới

---

### Issue 2: Realtime không sync

**Cause:** 2 browsers login với accounts khác nhau (khác teamId)

**Fix:**

- Xác nhận cả 2 browsers login **CÙNG account**
- Check `currentUser.teamId` giống nhau

---

### Issue 3: "Missing or insufficient permissions"

**Cause:** Firestore rules quá strict

**Fix:**

1. Firebase Console → Firestore → Rules
2. Set test mode:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Publish

---

### Issue 4: Task không xuất hiện sau tạo

**Cause:** Realtime listener chưa kịp trigger hoặc lỗi Firestore

**Check:**

1. Console có log "📋 Tasks updated"?
2. Firestore document đã tạo chưa?
3. Refresh page thử

**Fix:** Đợi 1-2 giây hoặc refresh page

---

## 📊 Success Criteria

- [x] ✅ Import demo data thành công
- [x] ✅ Tạo task mới → Firestore có document
- [x] ✅ Move task → Firestore update
- [x] ✅ Update task → Firestore update
- [x] ✅ Delete task → Firestore xóa document
- [x] ✅ **Multi-user realtime sync hoạt động** ← QUAN TRỌNG!
- [x] ✅ Console logs đầy đủ
- [x] ✅ Milestone realtime sync hoạt động

---

## 🎯 Summary

**What you just tested:**

1. ✅ Firestore CRUD operations (Create, Read, Update, Delete)
2. ✅ Realtime sync với `onSnapshot`
3. ✅ Multi-user collaboration (2 browsers cùng thấy changes)
4. ✅ Data persistence (không mất sau refresh)

**What's working:**

- ✅ Tasks → Firestore
- ✅ Milestones → Firestore
- ✅ Realtime updates
- ✅ Auto-sync giữa users

**What's NOT working yet:**

- ⚠️ Applications vẫn localStorage
- ⚠️ Peer Reviews vẫn localStorage
- ⚠️ Security rules chưa có (test mode)

---

**Ready to test?** Start with Test 1! 🚀

**Questions?** Check console logs (F12) for debug info.
