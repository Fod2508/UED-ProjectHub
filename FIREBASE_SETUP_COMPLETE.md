# ✅ Firebase Integration - Phase 1 & 2 Complete

## 🎉 Đã Hoàn Thành

### ✅ Phase 1: Firebase Setup

- [x] Install Firebase SDK (`npm install firebase --legacy-peer-deps`)
- [x] Tạo file `src/config/firebase.ts` với Firebase config
- [x] Setup environment variables trong `.env` và `.env.example`
- [x] Firebase project: `ued-projecthub`
- [x] Enable Firestore Database
- [x] Enable Authentication (Email/Password)

### ✅ Phase 2: Authentication

- [x] Tạo `LoginView.tsx` component với:
  - Email/Password login
  - Sign up form cho sinh viên mới
  - Error handling đầy đủ
  - Validation form
- [x] Cập nhật `AppContext.tsx` với Firebase Auth:
  - `onAuthStateChanged` listener để track user session
  - Fetch user profile từ Firestore khi login
  - `logout()` function
  - `authLoading` state
  - `currentUser` có thể null
- [x] Cập nhật `App.tsx`:
  - Render `LoginView` khi screen = 'login'
  - Show loading spinner khi `authLoading = true`
- [x] Cập nhật `LandingView.tsx`:
  - Nút "Đăng nhập SSO" navigate đến login screen
- [x] Cập nhật `Navbar.tsx`:
  - Hiển thị thông tin user từ Firebase
  - Thêm nút Logout với icon
- [x] Fix tất cả TypeScript errors (5 errors về `currentUser?.`)

---

## 🔥 Firebase Project Info

**Project Name:** UED-ProjectHub  
**Project ID:** `ued-projecthub`  
**Project Number:** 46487037067

**Firebase Console:** https://console.firebase.google.com/u/0/project/ued-projecthub/overview

**Services đã enable:**

- ✅ Firestore Database (test mode)
- ✅ Authentication (Email/Password)

---

## 📝 Config Files Created

### 1. `src/config/firebase.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 2. `.env` (local development)

```env
VITE_FIREBASE_API_KEY="AIzaSyDKSh9n7bGNMD8dyT7QMfQg23o9EeHEflo"
VITE_FIREBASE_AUTH_DOMAIN="ued-projecthub.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ued-projecthub"
VITE_FIREBASE_STORAGE_BUCKET="ued-projecthub.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="46487037067"
VITE_FIREBASE_APP_ID="1:46487037067:web:2415bc3fb0bab471f3208e"
VITE_FIREBASE_MEASUREMENT_ID="G-ZG8KB5EMLW"
```

---

## 🧪 Hướng Dẫn Test

### Test 1: Sign Up (Đăng ký tài khoản mới)

1. Mở browser: http://localhost:3000
2. Click **"Đăng nhập SSO Trường"**
3. Click **"Chưa có tài khoản? Đăng ký miễn phí"**
4. Điền form:
   - Họ và tên: `Nguyễn Văn Test`
   - Mã SV: `211150531999`
   - Lớp: `21CNTT1`
   - Email: `test@ued.udn.vn`
   - Mật khẩu: `test123456`
5. Click **"Đăng ký"**

**Kết quả mong đợi:**

- ✅ Tạo user trong Firebase Authentication
- ✅ Tạo document trong Firestore `users/{userId}`
- ✅ Navigate đến màn hình Matchmaking
- ✅ Toast success: "Đăng ký thành công!"

### Test 2: Login (Đăng nhập)

1. Logout (click icon logout ở Navbar)
2. Click **"Đăng nhập SSO Trường"**
3. Điền:
   - Email: `test@ued.udn.vn`
   - Mật khẩu: `test123456`
4. Click **"Đăng nhập"**

**Kết quả mong đợi:**

- ✅ Firebase Auth login thành công
- ✅ Fetch user profile từ Firestore
- ✅ Navigate đến màn hình Dashboard
- ✅ Navbar hiển thị tên user: "Nguyễn Văn Test"
- ✅ Toast success: "Đăng nhập thành công!"

### Test 3: Auth Persistence (Session)

1. Đăng nhập thành công
2. Refresh page (F5)

**Kết quả mong đợi:**

- ✅ User vẫn đăng nhập (không bị logout)
- ✅ `onAuthStateChanged` tự động restore session
- ✅ Hiển thị loading spinner trong 0.5-1s
- ✅ Navigate về màn hình trước đó

### Test 4: Logout

1. Đăng nhập thành công
2. Click icon **Logout** (🚪) ở góc phải Navbar

**Kết quả mong đợi:**

- ✅ Firebase signOut() được gọi
- ✅ `currentUser` = null
- ✅ Navigate về màn hình Landing
- ✅ Toast info: "Đã đăng xuất khỏi hệ thống."

### Test 5: Error Handling

**Test 5.1: Email không tồn tại**

- Email: `notexist@ued.udn.vn`
- Password: `anything`
- ❌ Error: "Email không tồn tại trong hệ thống."

**Test 5.2: Sai mật khẩu**

- Email: `test@ued.udn.vn`
- Password: `wrongpassword`
- ❌ Error: "Mật khẩu không chính xác."

**Test 5.3: Email đã tồn tại (Sign up)**

