# 🚀 Deployment Guide - UED-ProjectHub

## 📋 Tổng quan

Hướng dẫn deploy UED-ProjectHub lên production với Firebase Hosting và Firestore.

---

## ✅ Checklist trước khi Deploy

### 1. Code Quality

- [ ] `npm run lint` - No TypeScript errors
- [ ] `npm run build` - Build thành công
- [ ] Test tất cả features trên localhost
- [ ] Review security rules (`firestore.rules`)

### 2. Firebase Configuration

- [ ] `.env` file có đầy đủ Firebase credentials
- [ ] Firestore Security Rules đã được review
- [ ] Firestore Indexes đã được tạo
- [ ] Authentication providers enabled (Email/Password)

### 3. Production Optimizations

- [ ] Remove console.logs không cần thiết (hoặc dùng `console.log` conditionally)
- [ ] Check Vite production config
- [ ] Optimize images and assets
- [ ] Test trên nhiều browsers (Chrome, Firefox, Safari, Edge)

---

## 🔧 Bước 1: Setup Firebase CLI

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase in project

```bash
firebase init
```

Chọn các options:

- **Firestore**: Yes
  - Rules file: `firestore.rules`
  - Indexes file: `firestore.indexes.json`
- **Hosting**: Yes
  - Public directory: `dist` (Vite build output)
  - Single-page app: Yes
  - GitHub auto-deploys: No (for now)
- **Project**: Select `ued-projecthub`

---

## 🔐 Bước 2: Deploy Firestore Security Rules

### Review Security Rules

Mở `firestore.rules` và review toàn bộ rules:

```bash
# View current rules
cat firestore.rules
```

**CRITICAL CHECKS:**

- ✅ All collections có access control
- ✅ No `allow read, write: if true;` (public access)
- ✅ Authentication required cho mọi operations
- ✅ Role-based access (student, lecturer, group leader)

### Test Security Rules (Optional but Recommended)

```bash
firebase emulators:start --only firestore
```

Sau đó test rules bằng cách:

- Đăng nhập với các user khác nhau
- Thử access data của team khác
- Verify rằng unauthorized access bị block

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

**Expected output:**

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/ued-projecthub/overview
```

---

## 📊 Bước 3: Deploy Firestore Indexes

### Review Indexes

Mở `firestore.indexes.json` và kiểm tra:

```bash
cat firestore.indexes.json
```

**Indexes cần có:**

- `tasks`: (groupId, status), (groupId, milestoneId), (groupId, createdAt DESC)
- `milestones`: (courseId, dueDate), (courseId, weight DESC)
- `applications`: (targetGroupId, appliedAt DESC), (targetGroupId, status)
- `peerReviews`: (groupId, milestoneId), (groupId, milestoneId, status), ...

### Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

**Note:** Firestore sẽ build indexes, có thể mất vài phút.

Check trạng thái:

- Firebase Console → Firestore → Indexes
- Đợi status: "Enabled" (màu xanh)

---

## 🏗️ Bước 4: Build Production Bundle

### Build với Vite

```bash
npm run build
```

**Expected output:**

```
vite v5.x.x building for production...
✓ 123 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-abc123.css    12.34 kB │ gzip:  3.21 kB
dist/assets/index-abc123.js    234.56 kB │ gzip: 78.90 kB
✓ built in 3.45s
```

### Verify Build

```bash
# Check dist folder
ls -la dist/

# Preview production build locally
npm run preview
```

Mở http://localhost:4173 và test:

- ✅ Authentication flow
- ✅ Tasks, Milestones load
- ✅ Applications, Peer Reviews work
- ✅ No console errors

---

## 🚀 Bước 5: Deploy to Firebase Hosting

### Configure firebase.json

Tạo/update `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Deploy Everything

```bash
firebase deploy
```

Hoặc deploy từng phần:

```bash
# Deploy hosting only
firebase deploy --only hosting

# Deploy firestore only
firebase deploy --only firestore

# Deploy rules and hosting
firebase deploy --only firestore:rules,hosting
```

**Expected output:**

```
=== Deploying to 'ued-projecthub'...

i  deploying firestore, hosting
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
i  hosting[ued-projecthub]: beginning deploy...
i  hosting[ued-projecthub]: found 15 files in dist
✔  hosting[ued-projecthub]: file upload complete
i  hosting[ued-projecthub]: finalizing version...
✔  hosting[ued-projecthub]: version finalized
i  hosting[ued-projecthub]: releasing new version...
✔  hosting[ued-projecthub]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/ued-projecthub/overview
Hosting URL: https://ued-projecthub.web.app
```

---

## ✅ Bước 6: Verify Production Deployment

### 1. Access Production URL

Mở: https://ued-projecthub.web.app (hoặc custom domain)

### 2. Test Authentication

- Đăng ký tài khoản mới
- Đăng nhập
- Logout

### 3. Test Firestore Operations

- Create task
- Update task
- Delete task
- Check realtime sync (2 browsers)

### 4. Test Security Rules

**Scenario 1: Unauthorized access**

- Logout
- Try to access dashboard → Should redirect to login

**Scenario 2: Cross-team access**

