# ✅ Firebase Integration - Phase 3 & 4 Complete

## 🎉 Đã Hoàn Thành

### ✅ Phase 3: Database Schema & Service Layer

- [x] Tạo `taskService.ts` - CRUD operations cho tasks
- [x] Tạo `milestoneService.ts` - CRUD operations cho milestones
- [x] Tạo `applicationService.ts` - CRUD operations cho applications
- [x] Tạo `userService.ts` - User profile management
- [x] Tạo `services/index.ts` - Export tất cả services
- [x] Realtime listeners với `onSnapshot`

### ✅ Phase 4: Migrate LocalStorage → Firestore

- [x] Update `AppContext.tsx`:
  - Import taskService, milestoneService
  - Thay đổi tasks state: `useState<KanbanTask[]>([])`
  - Thay đổi milestones state: `useState<Milestone[]>([])`
  - Add useEffect để subscribe realtime tasks
  - Add useEffect để subscribe realtime milestones
  - Update `addTask()` → async với Firestore
  - Update `updateTask()` → async với Firestore
  - Update `deleteTask()` → async với Firestore
  - Update `moveTask()` → async với Firestore
  - Update `addMilestone()` → async với Firestore
  - Update `updateMilestone()` → async với Firestore
- [x] Tạo `DataMigrationPrompt.tsx` component
  - Auto-detect nếu user chưa có data
  - Prompt để import demo data
  - Button "Import dữ liệu demo" và "Bỏ qua"
- [x] Tạo `migrateToFirestore.ts` utility:
  - `migrateInitialDataToFirestore()` - Import INITIAL_TASKS, INITIAL_MILESTONES
  - `hasUserMigratedData()` - Check xem đã có data chưa

- [x] Update `App.tsx`:
  - Import DataMigrationPrompt component
  - Render DataMigrationPrompt trong app workspace

---

## 🔥 Firestore Collections Structure

### 1. **users/** (từ Phase 2)

```typescript
{
  id: string;
  email: string;
  name: string;
  studentId: string;
  className: string;
  role: "student" | "lecturer";
  title: string;
  avatarText: string;
  teamId?: string;
  teamName?: string;
  isGroupLeader: boolean;
  skills: string[];
  scheduleMatrix: FreeScheduleMatrix;
  createdAt: timestamp;
}
```

### 2. **tasks/** (✅ NEW)

```typescript
{
  id: string; // auto-generated
  code: string; // #TSK-01
  title: string;
  description?: string;
  tag: string;
  priority?: string;
  status: TaskStatus;
  dueDate: string;
  assigneeName: string;
  assigneeAvatar: string;
  subtaskCount?: string;
  mergePr?: string;
  lecturerReviewed?: boolean;
  lecturerScore?: number;
  milestoneId?: string;
  groupId: string; // ← nhóm nào
  createdBy: string; // ← userId
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 3. **milestones/** (✅ NEW)

```typescript
{
  id: string; // auto-generated
  name: string;
  phase: string;
  deliverables: string;
  dueDate: string;
  weight: number;
  status: string;
  courseId: string; // ← môn học nào
  createdBy: string; // ← giảng viên userId
  createdAt: timestamp;
  publishedAt: timestamp | null;
}
```

### 4. **applications/** (✅ NEW - Chưa dùng UI)

```typescript
{
  id: string;
  applicantId: string; // userId
  targetGroupId: string;
  status: "pending" | "accepted" | "rejected";
  name: string;
  studentId: string;
  className: string;
  avatarText: string;
  skills: string[];
  matchedSessionsCount: number;
  matchedSessionsDetails: string;
  note: string;
  skillScore: number;
  timeScore: number;
  matchScore: number;
  isTopRecommendation: boolean;
  appliedAt: timestamp;
  reviewedAt?: timestamp;
}
```

---

## 🚀 Service Layer API

### taskService

```typescript
// Create task
await taskService.createTask(taskData, groupId, createdBy);

// Get all tasks for group
const tasks = await taskService.getGroupTasks(groupId);

// Update task
await taskService.updateTask(taskId, updates);

// Delete task
await taskService.deleteTask(taskId);

// Move task status
await taskService.moveTask(taskId, newStatus);

// Subscribe realtime
const unsubscribe = taskService.subscribeToGroupTasks(groupId, (tasks) => {
  setTasks(tasks);
});
```

### milestoneService

```typescript
// Create milestone
await milestoneService.createMilestone(milestoneData, courseId, createdBy);

// Get all milestones for course
const milestones = await milestoneService.getCourseMilestones(courseId);

// Update milestone
await milestoneService.updateMilestone(milestoneId, updates);

// Publish milestones (lock)
await milestoneService.publishMilestones(courseId);

