# Single container: Express serves the API and the built React app on one port.

FROM node:24-slim AS frontend
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

FROM node:24-slim
ENV NODE_ENV=production \
    PORT=8080 \
    TZ=Asia/Kolkata \
    DB_PATH=/data/eventsphere.db \
    UPLOAD_DIR=/data/uploads
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend /app/Frontend/dist /app/Frontend/dist
# Mount a persistent volume here so the database and uploads survive restarts.
VOLUME /data
EXPOSE 8080
CMD ["node", "src/index.js"]