- User A (Team 1) login
- Try to view Team 2's tasks → Should be empty/blocked

**Scenario 3: Role-based access**

- Student tries to delete milestone → Should fail
- Lecturer deletes milestone → Should succeed

### 5. Check Console Errors

- DevTools → Console
- No Firebase errors (permission denied, etc.)
- No network errors (CORS, 404, etc.)

### 6. Performance Check

- Lighthouse audit (DevTools → Lighthouse)
- Target scores:
  - Performance: > 90
  - Accessibility: > 90
  - Best Practices: > 90
  - SEO: > 80

---

## 🔄 Bước 7: Setup Custom Domain (Optional)

### Add Custom Domain

1. Firebase Console → Hosting → Add custom domain
2. Enter domain: `projecthub.example.com`
3. Copy DNS records (A, TXT)
4. Add DNS records to domain registrar (GoDaddy, Namecheap, etc.)
5. Wait for verification (24-48 hours)
6. SSL certificate auto-provisioned by Firebase

### Update .env for Custom Domain

```env
# Update if needed
VITE_FIREBASE_AUTH_DOMAIN=projecthub.example.com
```

Rebuild and redeploy:

```bash
npm run build
firebase deploy --only hosting
```

---

## 🔒 Bước 8: Security Hardening

### 1. Enable App Check (Recommended)

Firebase Console → App Check → Register app

**Benefits:**

- Prevent API abuse
- Block traffic from unauthorized clients
- Protect against scrapers and bots

```typescript
// src/config/firebase.ts
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("YOUR_RECAPTCHA_SITE_KEY"),
  isTokenAutoRefreshEnabled: true,
});
```

### 2. Review Firestore Rules Monthly

- Check for new vulnerabilities
- Update as features change
- Test with Firebase Emulator

### 3. Monitor Firestore Usage

Firebase Console → Usage → Firestore

- Watch read/write quotas
- Set up billing alerts
- Optimize queries to reduce costs

### 4. Setup Backup Strategy

```bash
# Manual backup (requires service account)
gcloud firestore export gs://ued-projecthub-backups/2024-01-15

# Automated daily backups (Cloud Scheduler + Cloud Functions)
```

---

## 📊 Bước 9: Monitoring & Analytics

### 1. Firebase Analytics (Optional)

```typescript
// src/config/firebase.ts
import { getAnalytics } from "firebase/analytics";

const analytics = getAnalytics(app);
```

Track events:

- User registrations
- Task creations
- Peer review submissions
- Error rates

### 2. Error Logging

Setup Sentry or similar:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

### 3. Performance Monitoring

Firebase Console → Performance

- Track page load times
- API response times
- Network requests

---

## 🔄 Bước 10: CI/CD Setup (Advanced)

### GitHub Actions

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          channelId: live
          projectId: ued-projecthub
```

**Setup:**

1. Generate Firebase service account
2. Add to GitHub Secrets: `FIREBASE_SERVICE_ACCOUNT`
3. Push to main → Auto deploy

---

## 🚨 Troubleshooting

### Issue 1: Permission Denied Errors

**Symptom:** `FirebaseError: Missing or insufficient permissions`

**Solution:**

1. Check Firestore rules deployed: `firebase deploy --only firestore:rules`
2. Verify user has correct `role` field in Firestore `users` collection
3. Check `teamId` field matches between user and data

### Issue 2: Indexes Not Built

**Symptom:** `The query requires an index`

**Solution:**

1. Copy index URL from error message
2. Click URL to create index in Firebase Console
3. Or deploy indexes: `firebase deploy --only firestore:indexes`
4. Wait for index build (5-10 minutes)

### Issue 3: Hosting 404 Errors

**Symptom:** Refresh page → 404 error

**Solution:**

1. Check `firebase.json` has SPA rewrite:

```json
"rewrites": [
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

2. Redeploy: `firebase deploy --only hosting`

### Issue 4: Slow Performance

**Symptom:** App loads slowly in production

**Solution:**

1. Check bundle size: `npm run build` → Look for large .js files
2. Code splitting: Lazy load views
3. Optimize images: Use WebP format
4. Enable CDN caching in `firebase.json`

---

## 📝 Post-Deployment Checklist

- [ ] Production URL accessible: https://ued-projecthub.web.app
- [ ] Authentication works (signup, login, logout)
- [ ] Firestore operations work (CRUD)
- [ ] Realtime sync works (test with 2 browsers)
- [ ] Security rules enforced (test unauthorized access)
- [ ] No console errors
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] Team notified of production URL

---

## 📞 Support

### Firebase Console

- https://console.firebase.google.com/project/ued-projecthub

### Useful Commands

```bash
# View logs
firebase functions:log

# Rollback hosting
firebase hosting:channel:deploy preview
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_CHANNEL_ID

# Check quota usage
firebase projects:list

# View rules
firebase firestore:rules get
```

### Documentation

- Firebase Hosting: https://firebase.google.com/docs/hosting
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Firebase CLI: https://firebase.google.com/docs/cli

---

**Deployment complete! 🎉**

Your UED-ProjectHub is now live and ready for production use!
