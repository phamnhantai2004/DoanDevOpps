# Kiến trúc Hệ thống EventHub

Tài liệu này mô tả chi tiết kiến trúc hệ thống, các luồng dữ liệu, và phân chia các tầng (Layer) của dự án EventHub.

---

## 1. Sơ đồ Kiến trúc Tổng quan (System Overview)

Dưới đây là sơ đồ tương tác giữa các thành phần trong hệ thống:

```mermaid
graph TD
    subgraph Client [L4: Frontend]
        FE[React App - Vite]
    end

    subgraph Server [L3: Backend API]
        BE[Node.js + Express Server]
        Auth[Auth Middleware]
        RouteUsers[Users Router]
        RouteEvents[Events Router]
        RouteReg[Registrations Router]
    end

    subgraph Data [L2: External Database]
        DB[(Supabase PostgreSQL)]
    end

    subgraph Host [L1: Infrastructure]
        VPS[Docker Container / Cloud Host]
    end

    FE -->|HTTP Requests / JSON| BE
    BE -->|Query / Insert / Update| DB
    Auth -.->|Verify JWT Token| BE
    BE -.->|Runs on| VPS
```

---

## 2. Phân chia các Tầng Hệ thống (Layer Thinking)

Theo mô hình **System Thinking (Tư duy hệ thống)**, EventHub được chia thành 4 lớp rõ ràng để dễ dàng quản lý, kiểm thử, và khắc phục sự cố (debugging):

| Tầng (Layer) | Tên Tầng | Vai trò chính | Các thành phần liên quan |
| :--- | :--- | :--- | :--- |
| **L4** | **Frontend (Client)** | Hiển thị giao diện UI, xử lý tương tác người dùng, gửi yêu cầu tới API backend. | React, Vite, Fetch API, HTML5/CSS3. |
| **L3** | **Backend API** | Tiếp nhận request, xác thực quyền (JWT), xử lý logic nghiệp vụ, trả về kết quả JSON. | Express.js, Routes (Auth, Users, Events, Registrations), bcryptjs. |
| **L2** | **External (Database)** | Lưu trữ dữ liệu hệ thống lâu dài, đảm bảo tính toàn vẹn của dữ liệu và quan hệ khóa ngoại. | Supabase (PostgreSQL), bảng `users`, `events`, `registrations`. |
| **L1** | **Infrastructure** | Môi trường lưu trữ và chạy container của ứng dụng. Cấu hình cổng, mạng, file hệ thống. | Docker, Docker Compose, VPS / WSL (Ubuntu), Biến môi trường (`.env`). |

---

## 3. Quy trình Đăng ký Sự kiện (Event Registration Flow)

```mermaid
sequenceDiagram
    participant User as Người dùng (L4)
    participant API as Backend Express (L3)
    participant DB as Supabase PostgreSQL (L2)

    User->>API: POST /api/registrations (Thông tin đăng ký)
    Note over API: Kiểm tra JWT Token & Trạng thái sự kiện
    API->>DB: SELECT max_participants, registered_count FROM events WHERE id = ?
    DB-->>API: Trả về thông tin sự kiện
    
    alt Số lượng đăng ký vượt quá giới hạn
        API-->>User: Trả về Lỗi 400 (Sự kiện đã hết chỗ)
    else Còn chỗ trống
        API->>DB: INSERT INTO registrations (...)
        DB-->>API: Lưu thành công
        API-->>User: Trả về Thành công 201 (Đã đăng ký)
    end
```
