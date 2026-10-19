# 🧪 Testing Guide - Group Management & Peer Review Features

## Quick Test Flow (5 minutes)

### Prerequisites

- Dev server running: `npm run dev` on `http://localhost:3000`
- Firebase project configured
- At least 2 test users in Firestore

---

## Test 1: View Group Members Card 👥

### Dashboard View

1. **Login** to the app (any user in a group)
2. Navigate to **Dashboard** (home icon in sidebar)
3. **Look for the NEW section**: "Nhóm 04" card
4. **Verify you see**:
   - Card title: "Nhóm 04"
   - Member count: "X/4 thành viên"
   - Status badge: "Đang tuyển" (blue) or "Đã đủ" (green)
   - List of members with:
     - Avatar circle with initials
     - Crown icon (👑) on group leader
     - Member name
     - Email address
     - Skills tags (e.g., "Frontend (React)", "UI/UX")

### Matchmaking View

1. Navigate to **Ghép nhóm** (Users icon in sidebar)
2. Scroll to the **bottom of the page**
3. **Verify you see**: Same "Nhóm 04" card appears below the schedule matrix

**Expected Result**: ✅ GroupMembersCard displays correctly in both views with real member data from Firestore

---

## Test 2: Accept Applicant → See Member Added 📨

### Setup

1. **Login as Group Leader** (user with `isGroupLeader: true`)
2. Navigate to **Ghép nhóm** (Matchmaking)
3. Click **"Duyệt yêu cầu"** button (top right)

### Test Steps

1. In the modal, you should see pending applicants
2. Click **"✓ Chấp nhận"** on one applicant
3. **Watch for**:
   - Success toast: "Đã chấp nhận thành viên vào nhóm!"
   - Modal closes
   - Member count updates

4. **Refresh the page** (or navigate away and back)
5. **Check Dashboard** → GroupMembersCard should now show the NEW member

### Verify in Firestore (Optional)

Open Firebase Console → Firestore Database:

- `groups/nhom_04` → `memberIds` array has new user ID
- `groups/nhom_04` → `currentMemberCount` incremented
- `applications/{id}` → `status` changed to "accepted"

**Expected Result**: ✅ New member appears in GroupMembersCard after acceptance

---

## Test 3: Auto-Trigger Peer Review 🎯

### Setup

1. **Login as Lecturer** (`role: "lecturer"`)
2. Navigate to **Cột mốc** (Milestones - Calendar icon)

### Test Steps

1. Find a milestone with status **"Đang mở (Nước rút)"** (blue, pulsing badge)
2. Locate the **"Khóa mốc"** button in the "Thao tác" column
3. **Click "Khóa mốc"**
4. **Watch for**:
   - First toast: "Đã chuyển trạng thái cột mốc sang: Đã khóa"
   - Second toast (NEW): "🎯 Đã kích hoạt phiên đánh giá chéo! 12 phiếu đánh giá đã được tạo."
   - Milestone status badge changes to amber "Đã khóa" with lock icon

### Verify in Firestore

Open Firebase Console → Firestore Database → `peerReviews` collection:

- Should see **12 new documents** (for 4-member group: 4 × 3 = 12)
- Each document has:
  ```
  {
    groupId: "nhom_04",
    milestoneId: "m2" (or whatever milestone you locked),
    reviewerId: "user_id_1",
    targetId: "user_id_2",
    status: "pending",
    c1: 0,
    c2: 0,
    c3: 0,
    comment: "",
    updatedAt: [timestamp]
  }
  ```

### Verify Peer Review UI (Bonus)

1. **Login as Student** (any member of the group)
2. Navigate to **Đánh giá chéo** (Peer Review - Star icon)
3. You should see **pending reviews** for other members
4. You can now fill in scores (c1, c2, c3) and submit

**Expected Result**: ✅ Locking milestone automatically creates peer review entries in Firestore

---

## Test 4: Group Status Logic 🚦

### Test "Đang tuyển" Status

1. Create a group with **< 4 members** (e.g., 2 members)
2. View GroupMembersCard
3. **Verify**:
   - Badge shows "Đang tuyển" (blue, pulsing dot)
   - Footer text: "Còn thiếu 2 thành viên để hoàn thiện nhóm"

### Test "Đã đủ" Status

1. Accept applicants until group reaches **4/4 members**
2. View GroupMembersCard
3. **Verify**:
   - Badge shows "Đá đủ" (green, solid dot)
   - No footer text (group is complete)

### Test Disabled Buttons When in Group

1. **Login as user already in a group** (currentTeamCount > 0)
2. Navigate to **Ghép nhóm**
3. **Verify**:
   - "Tìm nhóm" button is **DISABLED** (grey, shows "Đã có nhóm")
   - "Gửi yêu cầu tham gia" button is **DISABLED**
4. Hover over buttons to see disabled state

**Expected Result**: ✅ Group status updates correctly based on member count, buttons disabled when user is in group

---

## Test 5: Edge Cases 🔍

### Test No Team Scenario

1. **Login as user NOT in any group** (new user or `teamId: null`)
2. Navigate to **Dashboard**
3. **Verify**: GroupMembersCard does NOT appear (conditional render)

### Test Minimum Members for Peer Review

1. Create a group with **only 1 member**
2. Login as lecturer, try to lock milestone for that group
3. **Expected**: Toast warning "Cần ít nhất 2 thành viên để khởi tạo đánh giá chéo"

