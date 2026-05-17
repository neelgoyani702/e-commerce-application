# ── Stage 1: install production dependencies only ─────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: production image ──────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Non-root user (node) ships with the official Node image
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 4000

# ECS sends SIGTERM; the graceful-shutdown handler in index.js catches it
USER node
CMD ["node", "index.js"]
