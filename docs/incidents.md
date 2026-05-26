# Báo cáo Sự cố Hệ thống (Incident Report)

Tài liệu này báo cáo và phân tích 3 sự cố thực tế xảy ra trong quá trình phát triển và vận hành hệ thống EventHub, áp dụng mô hình **Tư duy các tầng (Layer Thinking)** để phân loại và xử lý.

---

## 1. Sự cố 1: Lỗi chiếm dụng cổng 5000 (EADDRINUSE)

### Hiện tượng
Khi chạy lệnh khởi động backend `npm run dev` hoặc `docker compose up`, terminal xuất hiện thông báo lỗi và tiến trình tự động thoát:
```text
Error: listen EADDRINUSE: address already in use :::5000
    at Server.setupLsnr [as _setupListener] (node:net:1904:7)
    at respond (node:net:1982:11) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 5000
}
```

### Phân tích Layer lỗi
- **Layer:** **L1 - Infrastructure (Hạ tầng hệ thống)**.
- **Giải thích:** Cổng mạng (Network Port 5000) thuộc tài nguyên hạ tầng của hệ điều hành máy chủ bị tranh chấp bởi hai tiến trình chạy song song.

### Nguyên nhân
- Đang có một ứng dụng chạy ngầm khác (ví dụ: một docker container cũ, một tiến trình Node.js chạy ngầm chưa bị kill, hoặc dịch vụ AirPlay trên macOS) đang lắng nghe trên cổng 5000 của hệ thống.

### Cách khắc phục (Fix)
1. Xác định ID tiến trình (PID) đang chạy chiếm cổng 5000:
   - Trên Windows (PowerShell):
     ```powershell
     netstat -ano | findstr :5000
     ```
   - Trên Linux/macOS:
     ```bash
     lsof -i :5000
     ```
2. Kết thúc tiến trình đó (Ví dụ PID tìm thấy là `1234`):
   - Trên Windows:
     ```powershell
     taskkill /F /PID 1234
     ```
   - Trên Linux/macOS:
     ```bash
     kill -9 1234
     ```
3. Chạy lại lệnh khởi động backend.

### Cách phòng tránh
- Đảm bảo dừng hoàn toàn các container/tiến trình cũ trước khi chạy tiến trình mới (`docker compose down`, `pm2 stop`, v.v.).
- Sử dụng các cổng ngẫu nhiên hoặc biến cấu hình cổng linh động qua file `.env`.

---

## 2. Sự cố 2: Lỗi CORS khi gọi API từ Frontend sang Backend

### Hiện tượng
Ứng dụng Frontend load được giao diện nhưng toàn bộ dữ liệu sự kiện trống rỗng. Nhấp chuột phải chọn **Inspect** -> xem tab **Console** của Trình duyệt thấy xuất hiện lỗi màu đỏ:
```text
Access to fetch at 'http://localhost:5000/api/events' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Phân tích Layer lỗi
- **Layer:** **L3 - Backend API**.
- **Giải thích:** Lỗi xảy ra do cơ chế bảo mật Same-Origin Policy trên trình duyệt chặn tài nguyên. Cấu hình CORS ở tầng API Backend chưa khai báo cho phép nguồn (Origin) từ Frontend truy cập.

### Nguyên nhân
- Khi chạy cục bộ, Frontend chạy ở cổng 3000 (`http://localhost:3000`) và Backend chạy ở cổng 5000 (`http://localhost:5000`).
- File `server.js` của backend sử dụng middleware `cors()` nhưng chưa chỉ định rõ hoặc cấu hình sai địa chỉ nguồn được phép truy cập trong môi trường phát triển/production.

### Cách khắc phục (Fix)
1. Trong file `backend/server.js`, kiểm tra và bổ sung cấu hình cors:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```
2. Khai báo biến `FRONTEND_URL` tương ứng trong file cấu hình `.env`.

### Cách phòng tránh
- Luôn duy trì đồng bộ file `.env` và `.env.example` về các URL của Frontend và Backend.
- Sử dụng cơ chế Proxy ngược của Vite (`server.proxy` trong `vite.config.js`) khi phát triển cục bộ để biến đổi các request từ `/api` sang cùng origin, loại bỏ hoàn toàn lỗi CORS lúc dev.

---

## 3. Sự cố 3: Kết nối Database thất bại do cấu hình sai Environment Variables

### Hiện tượng
Khi khởi chạy backend, server in ra lỗi log trong console và crash liên tục:
```text
❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables
```
Hoặc khi người dùng thực hiện đăng ký tài khoản, hệ thống trả về lỗi `500 Internal Server Error` và log backend ghi nhận:
```text
Error: FetchError: Invalid URL (https://your-supabase-project.supabase.co)
```

### Phân tích Layer lỗi
- **Layer:** **L2 - External Database**.
- **Giải thích:** Backend API (L3) không thể thiết lập kết nối hợp lệ tới dịch vụ cơ sở dữ liệu Supabase (L2).

### Nguyên nhân
- File cấu hình `.env` ở thư mục gốc bị thiếu hoặc chứa các thông số URL/Key mặc định (placeholders) chưa được thay thế bằng thông số thực tế của dự án Supabase.
- Tiến trình Node.js không đọc được file `.env` do sai đường dẫn nạp cấu hình `dotenv`.

### Cách khắc phục (Fix)
1. Tạo một project trên Supabase Dashboard và lấy thông tin `Project URL`, `Anon Key`, và `Service Role Key`.
2. Điền chính xác các giá trị này vào file `.env` ở thư mục gốc của dự án:
   ```env
   SUPABASE_URL=https://cgkvomeozjggngnfysve.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_TksOmefGW...
   ```
3. Đảm bảo khởi tạo dotenv chính xác trong `backend/server.js`:
   ```javascript
   require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
   ```

### Cách phòng tránh
- Luôn commit file `.env.example` chứa cấu hình mẫu không có giá trị nhạy cảm để lập trình viên khác biết các biến cần khai báo.
- Thêm bước kiểm tra tính hợp lệ của các biến môi trường thiết yếu ngay khi khởi chạy Server, nếu thiếu phải thông báo rõ lỗi và dừng ứng dụng ngay lập tức thay vì để lỗi xảy ra ở runtime.