### Test Peer Review Already Exists

1. Lock milestone (creates peer reviews)
2. Try to lock it again (or unlock then lock again)
3. **Expected**: System should handle gracefully (either skip or update existing reviews)

---

## Visual Inspection Checklist ✨

### GroupMembersCard Component

- [ ] Card has rounded corners (rounded-2xl)
- [ ] Card has subtle shadow (shadow-xs)
- [ ] Header shows group icon (Users) in blue circle
- [ ] Header shows group name and member count
- [ ] Status badge is visible and correct color
- [ ] Members are displayed in a vertical list
- [ ] Leader has gradient background (blue-to-indigo)
- [ ] Leader has crown icon (👑) badge
- [ ] Non-leaders have grey background
- [ ] Skills are displayed as small pills (max 3 shown, "+X more" if more)
- [ ] Email addresses are visible with mail icon
- [ ] Footer shows remaining members count (if not full)

### Milestone Lock Button

- [ ] Button shows "Khóa mốc" when milestone is "Đang mở"
- [ ] Button changes status badge to "Đã khóa" with lock icon
- [ ] Two toasts appear in sequence (status change + peer review)

### Dashboard Integration

- [ ] GroupMembersCard appears ABOVE "Đóng góp thành viên" section
- [ ] Card width matches page layout
- [ ] Card is responsive (looks good on mobile)

### Matchmaking Integration

- [ ] GroupMembersCard appears at BOTTOM of page
- [ ] Card is below ReviewApplicantsModal trigger
- [ ] Card does not interfere with schedule matrix or match score

---

## Console Checks 🖥️

### Open Browser DevTools (F12) → Console Tab

#### Expected Logs:

```
🔄 Subscribing to tasks for group: nhom_04
🔄 Subscribing to milestones for course: course_2024_2025
🔄 Subscribing to applications for group: nhom_04
🔄 Subscribing to peer reviews for group: nhom_04 milestone: m2
📋 Tasks updated: X
🎯 Milestones updated: X
📨 Applications updated: X
⭐ Peer reviews updated: X
```

#### No Errors Expected:

- ❌ NO "Cannot read properties of undefined"
- ❌ NO "TypeError: X is not a function"
- ❌ NO red error messages

---

## Firebase Firestore Data Structure

### `groups` Collection

```javascript
{
  id: "nhom_04",
  name: "Nhóm 04",
  code: "NHM-004",
  courseId: "course_2024_2025",
  maxMembers: 4,
  currentMemberCount: 4,
  memberIds: ["user_trung_leader", "user_cuc", "user_duc", "user_nga"],
  createdBy: "user_trung_leader",
  createdAt: "2024-01-15T10:30:00Z",
  status: "full", // or "recruiting"
  skillsNeeded: ["Backend (Node.js)", "DevOps"],
  schedule: { T2: { Sáng: true, Tối: true }, ... }
}
```

### `peerReviews` Collection (after locking milestone)

```javascript
{
  id: "nhom_04_m2_anon_abc123_anon_def456",
  groupId: "nhom_04",
  milestoneId: "m2",
  reviewerId: "user_trung_leader", // Real ID (hidden from students)
  targetId: "user_cuc", // Real ID (hidden from students)
  reviewerIdHash: "anon_abc123", // Anonymous hash
  targetIdHash: "anon_def456", // Anonymous hash
  c1: 0, // Contribution score (0-5)
  c2: 0, // Quality score (0-5)
  c3: 0, // Teamwork score (0-5)
  comment: "",
  status: "pending", // "pending" | "evaluating" | "done"
  updatedAt: [Firestore Timestamp],
  submittedAt: null
}
```

---

## Troubleshooting 🔧

### Issue: GroupMembersCard doesn't appear

**Causes**:

- User is not in a group (`currentUser.teamId` is null)
- Group has no members in Firestore
- `groupService.getGroupMembers()` failing

**Fix**:

1. Check browser console for errors
2. Check Firestore: `groups/{groupId}` has `memberIds` array
3. Check Firestore: `users/{userId}` has `teamId` field

### Issue: "Khóa mốc" doesn't trigger peer review

**Causes**:

- Milestone status didn't change to "Đã khóa"
- Group has < 2 members
- Network error calling Firestore

**Fix**:

1. Check console for "Error triggering peer review"
2. Verify group member count in Firestore
3. Check Network tab (F12) for failed API calls

### Issue: Member count not updating after accept

**Causes**:

- `groupService.addMemberToGroup()` failed
- Firestore security rules blocking write
- Page needs refresh to fetch new data

**Fix**:

1. Check console for "Error adding member to group"
2. Refresh page to trigger useEffect again
3. Check Firestore rules allow group updates

---

## Success Criteria ✅

All tests pass if:

- ✅ GroupMembersCard displays correctly on Dashboard and Matchmaking
- ✅ Accepting applicant adds member to Firestore and updates UI
- ✅ Locking milestone creates peer review entries in Firestore
- ✅ Group status badges update correctly based on member count
- ✅ Leader is identified with crown icon
- ✅ No console errors during normal operation
- ✅ Toast messages appear at correct times

---

**Happy Testing!** 🎉

If you encounter any issues, check the `TASK_8_INTEGRATION_COMPLETE.md` file for implementation details.
