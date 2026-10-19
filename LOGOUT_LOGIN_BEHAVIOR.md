# 🔐 Giải thích hành vi Đăng nhập/Đăng xuất

## ❓ Vấn đề: "Đăng xuất rồi nhưng đăng nhập lại vẫn vào cùng tài khoản"

### 🎯 Đây là hành vi ĐÚNG và BìNH THƯỜNG!

## 📖 Giải thích

### Khi bạn **Đăng xuất**:

1. Firebase Authentication xóa **session** (phiên đăng nhập) khỏi browser
2. App quay về **Landing Page** hoặc **Login Page**
3. ✅ Session đã bị xóa → Bạn cần đăng nhập lại để vào được hệ thống

### Khi bạn **Đăng nhập lại**:

1. Bạn nhập email: `sinhvien@ued.udn.vn`
2. Bạn nhập password: `••••••`
3. Firebase xác thực → Bạn đăng nhập vào tài khoản có email đó
4. ✅ Đây là **tài khoản cũ** vì bạn đang dùng **cùng email/password**!

---

## 🤔 "Vậy tại sao tôi nghĩ là lỗi?"

### Có thể bạn đang nhầm lẫn:

**❌ Hiểu sai:**

> "Đăng xuất rồi thì nên tự động tạo tài khoản mới hoặc không nhớ tài khoản cũ"

**✅ Hiểu đúng:**

> "Đăng xuất = Xóa phiên đăng nhập. Đăng nhập lại = Dùng email/password để vào lại tài khoản."

---

## 🔍 Các trường hợp cụ thể

### Trường hợp 1: Đăng nhập lại với CÙNG tài khoản

```
[Đăng nhập] → Email: user1@ued.udn.vn, Password: 123456
      ↓
[Sử dụng app]
      ↓
[Đăng xuất] → Session bị xóa
      ↓
[Đăng nhập lại] → Email: user1@ued.udn.vn, Password: 123456
      ↓
✅ Kết quả: Vào lại tài khoản user1 (ĐÚNG!)
```

**Giải thích:** Bạn đang dùng cùng email/password → Đăng nhập vào cùng tài khoản.

---

### Trường hợp 2: Đăng nhập với tài khoản KHÁC

```
[Đăng nhập] → Email: user1@ued.udn.vn, Password: 123456
      ↓
[Sử dụng app]
      ↓
[Đăng xuất] → Session bị xóa
      ↓
[Đăng nhập lại] → Email: user2@ued.udn.vn, Password: 654321
      ↓
✅ Kết quả: Vào tài khoản user2 (KHÁC tài khoản cũ!)
```

**Giải thích:** Bạn đang dùng email/password khác → Đăng nhập vào tài khoản khác.

---

### Trường hợp 3: Browser Autofill

```
[Đăng nhập] → Email: user1@ued.udn.vn, Password: 123456
[Browser lưu autofill]
      ↓
[Đăng xuất]
      ↓
[Mở form đăng nhập] → Browser TỰ ĐỘNG điền:
                       Email: user1@ued.udn.vn
                       Password: 123456 (đã lưu)
      ↓
[Bấm Đăng nhập] → Vào lại user1
```

**Giải thích:** Browser đang tự động điền thông tin cũ → Bạn đăng nhập lại vào cùng tài khoản.

**Cách fix:**

- Xóa autofill trong form
- Hoặc nhập email/password khác thủ công

---

## 🛠️ Cách test đúng

### Test 1: Đăng xuất có hoạt động không?

**Bước thực hiện:**

1. Đăng nhập với `user1@ued.udn.vn`
2. Vào Dashboard → Thấy thông tin user1
3. **Bấm Đăng xuất**
4. Kiểm tra:
   - ✅ Có quay về Landing/Login page?
   - ✅ Có thông báo "Đã đăng xuất thành công"?
   - ✅ Không thể vào Dashboard nữa (cần đăng nhập)?

**Kết quả:** Nếu 3 điều trên đúng → Đăng xuất đã hoạt động!

---