// Subscribe realtime
const unsubscribe = milestoneService.subscribeToCourseMilestones(
  courseId,
  (milestones) => {
    setMilestones(milestones);
  },
);
```

---

## 🔄 Realtime Sync Flow

### User A tạo task mới:

```
1. User A click "Tạo task"
2. Call taskService.createTask()
3. Firestore thêm document mới
4. onSnapshot trigger cho TẤT CẢ users cùng group
5. User B, C, D thấy task mới ngay lập tức
```

### User B cập nhật task status:

```
1. User B kéo task từ "Mới tạo" → "Đang làm"
2. Call taskService.moveTask()
3. Firestore update document
4. onSnapshot trigger
5. User A, C, D thấy task di chuyển realtime
```

---

## 🧪 Test Guide

### Test 1: Import Demo Data

1. Đăng nhập với tài khoản mới
2. Sau khi login, thấy popup "Chào mừng bạn đến với UED-ProjectHub!"
3. Click **"Import dữ liệu demo"**
4. Đợi 2-3 giây
5. Page tự reload

**Expected:**

- ✅ Firestore có 10 tasks trong collection `tasks`
- ✅ Firestore có 4 milestones trong collection `milestones`
- ✅ Dashboard hiển thị 10 tasks
- ✅ Milestones view hiển thị 4 milestones

### Test 2: Create New Task (Firestore)

1. Vào Kanban view
2. Click **"+ Tạo công việc mới"**
3. Điền form:
   - Title: "Test Firestore Task"
   - Tag: "Testing"
   - Status: "Mới tạo"
4. Click **"Tạo"**

**Expected:**

- ✅ Toast success: "Đã tạo tác vụ mới: Test Firestore Task (#TSK-XX)"
- ✅ Task xuất hiện trên Kanban board
- ✅ Firestore có document mới trong `tasks` collection
- ✅ Console log: "📋 Tasks updated: 11"

### Test 3: Move Task (Firestore)

1. Kéo task từ "Mới tạo" → "Đang thực hiện"
2. Thả task

**Expected:**

- ✅ Task di chuyển sang cột mới
- ✅ Firestore document được update
- ✅ Console log: "📋 Tasks updated: 11"

### Test 4: Update Task (Firestore)

1. Click vào task card
2. Sửa title hoặc description
3. Save

**Expected:**

- ✅ Task được cập nhật
- ✅ Firestore document được update
- ✅ Realtime sync hoạt động

### Test 5: Delete Task (Firestore)

1. Click vào task card
2. Click **"Xóa"**
3. Confirm

**Expected:**

- ✅ Task biến mất khỏi board
- ✅ Firestore document bị xóa
- ✅ Toast: "Đã xóa tác vụ."

### Test 6: Realtime Sync (Multi-user)

**Setup:** Mở 2 browser khác nhau (Chrome + Edge) hoặc 2 tabs incognito

1. Browser A: Đăng nhập user A
2. Browser B: Đăng nhập user A (cùng account)
3. Browser A: Tạo task mới
4. Browser B: **Tự động thấy task mới** (không cần refresh!)

**Expected:**

- ✅ Browser B thấy task ngay lập tức (< 1 giây)
- ✅ Console log ở Browser B: "📋 Tasks updated: X"

### Test 7: Create Milestone (Firestore)

1. Switch role sang Giảng viên
2. Vào Milestones view
3. Click **"+ Thêm cột mốc mới"**
4. Điền form
5. Click **"Thêm"**

**Expected:**

- ✅ Toast success
- ✅ Milestone xuất hiện trong list
- ✅ Firestore có document mới trong `milestones` collection

---

## 🔍 Verify in Firebase Console

### Check Tasks

1. Vào: https://console.firebase.google.com/u/0/project/ued-projecthub/firestore
2. Collection: **tasks**
3. Xem documents

**Expected fields:**

```
- code: "#TSK-01"
- title: "Xây dựng kịch bản kiểm thử API"
- groupId: "nhom_04"
- createdBy: "{userId}"
- createdAt: {timestamp}
- updatedAt: {timestamp}
```

### Check Milestones

1. Collection: **milestones**
2. Xem documents

**Expected fields:**

```
- name: "Cột mốc 1: Khởi động & Nộp đề cương"
- courseId: "course_2024_2025"
- weight: 20
- createdAt: {timestamp}
```

---

## 📊 Changes Summary

### Files Created

```
src/services/
  ├── taskService.ts              ← Task CRUD + realtime
  ├── milestoneService.ts         ← Milestone CRUD + realtime
  ├── applicationService.ts       ← Application CRUD
  ├── userService.ts              ← User profile management
  └── index.ts                    ← Export all services

src/utils/
  └── migrateToFirestore.ts       ← Demo data migration utility

src/components/
  └── DataMigrationPrompt.tsx     ← Prompt to import demo data

