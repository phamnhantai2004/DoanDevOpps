# ==========================================
# Giai đoạn 1: Build Frontend (React Vite)
# ==========================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package.json và cài đặt dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy toàn bộ source code frontend và build
COPY frontend/ ./
RUN npm run build

# ==========================================
# Giai đoạn 2: Cài đặt Backend và chạy App
# ==========================================
FROM node:22-alpine

WORKDIR /app/backend

# Copy package.json và cài dependencies (chỉ production)
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy source code backend
COPY backend/ ./

# Khởi tạo dữ liệu seed cho lần chạy đầu tiên (Tuỳ chọn)
# (Đã chạy seed.js trực tiếp lên Supabase, không chạy trong build time)

# Copy bản build frontend từ giai đoạn 1 sang thư mục ứng với cấu hình của backend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Thiết lập biến môi trường
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Lệnh chạy khi start container
CMD ["node", "server.js"]
