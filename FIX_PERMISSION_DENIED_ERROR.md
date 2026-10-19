# 🔧 Fix Lỗi "permission-denied" Khi Logout

## ❌ Lỗi Console

```
[2026-10-19T11:44:01.794Z] @firebase/firestore: Firestore (13.0.0):
Uncaught Error in snapshot listener: FirebaseError: [code=permission-denied]:
Missing or insufficient permissions.
```

---

## 🔍 Nguyên Nhân

### Vấn đề:

1. **Firestore Rules** yêu cầu user phải **authenticated** (`request.auth != null`) để đọc dữ liệu
2. Khi **logout**, `currentUser` → `null` và `request.auth` → `null`
3. Nhưng **realtime listener** cho **milestones** vẫn đang chạy (không bị cleanup)
4. Listener cố gắng đọc Firestore → **Bị từ chối** vì không có authentication

### Code gây lỗi:

```typescript
// ❌ SAI: Dependency array []
useEffect(() => {
  const courseId = "course_2024_2025";

  // Không check currentUser → Subscribe ngay cả khi logout
  const unsubscribe = milestoneService.subscribeToCourseMilestones(
    courseId,
    (updatedMilestones) => {
      setMilestones(updatedMilestones);
    },
  );

  return () => unsubscribe();
}, []); // ← Chỉ chạy 1 lần khi mount, không cleanup khi logout!
```

**Vấn đề:**

- `useEffect` với dependency `[]` chỉ chạy **1 lần** khi component mount
- Khi user logout → `currentUser = null`
- Nhưng `useEffect` **không re-run** → Listener **không cleanup**
- Listener vẫn tiếp tục listen → Gọi Firestore mà không có auth → **permission-denied**

---

## ✅ Giải Pháp

### Fix: Thêm điều kiện check auth và dependency

```typescript
// ✅ ĐÚNG: Dependency [currentUser]
useEffect(() => {
  // Check authentication trước khi subscribe
  if (!currentUser) {
    setMilestones([]);
    return; // Không subscribe nếu chưa login
  }

  const courseId = "course_2024_2025";

  console.log("🔄 Subscribing to milestones for course:", courseId);

  const unsubscribe = milestoneService.subscribeToCourseMilestones(
    courseId,
    (updatedMilestones) => {
      console.log("🎯 Milestones updated:", updatedMilestones.length);
      setMilestones(updatedMilestones);
    },
  );

  return () => {
    console.log("🔌 Unsubscribing from milestones");
    unsubscribe();
  };
}, [currentUser]); // ← Re-run khi currentUser thay đổi (login/logout)
```

**Cách hoạt động:**

1. **Khi login**: `currentUser` → user object
   - `useEffect` chạy → Subscribe listener ✅
2. **Khi logout**: `currentUser` → `null`
   - `useEffect` cleanup → Unsubscribe listener ✅
   - `useEffect` re-run → Thấy `!currentUser` → Return sớm → Không subscribe ✅

---

## 📊 So Sánh

### Trước khi fix:

```
[User login]
      ↓
[useEffect runs] → Subscribe milestones listener
      ↓
[User uses app]
      ↓
[User logout] → currentUser = null
      ↓
❌ [useEffect KHÔNG re-run vì dependency []]
❌ [Listener VẪN đang chạy]
❌ [Listener gọi Firestore mà không có auth]
      ↓
❌ ERROR: permission-denied
```

### Sau khi fix:

```
[User login]
      ↓
[useEffect runs] → currentUser exists → Subscribe milestones listener
      ↓
[User uses app]
      ↓
[User logout] → currentUser = null
      ↓
✅ [useEffect RE-RUN vì dependency [currentUser] thay đổi]
✅ [Cleanup function chạy → Unsubscribe listener]
✅ [useEffect re-run → Thấy !currentUser → Return → Không subscribe]
      ↓
✅ NO ERROR
```

---

## 🔍 Các Listener Khác

### Kiểm tra tất cả listeners trong AppContext:

#### 1. ✅ Tasks Listener (ĐÃ ĐÚNG):

```typescript
useEffect(() => {
  if (!currentUser?.teamId) {
    setTasks([]);
    return; // ← Có check auth
  }

  const unsubscribe = taskService.subscribeToGroupTasks(...);
  return () => unsubscribe();
}, [currentUser?.teamId]); // ← Có dependency
```

**Status:** ✅ OK - Có check auth + dependency đúng

---

#### 2. ❌ → ✅ Milestones Listener (VỪA SỬA):