PHASE_3_4_COMPLETE.md             ← This file
```

### Files Modified

```
src/context/AppContext.tsx        ← Firestore integration
  - Import services
  - Change tasks/milestones state to []
  - Add realtime subscriptions
  - Update all task/milestone functions to async

src/App.tsx                       ← Add DataMigrationPrompt
  - Import DataMigrationPrompt
  - Render in workspace
```

---

## 🔥 What's Different from Phase 2

| Feature              | Phase 2         | Phase 3-4      |
| -------------------- | --------------- | -------------- |
| **Tasks**            | ⚠️ LocalStorage | ✅ Firestore   |
| **Milestones**       | ⚠️ LocalStorage | ✅ Firestore   |
| **Realtime Sync**    | ❌ None         | ✅ onSnapshot  |
| **Multi-user**       | ❌ Isolated     | ✅ Shared data |
| **CRUD Operations**  | ⚠️ Synchronous  | ✅ Async       |
| **Data Persistence** | ⚠️ Per-user     | ✅ Per-group   |

---

## ⚠️ Still TODO (Phase 5-6)

### Not Migrated Yet:

- ⚠️ **Applications** - Vẫn localStorage (cần UI integration)
- ⚠️ **Peer Reviews** - Vẫn localStorage
- ⚠️ **Group Reports** - Vẫn localStorage
- ⚠️ **Schedule Matrix** - Vẫn localStorage (per-user, OK for now)

### Phase 5 (Remaining):

- [ ] Migrate Applications to Firestore
- [ ] Migrate Peer Reviews to Firestore
- [ ] Add more realtime features

### Phase 6:

- [ ] **Security Rules** (CRITICAL!)
- [ ] Permission check per group
- [ ] Lecturer-only milestone creation

---

## 🐛 Known Issues

### Issue 1: Tasks không hiển thị sau login

**Cause:** Chưa import demo data

**Fix:** Click "Import dữ liệu demo" trong popup hoặc tự tạo tasks mới

### Issue 2: Console log "📋 Tasks updated: 0"

**Cause:** Group chưa có tasks

**Fix:** Tạo task mới hoặc import demo data

### Issue 3: Realtime sync không hoạt động

**Cause:** Firestore rules quá strict hoặc user không trong group

**Check:**

1. Firebase Console → Firestore → Rules
2. Xác nhận rules cho phép read/write
3. Check `currentUser.teamId` có match với `task.groupId`

---

## 🔒 Security Status

### ⚠️ STILL IN TEST MODE

```javascript
// Hiện tại (insecure):
allow read, write: if true;
```

**Action required (Phase 6):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tasks - chỉ group members
    match /tasks/{taskId} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.teamId
        == resource.data.groupId;
    }

    // Milestones - lecturer create, all read
    match /milestones/{milestoneId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'lecturer';
    }
  }
}
```

---

## 📈 Performance Notes

### Realtime Listeners

- Mỗi group có 1 listener cho tasks
- 1 listener global cho milestones
- Auto unsubscribe khi component unmount
- Console logs để debug:
  ```
  🔄 Subscribing to tasks for group: nhom_04
  📋 Tasks updated: 10
  🔌 Unsubscribing from tasks
  ```

### Optimization Tips

1. Limit Firestore reads bằng cách cache data
2. Use `orderBy` để sort trên server
3. Pagination cho large datasets (chưa implement)

---

## ✅ Success Checklist

- [x] ✅ taskService.ts created
- [x] ✅ milestoneService.ts created
- [x] ✅ applicationService.ts created
- [x] ✅ userService.ts created
- [x] ✅ AppContext updated với Firestore
- [x] ✅ Realtime subscriptions working
- [x] ✅ addTask() → async Firestore
- [x] ✅ updateTask() → async Firestore
- [x] ✅ deleteTask() → async Firestore
- [x] ✅ moveTask() → async Firestore
- [x] ✅ addMilestone() → async Firestore
- [x] ✅ updateMilestone() → async Firestore
- [x] ✅ DataMigrationPrompt component
- [x] ✅ migrateToFirestore utility
- [x] ✅ npm run lint passes (0 errors)
- [x] ✅ Demo data import working
- [x] ✅ Multi-user realtime sync tested

---

## 🎯 Next Steps

### Phase 5: Complete Migration (1-2 giờ)

- [ ] Migrate Applications to Firestore
- [ ] Migrate Peer Reviews to Firestore (with anonymization)
- [ ] Test all CRUD operations

### Phase 6: Security Rules (30 phút)

- [ ] Write comprehensive security rules
- [ ] Test permission checks
- [ ] Deploy to production mode

---

**Status:** ✅ Phase 3-4 Complete  
**Next:** Phase 5 - Complete Migration (Applications, Peer Reviews)  
**Date:** 2025-01-18
