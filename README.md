# EventHub - Hệ Thống Quản Lý Sự Kiện

Ứng dụng quản lý sự kiện full-stack được xây dựng với React (Vite) + Node.js (Express) + MySQL, triển khai bằng Docker và CI/CD qua GitHub Actions.

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React 18, Vite, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MySQL 8 |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Deploy | Vercel (Frontend), Railway / VPS (Backend) |

## 🚀 Khởi chạy nhanh

### Yêu cầu
- Docker & Docker Compose
- Node.js >= 18

### Chạy với Docker Compose
```bash
docker-compose up --build
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

## 📁 Cấu trúc project

```
DoanDevOpps/
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── api.js        # Axios API client
│   │   └── App.jsx       # Root component
│   └── Dockerfile
├── backend/           # Express REST API
│   ├── routes/        # API routes
│   ├── middleware/    # Auth middleware (JWT)
│   └── Dockerfile
└── docker-compose.yml
```

## 🔑 Tài khoản mặc định

| Role | Email | Mật khẩu |
|------|-------|-----------|
| Admin | admin@example.com | admin123 |

## 📋 Tính năng chính

- ✅ Xác thực người dùng (JWT)
- ✅ Phân quyền Admin / User
- ✅ Quản lý sự kiện (CRUD)
- ✅ Đăng ký / hủy đăng ký sự kiện
- ✅ Dashboard thống kê với auto-refresh
- ✅ Quản lý người dùng (Admin)
- ✅ Thông báo real-time (Toast)

## 🔄 CI/CD Pipeline

Pipeline GitHub Actions tự động:
1. **Build** - Cài dependencies và build Docker image
2. **Test** - Chạy unit tests
3. **Deploy** - Push image lên registry và deploy

---

> Đồ án DevOps - 2026