### Test 2: Đăng nhập với tài khoản khác

**Bước thực hiện:**

1. Đăng xuất khỏi `user1@ued.udn.vn`
2. Vào trang Login
3. **XÓA SẠCH** email/password cũ (nếu browser tự động điền)
4. Nhập email/password MỚI:
   - Email: `user2@ued.udn.vn`
   - Password: `newpassword`
5. Đăng nhập

**Kết quả:**

- ✅ Nếu vào tài khoản user2 → Hệ thống hoạt động đúng!
- ❌ Nếu vẫn vào user1 → CÓ LỖI (nhưng rất ít xảy ra)

---

## 🎓 Tại sao thiết kế như vậy?

### Firebase Authentication hoạt động theo chuẩn:

**Tài khoản = Email + Password**

- Mỗi email tương ứng với **1 tài khoản duy nhất**
- Đăng nhập bằng email đó = Vào tài khoản đó
- Đăng xuất = Xóa session, **KHÔNG xóa tài khoản**

**Tương tự như Gmail, Facebook:**

- Đăng xuất Gmail → Đăng nhập lại với cùng email → Vào lại cùng Gmail (đúng!)
- Đăng xuất Facebook → Đăng nhập lại với cùng username → Vào lại cùng Facebook (đúng!)

---

## ❓ FAQ

### Q1: "Tôi muốn đăng xuất hoàn toàn, xóa hết dữ liệu"

**A:** Đăng xuất = Xóa session (phiên đăng nhập), **KHÔNG xóa tài khoản**.

- Nếu muốn xóa tài khoản → Cần tính năng "Xóa tài khoản" riêng
- Nếu muốn đăng nhập tài khoản khác → Nhập email/password khác

---

### Q2: "Browser tự động điền email cũ, làm sao tắt?"

**A:** Tắt autofill của browser:

**Chrome:**

1. Settings → Autofill → Passwords
2. Tắt "Offer to save passwords"

**Firefox:**

1. Settings → Privacy & Security
2. Tắt "Ask to save logins and passwords"

**Hoặc trong app:**

- Thêm `autocomplete="off"` vào form input

---

### Q3: "Tôi muốn app tự động logout sau 30 phút"

**A:** Cần thêm tính năng "Auto logout" với timer:

```typescript
// Ví dụ code:
useEffect(() => {
  const timeout = setTimeout(
    () => {
      logout();
    },
    30 * 60 * 1000,
  ); // 30 phút

  return () => clearTimeout(timeout);
}, []);
```

---

## ✅ Kết luận

**Hành vi hiện tại là ĐÚNG:**

- ✅ Đăng xuất → Xóa session
- ✅ Đăng nhập lại với cùng email/password → Vào lại cùng tài khoản
- ✅ Đăng nhập với email/password khác → Vào tài khoản khác

**Không phải lỗi, đây là cách Firebase Auth hoạt động!**

---

## 🔧 Nếu vẫn thấy vấn đề

### Kiểm tra các điều sau:

1. **Console logs:**
   - Sau khi đăng xuất, mở F12 → Console
   - Kiểm tra có log "🔌 Unsubscribing from tasks/milestones/..."?
   - Kiểm tra `currentUser` có `= null`?

2. **Network tab:**
   - Sau khi đăng xuất, F12 → Network
   - Kiểm tra có request tới Firebase Auth `/signOut`?

3. **Application tab:**
   - F12 → Application → IndexedDB
   - Kiểm tra `firebaseLocalStorageDb` có bị xóa sau logout?

4. **Test với Incognito/Private mode:**
   - Mở cửa sổ ẩn danh
   - Đăng nhập → Đăng xuất → Đăng nhập lại
   - Xem có vẫn xảy ra?

---

**Nếu sau khi kiểm tra tất cả mà vẫn có vấn đề, hãy cung cấp:**

- Screenshots console logs
- Video record hành vi
- Thông tin: Browser, OS, Firebase SDK version

---

**Date:** 2024-01-XX  
**Author:** Kiro AI Assistant
