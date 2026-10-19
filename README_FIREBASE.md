# 🔥 Firebase Integration - UED-ProjectHub

## 📚 Quick Links

- **Setup Guide:** [FIREBASE_SETUP_COMPLETE.md](./FIREBASE_SETUP_COMPLETE.md)
- **Test Guide:** [TEST_AUTHENTICATION.md](./TEST_AUTHENTICATION.md)
- **Full Migration Plan:** [FIREBASE_MIGRATION_PLAN.md](./FIREBASE_MIGRATION_PLAN.md)
- **Summary:** [SUMMARY_FIREBASE_INTEGRATION.md](./SUMMARY_FIREBASE_INTEGRATION.md)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy Firebase credentials vào file `.env` (đã tạo sẵn):

```env
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY_HERE"
VITE_FIREBASE_AUTH_DOMAIN="ued-projecthub.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ued-projecthub"
# ... (see .env file)
```

### 3. Start Development Server

```bash
npm run dev
```

Open: http://localhost:3000

---

## ✅ What's Working

### Authentication

- ✅ Email/Password login
- ✅ Sign up for new users
- ✅ Session persistence (refresh page vẫn login)
- ✅ Logout
- ✅ Error handling (wrong password, email not found, etc.)

### User Management

- ✅ User profile stored in Firestore `users/{userId}`
- ✅ Display user info in Navbar
- ✅ Avatar initials auto-generated (e.g., "Nguyễn Văn A" → "NA")

---

## 🧪 Test Instructions

### Test 1: Sign Up

1. Go to http://localhost:3000
2. Click **"Đăng nhập SSO Trường"**
3. Click **"Chưa có tài khoản? Đăng ký miễn phí"**
4. Fill form:
   - Họ và tên: `Nguyễn Văn Test`
   - Mã SV: `211150531999`
   - Lớp: `21CNTT1`
   - Email: `test@ued.udn.vn`
   - Mật khẩu: `test123456`
5. Click **"Đăng ký"**

**Expected:** ✅ Toast success & navigate to Matchmaking

### Test 2: Login

1. Logout (click 🚪 icon in Navbar)
2. Click **"Đăng nhập SSO Trường"**
3. Enter:
   - Email: `test@ued.udn.vn`
   - Password: `test123456`
4. Click **"Đăng nhập"**

**Expected:** ✅ Toast success & navigate to Dashboard

### Test 3: Session Persistence

1. Login successfully
2. Press **F5** (refresh page)

**Expected:** ✅ User still logged in (no logout)

### Test 4: Logout

1. Login successfully
2. Click 🚪 icon in Navbar

**Expected:** ✅ Redirect to landing page

---

## 🔍 Firebase Console

### Check Users

https://console.firebase.google.com/u/0/project/ued-projecthub/authentication/users

### Check Firestore Data

https://console.firebase.google.com/u/0/project/ued-projecthub/firestore/databases/-default-/data

Collection: `users`

---

## ⚠️ Important Notes

### 1. Firestore Security Rules

Currently in **test mode** (insecure). Need to update rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2. Data Not Migrated Yet

- ⚠️ Tasks still in localStorage
- ⚠️ Milestones still in localStorage
- ⚠️ Peer Reviews still in localStorage

Will migrate in **Phase 3-4**.

### 3. No Realtime Sync Yet

- Each user has their own localStorage data
- Will add realtime sync in **Phase 5**

---

## 📁 Project Structure

```
src/
├── config/
│   └── firebase.ts              ← Firebase initialization
├── views/
│   └── LoginView.tsx            ← Login/Signup UI
├── context/
│   └── AppContext.tsx           ← Firebase Auth integration
└── components/
    └── Navbar.tsx               ← User info & logout button

docs/ (new):
├── FIREBASE_MIGRATION_PLAN.md   ← Full Phase 1-6 plan
├── FIREBASE_SETUP_COMPLETE.md   ← Setup documentation
├── TEST_AUTHENTICATION.md       ← Testing guide
├── SUMMARY_FIREBASE_INTEGRATION.md ← Summary
└── README_FIREBASE.md           ← This file
```

---

## 🐛 Troubleshooting

### Error: "auth/configuration-not-found"

**Fix:** Enable Email/Password in Firebase Console

- Go to: Authentication → Sign-in method
- Enable: Email/Password

### Error: "Missing or insufficient permissions"

**Fix:** Firestore rules too strict

- Go to: Firestore Database → Rules
- Set to test mode temporarily

### User not showing after login

**Check:**

1. Firebase Console → Authentication → Users
2. Firestore → `users` collection
3. Browser Console (F12) for errors

---

## 📊 Status

| Phase                    | Status      | Time    |
| ------------------------ | ----------- | ------- |
| Phase 1: Firebase Setup  | ✅ Complete | 30 min  |
| Phase 2: Authentication  | ✅ Complete | 1.5 hrs |
| Phase 3: Database Schema | ⏳ Todo     | 1 hr    |
| Phase 4: Migrate Data    | ⏳ Todo     | 2-3 hrs |
| Phase 5: Realtime Sync   | ⏳ Todo     | 1 hr    |
| Phase 6: Security Rules  | ⏳ Todo     | 30 min  |

**Total Progress:** 2/6 phases (33%)

---

## 🎯 Next Steps

1. **Test authentication** (follow TEST_AUTHENTICATION.md)
2. **Update Firestore rules** (security)
3. **Phase 3:** Create database schema
4. **Phase 4:** Migrate tasks & milestones to Firestore
5. **Phase 5:** Add realtime sync
6. **Phase 6:** Production security rules

---

## 📞 Support

### Documentation

- Firebase Auth: https://firebase.google.com/docs/auth/web/start
- Firestore: https://firebase.google.com/docs/firestore/quickstart

### Firebase Console

- Project: https://console.firebase.google.com/u/0/project/ued-projecthub

---

**Status:** ✅ Phase 1-2 Complete  
**Next:** Phase 3 - Database Schema  
**Updated:** 2025-01-18
