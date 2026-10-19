# 🔥 Kế hoạch tích hợp Firebase cho UED-ProjectHub

## 📋 Tổng quan

**Mục tiêu:** Chuyển từ localStorage mock sang Firebase Backend-as-a-Service hoàn chỉnh

**Thời gian ước tính:** 6-8 giờ

**Các vấn đề cần giải quyết:**

1. ❌ Không có authentication thực
2. ❌ Dữ liệu chỉ lưu localStorage (không đồng bộ giữa users)
3. ❌ Không có realtime sync
4. ❌ Phân quyền chỉ là UI mock

---

## 📦 PHASE 1: Setup Firebase Project (30 phút)

### Bước 1.1: Tạo Firebase Project

1. Truy cập https://console.firebase.google.com
2. Click **"Add project"** → Đặt tên: `ued-projecthub-prod`
3. Disable Google Analytics (không cần cho đồ án)
4. Click **Create project**

### Bước 1.2: Enable Services

1. **Authentication:**
   - Vào sidebar → Authentication → Get started
   - Enable **Email/Password**
   - Enable **Google** (cho SSO trường)

2. **Firestore Database:**
   - Vào sidebar → Firestore Database → Create database
   - Chọn **"Start in test mode"** (để dev, sau sẽ thêm security rules)
   - Chọn region: **asia-southeast1** (Singapore - gần VN nhất)

### Bước 1.3: Lấy Config Credentials

1. Vào **Project Settings** (⚙️ icon)
2. Scroll xuống **"Your apps"** → Click **Web icon** (</>)
3. Register app với nickname: `ued-projecthub-web`
4. Copy **firebaseConfig** object

### Bước 1.4: Install Dependencies

```bash
npm install firebase
```

### Bước 1.5: Tạo Firebase Config File

**File:** `src/config/firebase.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
```

### Bước 1.6: Update .env.example

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="AIza..."
VITE_FIREBASE_AUTH_DOMAIN="ued-projecthub-prod.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ued-projecthub-prod"
VITE_FIREBASE_STORAGE_BUCKET="ued-projecthub-prod.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"
```

**Lưu ý:** Tạo file `.env` (không commit lên git) và copy config thực từ Firebase Console.

---

## 🔐 PHASE 2: Authentication (1-2 giờ)

### Bước 2.1: Tạo Login View Component

**File:** `src/views/LoginView.tsx`

```tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { LogIn, Mail, Lock, Chrome } from "lucide-react";

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        setError("Tài khoản chưa được khởi tạo. Vui lòng liên hệ giảng viên.");
        await auth.signOut();
        return;
      }

      // Navigate after successful login
      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Email không tồn tại trong hệ thống.");
      } else if (err.code === "auth/wrong-password") {
        setError("Mật khẩu không chính xác.");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSSO = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if email is from @ued.udn.vn domain
      if (!user.email?.endsWith("@ued.udn.vn")) {
        setError("Chỉ cho phép đăng nhập bằng email trường (@ued.udn.vn)");
        await auth.signOut();
        return;
      }

      // Check if user profile exists
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Auto-create profile for first-time SSO users
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          name: user.displayName || "Sinh viên",
          role: "student", // Default role
          avatarUrl: user.photoURL,
          createdAt: new Date(),
        });
      }

      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Bạn đã đóng cửa sổ đăng nhập.");
      } else {
        setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="text-sm text-slate-500 mt-2">
            UED-ProjectHub - Hệ thống quản lý đồ án môn học
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Google SSO Button */}
        <button
          onClick={handleGoogleSSO}
          disabled={isLoading}
          className="w-full mb-6 px-4 py-3 bg-white border-2 border-slate-300 hover:border-blue-500 rounded-lg font-semibold text-slate-700 hover:text-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Chrome className="w-5 h-5" />
          <span>Đăng nhập bằng Google SSO Trường</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400">HOẶC</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sinhvien@ued.udn.vn"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center mt-6">
          Bạn chưa có tài khoản? Liên hệ giảng viên để được cấp quyền truy cập.
        </p>
      </div>
    </div>
  );
};
```

### Bước 2.2: Update AppContext với Firebase Auth

**File:** `src/context/AppContext.tsx`

**Thay đổi:**

```tsx
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

