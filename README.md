# EventHub - Event Registration App 🎫

Hệ thống đăng ký sự kiện - Tạo sự kiện, đăng ký tham gia, quản lý người tham dự, và quản trị tài khoản người dùng tích hợp phân quyền Admin/User.

---

## 📚 Tài liệu Hướng dẫn & Báo cáo Đồ án

Nhằm đảm bảo các tiêu chí chấm điểm DevOps nâng cao và tư duy hệ thống, các tài liệu kỹ thuật chi tiết đã được bổ sung vào thư mục `docs/`:

1. **[Kiến trúc Hệ thống (Architecture)](./docs/architecture.md)**: Sơ đồ tương tác L1-L4 (Layer Thinking) và quy trình luồng dữ liệu bằng Mermaid.
2. **[Quy trình tích hợp liên tục (CI/CD Flow)](./docs/cicd.md)**: Sơ đồ hóa pipeline GitHub Actions tự động kiểm tra code (`lint`, `test`, `build`).
3. **[Hướng dẫn Triển khai (Deployment Guide)](./docs/deployment.md)**: Hướng dẫn đóng gói Docker Multi-stage, Docker Compose và cách triển khai lên VPS/WSL/Cloud.
4. **[Báo cáo 3 Sự cố thực tế (Incident Report)](./docs/incidents.md)**: Phân tích nguyên nhân và cách khắc phục sự cố (EADDRINUSE, CORS, Env DB mismatch) theo tư duy hệ thống.

---

## 🛠️ Tech Stack & Database

- **Frontend:** React 19 (Vite) + CSS Glassmorphism
- **Backend:** Node.js + Express.js + RESTful APIs
- **Database:** Supabase (PostgreSQL Cloud)
- **CI/CD:** GitHub Actions
- **Containerization:** Docker + Docker Compose

---

## 📁 Cấu trúc thư mục dự án

```text
├── .github/
│   └── workflows/
│       └── ci.yml             # Github Actions Pipeline (Lint, Test, Build)
├── docs/                      # Tài liệu hệ thống và báo cáo sự cố (L1-L4)
│   ├── architecture.md
│   ├── cicd.md
│   ├── deployment.md
│   └── incidents.md
├── backend/
│   ├── server.js              # Express server & API routes mount
│   ├── database.js            # Khởi tạo client kết nối Supabase Cloud DB
│   ├── seed.js                # Seed dữ liệu mẫu ban đầu
│   ├── routes/
│   │   ├── health.js          # GET /api/health (Endpoint bắt buộc)
│   │   ├── auth.js            # Đăng nhập & Đăng ký tài khoản
│   │   ├── events.js          # CRUD quản lý sự kiện
│   │   ├── registrations.js   # Đăng ký & Hủy tham gia sự kiện
│   │   └── users.js           # CRUD Quản lý người dùng (Admin-only)
│   └── middleware/
│       └── auth.js            # Xác thực JWT Token & Quyền Admin
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Điều phối Router và Giao diện chính
│   │   ├── api.js             # API Client (Gọi API Backend với VITE_API_BASE_URL)
│   │   ├── index.css          # Design System, dark-theme & badge styles
│   │   └── components/        # React components (Dashboard, UserForm, v.v.)
│   └── test-stub.js           # Test stub cho Frontend chạy CI
├── Dockerfile                 # Dockerfile tối ưu Multi-stage build cho Frontend/Backend
├── docker-compose.yml         # Docker Compose quản lý container và nạp env
└── .env.example               # File chứa các biến môi trường mẫu
```

---

## 🚀 Khởi chạy Nhanh bằng Docker Compose

Bạn chỉ cần thực hiện một lệnh duy nhất để chạy toàn bộ hệ thống (Frontend + Backend + DB Connection) trên Production hoặc môi trường WSL:

1. Sao chép file cấu hình môi trường:
   ```bash
   cp .env.example .env
   ```
2. Cập nhật các thông số Supabase Cloud thực tế trong file `.env`.
3. Khởi động Docker Compose:
   ```bash
   docker compose up -d --build
   ```
4. Truy cập ứng dụng tại:
   - **Frontend & Backend (được đóng gói chung):** `http://localhost:5001`

---

## 🔑 Tài khoản Đăng nhập Mẫu (Seed Data)
- **Tài khoản Admin:** `admin` / mật khẩu: `admin123` (Có quyền truy cập Dashboard và Quản lý người dùng).
- **Tài khoản User:** `user1` / mật khẩu: `password123` (Đăng ký/hủy đăng ký tham gia sự kiện).
