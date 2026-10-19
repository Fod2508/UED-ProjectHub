# 🚀 Hướng dẫn Deploy Render & Cấu hình Cronjob Đánh thức Web (24/7)

Hệ thống **UED-ProjectHub** đã được chuẩn bị đầy đủ:
1. `server.js` (Express Server phục vụ Single Page App + Endpoint `/health`).
2. `public/health.json` và `public/health.html` (Health check fallback).
3. `render.yaml` (File Blueprint cấu hình tự động của Render).
4. `package.json` đã thêm lệnh `npm start` (`node server.js`).

---

## 📌 PHẦN 1: Hai Cách Deploy lên Render

### 👉 Cách 1: Deploy dạng "Web Service" (Node.js) - [Khuyên Dùng khi chạy server + Cronjob]
Cách này chạy Node.js server (`server.js`), có endpoint `/health` trả về JSON trạng thái + thời gian uptime, rất thích hợp dùng cronjob ping để giữ server luôn thức:

1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com).
2. Bấm **New +** ➔ Chọn **Web Service**.
3. Kết nối với GitHub Repository của bạn (`UED-ProjectHub`).
4. Cấu hình các thông số sau:
   * **Name**: `ued-projecthub` (hoặc tên tuỳ chọn).
   * **Region**: `Singapore` (để tốc độ tải ở Việt Nam nhanh nhất).
   * **Branch**: `main` (hoặc nhánh bạn push code lên).
   * **Runtime**: `Node`.
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free`.
5. Bấm vào **Advanced**:
   * **Health Check Path**: nhập `/health`
   * **Environment Variables**: Thêm các biến môi trường từ file `.env` của bạn:
     * `VITE_FIREBASE_API_KEY`
     * `VITE_FIREBASE_AUTH_DOMAIN`
     * `VITE_FIREBASE_PROJECT_ID`
     * `VITE_FIREBASE_STORAGE_BUCKET`
     * `VITE_FIREBASE_MESSAGING_SENDER_ID`
     * `VITE_FIREBASE_APP_ID`
6. Bấm **Create Web Service**. Chờ Render build và cấp link có dạng:
   👉 `https://ued-projecthub.onrender.com`

---

### 👉 Cách 2: Deploy dạng "Static Site" (Không bao giờ ngủ!)
> [!TIP]
> Nếu bạn deploy dạng **Static Site** trên Render:
> * Render sẽ đưa toàn bộ thư mục `dist/` lên CDN toàn cầu.
> * **Static Site trên Render hoàn toàn KHÔNG BỊ SLEEP (không bao giờ ngủ)**, chạy 24/7 vĩnh viễn mà không cần thiết lập cronjob ping!
> * Cấu hình:
>   * **Build Command**: `npm run build`
>   * **Publish Directory**: `dist`
>   * **Redirects / Rewrites**: Thêm rule: Source `/*` ➔ Destination `/index.html` ➔ Action `Rewrite`.

---

## ⏰ PHẦN 2: Thiết Lập Cronjob Giữ Web Luôn Thức (Anti-Sleep 24/7)

> **Cơ chế của Render Free:** Sau **15 phút** không có người truy cập, Render Web Service sẽ tự động chuyển sang chế độ "ngủ" (Sleep). Lần sau có người vào sẽ phải đợi 30-50 giây để server khởi động lại.
> **Giải pháp:** Dùng dịch vụ Cronjob miễn phí gửi 1 request `GET /health` mỗi **10 phút** để Render luôn nhận diện server đang hoạt động và không bao giờ ngủ!

### Cách thiết lập với cron-job.org (Miễn phí 100% & Cực kỳ ổn định):

1. Truy cập [https://cron-job.org](https://cron-job.org) và đăng ký tài khoản miễn phí.
2. Tại trang quản trị, bấm **Create Cronjob**.
3. Điền các thông tin sau:
   * **Title**: `Keep UED-ProjectHub Awake`
   * **URL**: `https://<ten-du-an-cua-ban>.onrender.com/health`  
     *(Ví dụ: `https://ued-projecthub.onrender.com/health`)*
   * **Schedule (Tần suất)**: Chọn **Every 10 minutes** (Mỗi 10 phút một lần).
   * **Request Method**: `GET`
   * **Request Timeout**: `30 seconds`
4. Bấm **Create**.

Xong! Cứ mỗi 10 phút, cron-job.org sẽ tự động ping vào `/health`. Server sẽ nhận request, reset bộ đếm thời gian ngủ và duy trì trạng thái thức 24/7 để bạn và thầy cô, bạn bè truy cập lúc nào cũng nhanh chóng tức thì!

---

## 🩺 PHẦN 3: Các Endpoint Health Check Sẵn Có

Sau khi deploy lên Render, bạn có thể kiểm tra trực tiếp trên trình duyệt:

1. **`GET /health` hoặc `GET /api/health`** (JSON Data):
   * Trả về HTTP `200 OK`:
   ```json
   {
     "status": "healthy",
     "message": "UED-ProjectHub Web Service is awake and running!",
     "timestamp": "2026-10-20T00:44:49.125Z",
     "uptime": "1h 25m 10s",
     "service": "UED-ProjectHub",
     "institution": "Khoa CNTT - Trường ĐH Sư phạm, ĐH Đà Nẵng",
     "memoryUsageMB": 8.5
   }
   ```
2. **`GET /health.html`** (Giao diện trực quan):
   * Trang hiển thị giao diện xanh lá `HEALTHY • 200 OK` đẹp mắt để kiểm tra nhanh.
