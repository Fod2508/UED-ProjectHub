# Fix: Logout Permission Denied Error

## Vấn đề (Problem)

Khi người dùng đăng xuất (logout), console báo lỗi:

```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

## Nguyên nhân (Root Cause)

Có **4 Firestore realtime listeners** trong `AppContext.tsx` đang tiếp tục chạy sau khi user logout:

1. **Tasks listener** (line ~237)
2. **Milestones listener** (line ~260) ✅ Đã sửa trước đó
3. **Applications listener** (line ~287)
4. **Peer reviews listener** (line ~313)

### Vấn đề cụ thể:

```typescript
useEffect(() => {
  if (!currentUser?.teamId) {
    setTasks([]);
    return;
  }
  // Subscribe to Firestore...
}, [currentUser?.teamId]); // ❌ SAI: Chỉ depend vào teamId
```

**Tại sao điều này gây lỗi:**

1. Khi user logout: `currentUser` → `null`
2. Nhưng dependency array là `[currentUser?.teamId]`
3. `null?.teamId` = `undefined` (trước logout cũng có thể là `undefined`)
4. React không thấy thay đổi trong dependency → **không trigger cleanup**
5. Listener cũ vẫn chạy → cố query Firestore khi đã không có auth → **permission-denied**

## Giải pháp (Solution)

### Thay đổi dependency array từ `[currentUser?.teamId]` → `[currentUser]`

**Lý do:**

- Khi `currentUser` thay đổi từ object → `null` (logout), React sẽ nhận biết sự thay đổi
- Cleanup function sẽ được gọi → `unsubscribe()` → ngắt kết nối listener
- Không còn query Firestore sau khi logout

### Code sau khi sửa:

```typescript
// ✅ ĐÚNG: Depend vào currentUser
useEffect(() => {
  // Kiểm tra cả currentUser VÀ teamId
  if (!currentUser || !currentUser.teamId) {
    setTasks([]);
    return;
  }

  console.log("🔄 Subscribing to tasks for group:", currentUser.teamId);

  const unsubscribe = taskService.subscribeToGroupTasks(
    currentUser.teamId,
    (updatedTasks) => {
      console.log("📋 Tasks updated:", updatedTasks.length);
      setTasks(updatedTasks);
    },
  );

  return () => {
    console.log("🔌 Unsubscribing from tasks");
    unsubscribe(); // ← Hàm này SẼ được gọi khi currentUser → null
  };
}, [currentUser]); // ✅ ĐÚNG: Re-run khi currentUser thay đổi (login/logout)
```

## Files đã sửa (Files Modified)

- `src/context/AppContext.tsx`
  - Line ~237-257: Fixed tasks listener
  - Line ~287-307: Fixed applications listener
  - Line ~313-340: Fixed peer reviews listener
  - Line ~260-285: Milestones listener (đã sửa trước đó)

## Kết quả (Result)

✅ Khi logout:

1. `currentUser` → `null`
2. React nhận biết thay đổi trong `[currentUser]` dependency
3. Cleanup functions được gọi
4. Tất cả 4 listeners được unsubscribe
5. Không còn query Firestore sau logout
6. **Không còn lỗi permission-denied**

## Testing

Để test:

1. Đăng nhập → Có thể thấy logs: "🔄 Subscribing to..."
2. Đăng xuất → Thấy logs: "🔌 Unsubscribing from..."
3. Kiểm tra console → **Không còn lỗi FirebaseError**
4. Đăng nhập lại → Listeners được tạo lại thành công

## Best Practice

**Khi tạo Firestore realtime listener trong React:**

```typescript
useEffect(() => {
  // 1. ✅ LUÔN kiểm tra auth trước khi subscribe
  if (!currentUser || !currentUser.teamId) {
    // Reset state nếu không có user
    setState([]);
    return;
  }

  // 2. Subscribe to Firestore
  const unsubscribe = service.subscribe(...);

  // 3. ✅ LUÔN return cleanup function
  return () => {
    unsubscribe();
  };
}, [currentUser]); // 4. ✅ Depend vào currentUser (không phải currentUser?.teamId)
```

**Nguyên tắc:**

- Depend vào **object gốc** (`currentUser`), không phải **property** (`currentUser?.teamId`)
- React so sánh reference của object, nên khi logout (object → null) nó sẽ trigger cleanup
- Nếu depend vào property, có thể cả 2 giá trị đều là `undefined` → React không thấy thay đổi

---

**Date**: 2024-12-19  
**Fixed by**: Kiro AI Assistant  
**Related**: FIX_PERMISSION_DENIED_ERROR.md (milestone listener fix)