- Sign up với email đã đăng ký
- ❌ Error: "Email này đã được đăng ký. Vui lòng đăng nhập."

**Test 5.4: Mật khẩu yếu**

- Password: `123` (< 6 ký tự)
- ❌ Error: "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự)."

---

## 🔍 Kiểm Tra Firestore Data

### Vào Firebase Console:

1. Firestore Database: https://console.firebase.google.com/u/0/project/ued-projecthub/firestore
2. Collection: `users`
3. Tìm document với ID = userId

**Cấu trúc document:**

```json
{
  "id": "xyz123abc...",
  "email": "test@ued.udn.vn",
  "name": "Nguyễn Văn Test",
  "studentId": "211150531999",
  "className": "21CNTT1",
  "role": "student",
  "title": "Sinh viên",
  "avatarText": "NT",
  "createdAt": {
    /* timestamp */
  },
  "skills": [],
  "scheduleMatrix": {},
  "isGroupLeader": false
}
```

---

## 📊 Changes Summary

### Files Created

```
src/config/firebase.ts          ← Firebase initialization
src/views/LoginView.tsx          ← Login/Signup UI
.env                             ← Environment variables
FIREBASE_MIGRATION_PLAN.md       ← Full migration plan
FIREBASE_SETUP_COMPLETE.md       ← This file
```

### Files Modified

```
src/context/AppContext.tsx       ← Added Firebase Auth listener
src/App.tsx                      ← Added LoginView routing & loading state
src/views/LandingView.tsx        ← Navigate to login screen
src/components/Navbar.tsx        ← Display user info & logout button
src/types/index.ts               ← Added 'login' to ScreenType
.env.example                     ← Added Firebase config
package.json                     ← Added firebase dependency

Fixed TypeScript errors (currentUser?.):
- src/views/ContributionReportView.tsx
- src/views/KanbanView.tsx (2 places)
- src/views/MilestonesView.tsx
- src/views/ReviewApplicantsModal.tsx
```

---

## ⚠️ Important Notes

### 1. Firestore Rules (IMPORTANT!)

Hiện tại Firestore đang ở **test mode** → **KHÔNG BẢO MẬT**.

**Cần làm ngay:**

```javascript
// Vào Firebase Console → Firestore Database → Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chỉ user đã login mới đọc/ghi được
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2. Dữ liệu hiện tại

- ✅ Authentication: Firebase Auth
- ⚠️ Tasks, Milestones, Applications: **VẪN LƯU Ở LOCALSTORAGE**
- ⚠️ Peer Reviews: **VẪN LƯU Ở LOCALSTORAGE**

→ **PHASE 3** sẽ migrate các data này lên Firestore.

### 3. Multi-user Sync

- ❌ Chưa có realtime sync (cần Phase 5)
- ❌ Dữ liệu tasks chỉ local cho mỗi user

---

## 📅 Next Steps (Phase 3-6)

### Phase 3: Database Schema (1 giờ)

- [ ] Tạo Firestore collections: `users`, `groups`, `tasks`, `milestones`, `applications`, `peerReviews`, `groupReports`
- [ ] Setup initial data structure

### Phase 4: Migrate LocalStorage → Firestore (2-3 giờ)

- [ ] Tạo service layer: `taskService.ts`, `milestoneService.ts`, `applicationService.ts`
- [ ] Update AppContext để fetch từ Firestore
- [ ] Migrate CRUD operations

### Phase 5: Realtime Updates (1 giờ)

- [ ] Setup `onSnapshot` listeners
- [ ] Realtime sync tasks giữa các users

### Phase 6: Security Rules (30 phút)

- [ ] Viết Firestore Security Rules
- [ ] Test permission check

---

## 🐛 Known Issues

### 1. Role Switcher vẫn là Mock

- Navbar vẫn có nút "Sinh viên / Giảng viên" toggle
- Đây là feature demo, thực tế role được lưu trong Firestore
- Có thể ẩn đi trong production

### 2. LocalStorage vẫn được dùng

- Tasks, Milestones, Peer Reviews vẫn lưu localStorage
- Sẽ được migrate sang Firestore trong Phase 4

---

## ✅ Test Checklist

- [ ] Sign up tài khoản mới
- [ ] Login với email/password
- [ ] Session persistence (refresh page vẫn login)
- [ ] Logout thành công
- [ ] Error: Email không tồn tại
- [ ] Error: Sai mật khẩu
- [ ] Error: Email đã tồn tại
- [ ] Error: Mật khẩu yếu
- [ ] User info hiển thị đúng trên Navbar
- [ ] Avatar initials tự động (e.g., "Nguyễn Văn A" → "NA")

---

## 📞 Support

Nếu gặp lỗi, kiểm tra:

1. Firebase Console → Authentication → Users (xem user đã được tạo chưa)
2. Firebase Console → Firestore → users collection
3. Browser Console (F12) → xem error logs
4. Network tab → xem Firebase API calls

**Firebase Docs:**

- Auth: https://firebase.google.com/docs/auth/web/start
- Firestore: https://firebase.google.com/docs/firestore/quickstart

---

**Status:** ✅ Phase 1-2 Complete  
**Next:** Phase 3 - Database Schema  
**Date:** {{ current_date }}
