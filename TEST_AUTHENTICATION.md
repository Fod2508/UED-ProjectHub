# 🧪 Test Authentication - Quick Guide

## 🚀 Bắt đầu test

### 1. Start Development Server

```bash
npm run dev
```

Mở: http://localhost:3000

---

## ✅ Test Case 1: Đăng ký tài khoản mới

### Các bước:

1. Click **"Đăng nhập SSO Trường"** ở trang chủ
2. Click **"Chưa có tài khoản? Đăng ký miễn phí"**
3. Điền form:
   ```
   Họ và tên:    Nguyễn Văn Test
   Mã SV:        211150531999
   Lớp:          21CNTT1
   Email:        test@ued.udn.vn
   Mật khẩu:     test123456
   ```
4. Click **"Đăng ký"**

### ✅ Expected Results:

- Toast success: "Đăng ký thành công! Chào mừng bạn đến với UED-ProjectHub."
- Navigate đến màn hình Matchmaking
- Navbar hiển thị: "Nguyễn Văn Test" với avatar "NT"

### 🔍 Verify in Firebase:

1. Vào: https://console.firebase.google.com/u/0/project/ued-projecthub/authentication
2. Tab **Users** → Thấy email `test@ued.udn.vn`
3. Tab **Firestore Database** → Collection `users` → Thấy document với email trên

---

## ✅ Test Case 2: Đăng nhập

### Các bước:

1. Click icon **Logout** (🚪) ở Navbar (góc phải)
2. Quay về trang chủ → Click **"Đăng nhập SSO Trường"**
3. Điền:
   ```
   Email:        test@ued.udn.vn
   Mật khẩu:     test123456
   ```
4. Click **"Đăng nhập"**

### ✅ Expected Results:

- Toast success: "Đăng nhập thành công!"
- Navigate đến màn hình Dashboard
- Navbar hiển thị thông tin user

---

## ✅ Test Case 3: Session Persistence

### Các bước:

1. Đăng nhập thành công (Test Case 2)
2. Press **F5** (refresh page)

### ✅ Expected Results:

- Hiển thị loading spinner 0.5-1 giây
- User vẫn đăng nhập (không bị logout)
- Quay về màn hình trước đó

---

## ✅ Test Case 4: Logout

### Các bước:

1. Đang đăng nhập
2. Click icon **Logout** (🚪) ở Navbar

### ✅ Expected Results:

- Toast info: "Đã đăng xuất khỏi hệ thống."
- Navigate về trang chủ (Landing)
- Navbar không còn hiển thị user info

---

## ❌ Test Case 5: Error Handling

### Test 5.1: Email không tồn tại

```
Email:        notexist@ued.udn.vn
Mật khẩu:     anything123
```

**Expected:** ❌ "Email không tồn tại trong hệ thống."

---

### Test 5.2: Sai mật khẩu

```
Email:        test@ued.udn.vn
Mật khẩu:     wrongpassword
```

**Expected:** ❌ "Mật khẩu không chính xác." hoặc "Email hoặc mật khẩu không chính xác."

---

### Test 5.3: Email đã tồn tại (khi đăng ký)

1. Đăng ký với email `test@ued.udn.vn` (đã tồn tại)

**Expected:** ❌ "Email này đã được đăng ký. Vui lòng đăng nhập."

---

### Test 5.4: Mật khẩu quá yếu

```
Mật khẩu:     123
```

**Expected:** ❌ "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự)."

---

## 🔍 Debug Tips

### Kiểm tra Console (F12)

```javascript
// Xem auth state
auth.currentUser;

// Xem user trong context
// (Mở React DevTools → Components → AppProvider)
```

### Kiểm tra Firebase Console

1. **Authentication → Users**: Xem danh sách users
2. **Firestore → users**: Xem user profiles
3. **Authentication → Sign-in method**: Xác nhận Email/Password enabled

### Lỗi thường gặp

**Lỗi 1:** "auth/configuration-not-found"

- **Fix:** Chưa enable Email/Password ở Firebase Console
- Vào: Authentication → Sign-in method → Email/Password → Enable

**Lỗi 2:** "Missing or insufficient permissions"

- **Fix:** Firestore rules quá strict
- Vào: Firestore Database → Rules → Test mode

**Lỗi 3:** Firebase API key not found

- **Fix:** Kiểm tra file `.env` có đúng credentials không

---

## 📸 Screenshots Locations

### 1. Landing Page

- URL: http://localhost:3000
- Button: "Đăng nhập SSO Trường"

### 2. Login View

- URL: http://localhost:3000 (screen = 'login')
- Forms: Email/Password login & Sign up

### 3. After Login

- Dashboard hoặc Matchmaking
- Navbar: User info + Logout icon

---

## ✅ All Tests Pass Checklist

- [ ] ✅ Đăng ký tài khoản mới thành công
- [ ] ✅ Đăng nhập thành công
- [ ] ✅ Session persistence (F5 vẫn login)
- [ ] ✅ Logout thành công
- [ ] ❌ Error: Email không tồn tại
- [ ] ❌ Error: Sai mật khẩu
- [ ] ❌ Error: Email đã tồn tại
- [ ] ❌ Error: Mật khẩu yếu
- [ ] ✅ Navbar hiển thị user info
- [ ] ✅ Avatar initials đúng (e.g., "Nguyễn Văn A" → "NA")
- [ ] ✅ Loading spinner khi authLoading = true

---

## 🎯 Summary

**What works:**

- ✅ Firebase Authentication (Email/Password)
- ✅ User profile storage in Firestore
- ✅ Login/Logout flow
- ✅ Session persistence
- ✅ Error handling

**What's next (Phase 3-6):**

- [ ] Migrate tasks, milestones lên Firestore
- [ ] Realtime sync between users
- [ ] Security rules
- [ ] Google SSO (optional)

---

**Ready to test?** Run `npm run dev` and start with Test Case 1! 🚀