// Thay đổi state
const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
const [authLoading, setAuthLoading] = useState(true);

// Thêm useEffect để lắng nghe auth state
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // User logged in → fetch profile from Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({
          id: firebaseUser.uid,
          name: userData.name,
          code: userData.studentId || userData.code,
          className: userData.className,
          role: userData.role,
          title: userData.role === "lecturer" ? "Giảng viên" : "Sinh viên",
          avatarText: getInitials(userData.name),
          teamId: userData.teamId,
          teamName: userData.teamName,
          isGroupLeader: userData.isGroupLeader || false,
        });
      }
    } else {
      // User logged out
      setCurrentUser(null);
    }
    setAuthLoading(false);
  });

  return () => unsubscribe();
}, []);
```

---

## 🗄️ PHASE 3: Firestore Database Schema (1 giờ)

### Firestore Collections Structure

```
firestore/
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── email: string
│       ├── name: string
│       ├── studentId: string (for students)
│       ├── code: string (for lecturers)
│       ├── className: string
│       ├── role: "student" | "lecturer"
│       ├── teamId: string
│       ├── teamName: string
│       ├── isGroupLeader: boolean
│       ├── avatarUrl: string
│       ├── skills: string[]
│       ├── scheduleMatrix: FreeScheduleMatrix
│       └── createdAt: timestamp
│
├── groups/
│   └── {groupId}/
│       ├── id: string
│       ├── name: string (e.g., "Nhóm 04 - Web App")
│       ├── leaderId: string (userId)
│       ├── memberIds: string[] (array of userIds)
│       ├── courseId: string
│       ├── semester: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── tasks/
│   └── {taskId}/
│       ├── id: string
│       ├── code: string (#TSK-01)
│       ├── title: string
│       ├── description: string
│       ├── tag: string
│       ├── priority: string
│       ├── status: TaskStatus
│       ├── dueDate: timestamp
│       ├── assigneeId: string (userId)
│       ├── groupId: string
│       ├── milestoneId: string
│       ├── createdBy: string (userId)
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── milestones/
│   └── {milestoneId}/
│       ├── id: string
│       ├── name: string
│       ├── phase: string
│       ├── deliverables: string
│       ├── dueDate: timestamp
│       ├── weight: number (percentage)
│       ├── status: string
│       ├── courseId: string
│       ├── createdBy: string (lecturer userId)
│       ├── createdAt: timestamp
│       └── publishedAt: timestamp
│
├── applications/
│   └── {applicationId}/
│       ├── id: string
│       ├── applicantId: string (userId)
│       ├── targetGroupId: string
│       ├── status: "pending" | "accepted" | "rejected"
│       ├── note: string
│       ├── skillScore: number
│       ├── timeScore: number
│       ├── matchScore: number
│       ├── appliedAt: timestamp
│       └── reviewedAt: timestamp
│
├── peerReviews/
│   └── {reviewId}/
│       ├── id: string
│       ├── milestoneId: string
│       ├── groupId: string
│       ├── reviewerId: string (HASHED - ẩn danh)
│       ├── targetId: string (HASHED - ẩn danh)
│       ├── c1Score: number (Criterion 1)
│       ├── c2Score: number (Criterion 2)
│       ├── c3Score: number (Criterion 3)
│       ├── comment: string
│       ├── status: "draft" | "submitted"
│       ├── createdAt: timestamp
│       └── submittedAt: timestamp
│
└── groupReports/
    └── {reportId}/
        ├── id: string
        ├── groupId: string
        ├── milestoneId: string
        ├── status: "Đang xử lý" | "Đã phê duyệt" | "Yêu cầu giải trình"
        ├── members: MemberContributionData[]
        ├── lecturerInstruction: string
        ├── generatedAt: timestamp
        └── approvedAt: timestamp
```

---

## 🔄 PHASE 4: Migrate LocalStorage → Firestore (2-3 giờ)

### Bước 4.1: Tạo Service Layer

**File:** `src/services/taskService.ts`

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { KanbanTask } from "../types";

export const taskService = {
  // Create new task
  async createTask(
    taskData: Omit<KanbanTask, "id" | "code">,
    groupId: string,
    createdBy: string,
  ) {
    const tasksRef = collection(db, "tasks");

    // Generate task code
    const existingTasks = await this.getGroupTasks(groupId);
    const taskNumber = existingTasks.length + 1;
    const taskCode = `#TSK-${String(taskNumber).padStart(2, "0")}`;

    const docRef = await addDoc(tasksRef, {
      ...taskData,
      code: taskCode,
      groupId,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, code: taskCode };
  },

  // Get all tasks for a group
  async getGroupTasks(groupId: string): Promise<KanbanTask[]> {
    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      where("groupId", "==", groupId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as KanbanTask[];
  },

  // Update task status
  async updateTask(taskId: string, updates: Partial<KanbanTask>) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete task
  async deleteTask(taskId: string) {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  },

  // Move task to new status
  async moveTask(taskId: string, newStatus: string) {
    await this.updateTask(taskId, { status: newStatus });
  },
};
```

**Tương tự, tạo thêm:**

- `src/services/milestoneService.ts`
- `src/services/applicationService.ts`
- `src/services/peerReviewService.ts`
- `src/services/userService.ts`

### Bước 4.2: Update AppContext

**Thay đổi từ:**

```tsx
const [tasks, setTasks] = useState<KanbanTask[]>(() => {
  const saved = localStorage.getItem(STORAGE_KEY + "_tasks");
  return saved ? JSON.parse(saved) : INITIAL_TASKS;
});
```

**Thành:**

```tsx
const [tasks, setTasks] = useState<KanbanTask[]>([]);

useEffect(() => {
  if (!currentUser?.teamId) return;

  const loadTasks = async () => {
    const groupTasks = await taskService.getGroupTasks(currentUser.teamId);
    setTasks(groupTasks);
  };

  loadTasks();
}, [currentUser?.teamId]);
```

---

## ⚡ PHASE 5: Realtime Updates (1 giờ)

### Bước 5.1: Thêm Realtime Listeners

**File:** `src/context/AppContext.tsx`

```tsx
import { onSnapshot, collection, query, where } from "firebase/firestore";

useEffect(() => {
  if (!currentUser?.teamId) return;

  // Realtime listener for tasks
  const tasksQuery = query(
    collection(db, "tasks"),
    where("groupId", "==", currentUser.teamId),
  );

  const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
    const updatedTasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as KanbanTask[];

    setTasks(updatedTasks);
  });

  return () => unsubscribe();
}, [currentUser?.teamId]);
```

**Kết quả:**

- ✅ Khi member A tạo task mới → member B thấy ngay lập tức
- ✅ Khi member A cập nhật status → member B thấy realtime
- ✅ Không cần refresh page

---

## 🔒 PHASE 6: Security Rules (30 phút)

**File:** Firestore Rules (config trên Firebase Console)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isLecturer() {
      return isAuthenticated() && getUserData().role == 'lecturer';
    }

    function isGroupMember(groupId) {
      return isAuthenticated() && getUserData().teamId == groupId;
    }

    function isGroupLeader(groupId) {
      return isGroupMember(groupId) && getUserData().isGroupLeader == true;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Groups collection
    match /groups/{groupId} {
      allow read: if isAuthenticated();
      allow create: if isLecturer();
      allow update: if isGroupLeader(groupId) || isLecturer();
      allow delete: if isLecturer();
    }

    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated() && isGroupMember(resource.data.groupId);
      allow create: if isAuthenticated() && isGroupMember(request.resource.data.groupId);
      allow update: if isAuthenticated() && isGroupMember(resource.data.groupId);
      allow delete: if isGroupLeader(resource.data.groupId) || isLecturer();
    }

    // Milestones collection
    match /milestones/{milestoneId} {
      allow read: if isAuthenticated();
      allow write: if isLecturer();
    }

    // Applications collection
    match /applications/{applicationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        request.auth.uid == resource.data.applicantId ||
        isGroupLeader(resource.data.targetGroupId)
      );
    }

    // Peer reviews collection (ẩn danh)
    match /peerReviews/{reviewId} {
      allow read: if isLecturer(); // Chỉ giảng viên mới xem được
      allow create, update: if isAuthenticated() && request.auth.uid == request.resource.data.reviewerId;
    }

    // Group reports collection
    match /groupReports/{reportId} {
      allow read: if isAuthenticated() && (
        isGroupMember(resource.data.groupId) ||
        isLecturer()
      );
      allow write: if isLecturer();
    }
  }
}
```