```typescript
// Trước:
useEffect(() => {
  const unsubscribe = milestoneService.subscribeToCourseMilestones(...);
  return () => unsubscribe();
}, []); // ❌ Không có dependency

// Sau:
useEffect(() => {
  if (!currentUser) {
    setMilestones([]);
    return; // ✅ Có check auth
  }
  const unsubscribe = milestoneService.subscribeToCourseMilestones(...);
  return () => unsubscribe();
}, [currentUser]); // ✅ Có dependency
```

**Status:** ✅ FIXED

---

#### 3. ✅ Applications Listener (ĐÃ ĐÚNG):

```typescript
useEffect(() => {
  if (!currentUser?.teamId) {
    setApplicants([]);
    return; // ← Có check auth
  }

  const unsubscribe = applicationService.subscribeToGroupApplications(...);
  return () => unsubscribe();
}, [currentUser?.teamId]); // ← Có dependency
```

**Status:** ✅ OK

---

#### 4. ✅ Peer Reviews Listener (ĐÃ ĐÚNG):

```typescript
useEffect(() => {
  if (!currentUser?.teamId) {
    setPeerReviews([]);
    return; // ← Có check auth
  }

  const unsubscribe = peerReviewService.subscribeToGroupPeerReviews(...);
  return () => unsubscribe();
}, [currentUser?.teamId]); // ← Có dependency
```

**Status:** ✅ OK

---

## 🧪 Cách Kiểm Tra Fix

### Test 1: Đăng xuất không còn lỗi

**Bước thực hiện:**

1. Đăng nhập bất kỳ user nào
2. Mở Console (F12)
3. Clear console
4. Bấm nút **Đăng xuất**
5. Kiểm tra console

**Kết quả mong đợi:**

```
✅ 🔌 Unsubscribing from tasks
✅ 🔌 Unsubscribing from milestones
✅ 🔌 Unsubscribing from applications
✅ 🔌 Unsubscribing from peer reviews
❌ KHÔNG có lỗi "permission-denied"
```

---

### Test 2: Đăng nhập lại sau khi logout

**Bước thực hiện:**

1. Đăng xuất (đã test ở Test 1)
2. Đăng nhập lại
3. Kiểm tra console

**Kết quả mong đợi:**

```
✅ 🔄 Subscribing to tasks for group: nhom_04
✅ 🔄 Subscribing to milestones for course: course_2024_2025
✅ 🔄 Subscribing to applications for group: nhom_04
✅ 🔄 Subscribing to peer reviews for group: nhom_04 milestone: m2
✅ 📋 Tasks updated: X
✅ 🎯 Milestones updated: X
✅ 📨 Applications updated: X
✅ ⭐ Peer reviews updated: X
```

---

### Test 3: Chuyển tab trong lúc logout

**Bước thực hiện:**

1. Đăng nhập
2. Vào trang **Milestones**
3. Bấm **Đăng xuất**
4. Kiểm tra console

**Kết quả mong đợi:**

```
✅ Không có lỗi permission-denied
✅ Quay về Landing page
✅ Data cleared (milestones = [])
```

---

## 📝 Best Practice: useEffect với Firestore Listeners

### Pattern chuẩn:

```typescript
useEffect(() => {
  // 1. ALWAYS check authentication first
  if (!currentUser) {
    setData([]);
    return;
  }

  // 2. Subscribe to Firestore
  const unsubscribe = someService.subscribe(...);

  // 3. Cleanup function
  return () => {
    unsubscribe();
  };
}, [currentUser]); // 4. Dependency includes currentUser
```

### ❌ Anti-patterns (TRÁNh):

```typescript
// ❌ BAD: Không check auth
useEffect(() => {
  const unsubscribe = subscribe(...);
  return () => unsubscribe();
}, [currentUser]);

// ❌ BAD: Không có dependency
useEffect(() => {
  if (!currentUser) return;
  const unsubscribe = subscribe(...);
  return () => unsubscribe();
}, []); // ← Listener không cleanup khi logout

// ❌ BAD: Không cleanup
useEffect(() => {
  if (!currentUser) return;
  const unsubscribe = subscribe(...);
  // Missing: return () => unsubscribe();
}, [currentUser]);
```

---

## ✅ Kết Luận

**Đã fix:**

- ✅ Thêm check `if (!currentUser)` vào milestones listener
- ✅ Thay đổi dependency từ `[]` thành `[currentUser]`
- ✅ Listener sẽ tự động cleanup khi logout

**Kết quả:**

- ✅ Không còn lỗi "permission-denied" khi logout
- ✅ App hoạt động ổn định hơn
- ✅ Tuân thủ best practice React + Firebase

---

**Date:** 2024-01-XX  
**File modified:** `src/context/AppContext.tsx`  
**Lines changed:** Line ~264-279
