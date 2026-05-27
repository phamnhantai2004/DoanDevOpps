# EventHub - Hệ Thống Quản Lý Sự Kiện 🎫

Ứng dụng quản lý sự kiện full-stack: tạo sự kiện, đăng ký tham gia, quản lý người tham dự và phân quyền Admin/User. Được xây dựng với React (Vite) + Node.js (Express) + MySQL, triển khai bằng Docker và CI/CD tự động qua GitHub Actions.

---

## 📚 Tài liệu Hướng dẫn & Báo cáo Đồ án

Các tài liệu kỹ thuật chi tiết trong thư mục `docs/`:

1. **[Kiến trúc Hệ thống (Architecture)](./docs/architecture.md)**: Sơ đồ tương tác L1-L4 và luồng dữ liệu bằng Mermaid.
2. **[Quy trình CI/CD](./docs/cicd.md)**: Pipeline GitHub Actions tự động kiểm tra code (`lint`, `test`, `build`).
3. **[Hướng dẫn Triển khai (Deployment Guide)](./docs/deployment.md)**: Docker Multi-stage, Docker Compose và triển khai lên VPS/Cloud.
4. **[Báo cáo Sự cố (Incident Report)](./docs/incidents.md)**: Phân tích và khắc phục sự cố thực tế.

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React 18, Vite, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MySQL 8 |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Deploy | Vercel (Frontend), Railway / VPS (Backend) |

---

## 📁 Cấu trúc thư mục dự án

```text
DoanDevOpps/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions Pipeline (Lint, Test, Build)
├── docs/                      # Tài liệu hệ thống và báo cáo sự cố
│   ├── architecture.md
│   ├── cicd.md
│   ├── deployment.md
│   └── incidents.md
├── backend/                   # Express REST API
│   ├── server.js              # Express server & API routes
│   ├── database.js            # Kết nối Database
│   ├── routes/                # API routes (auth, events, users...)
│   └── middleware/            # Auth middleware (JWT)
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx            # Root component & Router
│   │   ├── api.js             # Axios API client
│   │   ├── index.css          # Design system & dark theme
│   │   └── components/        # UI components (Dashboard, EventList...)
│   └── Dockerfile
├── docker-compose.yml         # Docker Compose orchestration
└── .env.example               # Biến môi trường mẫu
```

---

## 🚀 Khởi chạy nhanh

### Yêu cầu
- Docker & Docker Compose
- Node.js >= 18

### Chạy với Docker Compose

```bash
cp .env.example .env
# Cập nhật các thông số trong .env
docker compose up -d --build
```

Sau khi khởi động:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Chạy thủ công

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📋 Tính năng chính

- ✅ Xác thực người dùng (JWT)
- ✅ Phân quyền Admin / User
- ✅ Quản lý sự kiện (CRUD)
- ✅ Đăng ký / hủy đăng ký sự kiện
- ✅ Dashboard thống kê với auto-refresh
- ✅ Quản lý người dùng (Admin)
- ✅ Thông báo real-time (Toast)

---

## 🔑 Tài khoản mặc định (Seed Data)

| Role | Tài khoản | Mật khẩu |
|------|-----------|-----------|
| Admin | admin@example.com | admin123 |
| User | user1@example.com | password123 |

---

## 🔄 CI/CD Pipeline

Pipeline GitHub Actions tự động:
1. **Build** — Cài dependencies và build Docker image
2. **Test** — Chạy unit tests
3. **Deploy** — Push image lên registry và deploy lên Vercel / VPS

---

> Đồ án DevOps — 2026