---

## ✅ PHASE 7: Testing & Validation (1 giờ)

### Test Cases

**Authentication:**

- [ ] Đăng nhập bằng email/password
- [ ] Đăng nhập bằng Google SSO (@ued.udn.vn)
- [ ] Logout và kiểm tra session cleared
- [ ] Redirect về login nếu chưa authenticated

**Tasks (Realtime):**

- [ ] Tạo task mới → members khác thấy ngay
- [ ] Update task status → sync realtime
- [ ] Delete task → members khác thấy task biến mất
- [ ] Kiểm tra overdue tasks auto-update

**Milestones:**

- [ ] Giảng viên tạo milestone → toàn lớp thấy
- [ ] Kiểm tra tổng weight = 100% trước khi publish
- [ ] Lock milestone sau khi publish

**Applications:**

- [ ] Sinh viên gửi đơn xin vào nhóm
- [ ] Trưởng nhóm duyệt/từ chối đơn
- [ ] Applicant nhận notification

**Peer Reviews:**

- [ ] Đánh giá chéo ẩn danh (không hiển thị người chấm)
- [ ] Chỉ giảng viên mới xem raw reviews
- [ ] Tự động tính điểm contribution

**Security Rules:**

- [ ] Sinh viên không thể xem tasks của nhóm khác
- [ ] Sinh viên không thể tạo milestone
- [ ] Chỉ giảng viên mới approve report

