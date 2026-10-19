# 🚀 Phase 6 Quick Start

## 📋 Tổng quan

Phase 6 đã hoàn tất việc chuẩn bị UED-ProjectHub cho production deployment với:

- ✅ Security Rules (role-based access)
- ✅ Performance Indexes
- ✅ Loading States
- ✅ Error Handling
- ✅ Deployment Configuration

---

## 🔥 Deploy to Production (5 minutes)

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Review Security Rules (CRITICAL!)

```bash
cat firestore.rules
```

**Verify:**

- ✅ No `allow read, write: if true;` (public access)
- ✅ Authentication required for all collections
- ✅ Role-based access (student, lecturer, group leader)

### Step 3: Build Production

```bash
npm run build
```

**Expected output:**

```
✓ built in X.XXs
dist/index.html         0.45 kB
dist/assets/index.js    234 kB │ gzip: 78 kB
```

### Step 4: Deploy

```bash
firebase deploy
```

**Expected output:**

```
✔  Deploy complete!

Hosting URL: https://ued-projecthub.web.app
```

### Step 5: Verify

Open: https://ued-projecthub.web.app

**Test:**

- ✅ Login works
- ✅ Tasks load
- ✅ Realtime sync works (2 browsers)
- ✅ Security rules enforced (try unauthorized access)

---

## 🔐 Security Rules Overview

### Collections Protected:

**users**

- Read: Any authenticated user
- Write: Own profile + lecturers

**tasks**

- Read: Team members + lecturers
- Write: Team members
- Delete: Group leaders + lecturers

**milestones**

- Read: All authenticated users
- Write: Lecturers only

**applications**

- Read: Applicant + target team + lecturers
- Write: Group leaders (approve/reject) + lecturers

**peerReviews**

- Read: Team members (anonymized) + lecturers
- Write: Team members (own reviews) + lecturers

---

## 📊 Performance Optimizations

### Firestore Indexes

11 composite indexes created for:

- Tasks filtering and sorting
- Milestone queries
- Application queries
- Peer review queries

**Deploy indexes:**

```bash
firebase deploy --only firestore:indexes
```

### Loading Skeletons

```typescript
import { TaskListSkeleton } from "./components/LoadingSkeleton";

// Show while loading
if (loading) return <TaskListSkeleton count={5} />;
```

### Error Boundaries

```typescript
import { ErrorBoundary } from "./components/ErrorBoundary";

<ErrorBoundary>
  {/* Your components */}
</ErrorBoundary>
```

---

## 🧪 Testing Security Rules

### Test 1: Unauthorized Access

```bash
# 1. Logout
# 2. Try to access /dashboard
# Expected: Redirect to /login
```

### Test 2: Cross-Team Access

```bash
# 1. Login as User A (Team 1)
# 2. Try to read Team 2's tasks via console:
#    getDocs(query(collection(db, "tasks"), where("groupId", "==", "team_2")))
# Expected: Empty array or permission denied
```

### Test 3: Role-Based Deletion

```bash
# 1. Login as student
# 2. Try to delete milestone
# Expected: Permission denied

# 3. Login as lecturer
# 4. Delete milestone
# Expected: Success
```

---

## 📁 New Files (Phase 6)

```
UED-ProjectHub/
├── firestore.rules               # Security rules (CRITICAL)
├── firestore.indexes.json        # Performance indexes
├── firebase.json                 # Hosting config
├── .firebaserc                   # Project config
├── src/
│   └── components/
│       ├── LoadingSkeleton.tsx   # Loading states
│       └── ErrorBoundary.tsx     # Error handling
├── PHASE_6_COMPLETE.md           # Phase 6 summary
├── DEPLOYMENT_GUIDE.md           # Step-by-step deployment
└── README_PHASE_6.md             # This file
```

---

## 🚨 Before Deploying (Checklist)

- [ ] `npm run lint` → No errors
- [ ] `npm run build` → Success
- [ ] Review `firestore.rules` → No public access
- [ ] Test all features on localhost
- [ ] Backup current production data (if exists)
- [ ] Review Firestore usage quotas

---

## 🔄 Rollback Plan

If deployment fails:

### Option 1: Rollback via Firebase Console

1. Firebase Console → Hosting
2. Select previous version
3. Click "Rollback"

### Option 2: Redeploy previous version

```bash
git checkout <previous-commit>
npm run build
firebase deploy --only hosting
```

---

## 📞 Troubleshooting

### Issue: Permission Denied Errors

**Symptom:** `Missing or insufficient permissions`

**Solution:**

```bash
# 1. Verify rules deployed
firebase deploy --only firestore:rules

# 2. Check user has correct fields
# Firebase Console → Firestore → users → {userId}
# Verify: role, teamId, isGroupLeader

# 3. Test rules in Firebase Console
# Firestore → Rules → Playground
```

### Issue: Indexes Not Built

**Symptom:** `The query requires an index`

**Solution:**

```bash
# 1. Click error link to create index
# OR
# 2. Deploy indexes
firebase deploy --only firestore:indexes

# 3. Wait 5-10 minutes for build
```

### Issue: Hosting 404 on Refresh

**Symptom:** Refreshing page shows 404

**Solution:**

```bash
# Verify firebase.json has SPA rewrite
cat firebase.json | grep -A 3 "rewrites"

# Should see:
# "rewrites": [
#   { "source": "**", "destination": "/index.html" }
# ]

# Redeploy
firebase deploy --only hosting
```

---

## 📈 Monitoring

### Check Usage

Firebase Console → Usage

**Monitor:**

- Firestore reads/writes (free tier: 50K/20K per day)
- Hosting bandwidth (free tier: 10 GB/month)
- Authentication users (unlimited)

### Check Performance

Firebase Console → Performance

**Monitor:**

- Page load times
- API response times
- Network requests

### Check Errors

Browser Console (DevTools)

**Watch for:**

- Firebase errors (permission denied, etc.)
- Network errors (failed to fetch, etc.)
- React errors (caught by ErrorBoundary)

---

## 🎯 Success Criteria

### Deployment Success ✅

- [ ] Production URL accessible
- [ ] No console errors
- [ ] Authentication works
- [ ] Realtime sync works
- [ ] Security rules enforced

### Performance ✅

- [ ] Page load < 3 seconds
- [ ] Firestore queries < 500ms
- [ ] No network errors
- [ ] Mobile responsive

### Security ✅

- [ ] No public read/write access
- [ ] Unauthorized access blocked
- [ ] Cross-team isolation enforced
- [ ] Lecturer privileges work

---

## 📚 Documentation

### Complete Documentation:

- **PHASE_6_COMPLETE.md** - Detailed phase 6 summary
- **DEPLOYMENT_GUIDE.md** - Full deployment instructions
- **FIREBASE_INTEGRATION_COMPLETE.md** - All phases summary
- **TEST_PHASE_5.md** - Testing guide for Phase 5
- **firestore.rules** - Security rules with comments

### Quick Links:

- Firebase Console: https://console.firebase.google.com/project/ued-projecthub
- Production URL: https://ued-projecthub.web.app
- Documentation: See markdown files in project root

---

## 🎉 Phase 6 Complete!

**Status:** ✅ Production-ready

**Next steps:**

1. Deploy to Firebase Hosting
2. Test with real users
3. Monitor usage and performance
4. Iterate based on feedback

**Commands to remember:**

```bash
# Build
npm run build

# Deploy everything
firebase deploy

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only hosting
firebase deploy --only hosting

# View logs
firebase functions:log
```

---

**Congratulations! Your app is ready for production! 🚀**
