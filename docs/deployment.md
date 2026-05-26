# Hướng dẫn Triển khai Hệ thống EventHub

Tài liệu này hướng dẫn cách build, chạy cục bộ bằng Docker và cách triển khai dự án EventHub lên các môi trường thực tế (VPS, WSL, Render, Vercel).

---

## 1. Triển khai bằng Docker & Docker Compose (Khuyên Dùng)

EventHub hỗ trợ Docker hóa hoàn chỉnh giúp dễ dàng triển khai lên bất kì máy chủ VPS hoặc môi trường WSL nào.

### Yêu cầu hệ thống
- Đã cài đặt **Docker Engine** và **Docker Compose**.
- Có file `.env` chứa đầy đủ cấu hình Supabase và JWT key.

### Hướng dẫn chạy Docker cục bộ / VPS
Từ thư mục gốc chứa file `docker-compose.yml`, chạy lệnh sau để build và khởi động hệ thống ở chế độ chạy ngầm (detached mode):

```bash
# Khởi động dịch vụ
docker compose up -d --build
```

### Các lệnh kiểm tra và quản lý container
```bash
# Kiểm tra danh sách container đang chạy
docker compose ps

# Xem log thời gian thực của container
docker compose logs -f event-app

# Dừng và xóa container nhưng giữ nguyên dữ liệu
docker compose down
```

---

## 2. Giải thích Dockerfile (Tối ưu hóa Multi-Stage Build)

File [Dockerfile](file:///e:/DevOpps/doanDevopps/DoanDevOpps/Dockerfile) của dự án áp dụng kỹ thuật **Multi-stage Build** nhằm giảm thiểu tối đa dung lượng Image khi deploy lên môi trường Production:

- **Giai đoạn 1: Build Frontend (React Vite)**
  - Sử dụng base image nhẹ `node:22-alpine`.
  - Cài đặt đầy đủ dependencies phát triển và chạy lệnh `npm run build` để đóng gói frontend thành thư mục `dist` tối ưu.
- **Giai đoạn 2: Production Stage**
  - Tiếp tục sử dụng `node:22-alpine` sạch để làm môi trường chạy.
  - Cài đặt backend dependencies bỏ qua devDependencies bằng cờ `--omit=dev` (hoặc `--production`).
  - Copy file mã nguồn của backend và kéo thư mục tĩnh `/dist` của frontend từ Giai đoạn 1 sang.
  - Kết quả: Dung lượng image giảm đáng kể do không chứa mã nguồn React và các thư viện biên dịch thừa (như Vite, plugin...).

---

## 3. Quy trình Triển khai Lên VPS/WSL (Ubuntu) Thủ công

Nếu không sử dụng Docker, quy trình triển khai thủ công bắt buộc phải tuân theo thứ tự sau để tránh xung đột cấu hình:

### Bước 1: Deploy & Chạy Backend
1. Clone mã nguồn về VPS.
2. Cấu hình biến môi trường trong file `.env` ở thư mục gốc.
3. Chạy `npm install --production` trong thư mục `backend`.
4. Sử dụng PM2 hoặc Systemd để chạy ngầm `server.js` bền bỉ:
   ```bash
   pm2 start server.js --name "event-backend"
   ```

### Bước 2: Deploy & Build Frontend
1. Cấu hình CORS ở Backend để chấp nhận domain của Frontend.
2. Cài đặt và build frontend:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```
3. Cấu hình Nginx để phục vụ thư mục tĩnh `frontend/dist` và làm Proxy ngược (Reverse Proxy) chuyển hướng các request `/api/*` về backend port 5000.

---

## 4. Triển khai lên Cloud (Render / Vercel)

### Frontend (Deploy lên Vercel)
1. Đăng nhập Vercel, liên kết với Github Repo.
2. Chọn thư mục root là `DoanDevOpps/frontend`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Điền biến môi trường: `VITE_API_BASE_URL` trỏ về domain backend trên Render.

### Backend (Deploy lên Render)
1. Đăng ký Web Service trên Render, trỏ vào Github Repo.
2. Build Command: `npm install --omit=dev`.
3. Start Command: `node server.js`.
4. Khai báo đầy đủ các biến môi trường trong mục Environment của Render (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, v.v.).