---

## 📊 So sánh Before/After

| **Tính năng**        | **Trước (LocalStorage)** | **Sau (Firebase)**          |
| -------------------- | ------------------------ | --------------------------- |
| Authentication       | ❌ Mock (toggle role)    | ✅ Firebase Auth + SSO      |
| Multi-user sync      | ❌ Mỗi user riêng data   | ✅ Realtime sync            |
| Data persistence     | ❌ Mất khi clear cache   | ✅ Cloud database           |
| Permission check     | ❌ UI only               | ✅ Backend security rules   |
| Scalability          | ❌ 1 user                | ✅ Unlimited users          |
| Free-rider detection | ⚠️ Mock data             | ✅ Real aggregated data     |
| Anonymized reviews   | ❌ Fake                  | ✅ Hash-based anonymization |

---

## 🎯 Kế hoạch triển khai từng bước

1. **Week 1:** Setup Firebase + Authentication (Phase 1-2)
2. **Week 2:** Migrate Tasks + Milestones to Firestore (Phase 3-4)
3. **Week 3:** Realtime sync + Security rules (Phase 5-6)
4. **Week 4:** Testing + Bug fixes (Phase 7)

---

## 📝 Notes

- Backup localStorage data trước khi migrate
- Tạo script migration để import initial data vào Firestore
- Test trên Firebase Emulator trước khi deploy production
- Document API trong `docs/API.md`

---

**Tác giả:** Kiro AI Assistant  
**Ngày tạo:** {{ current_date }}
