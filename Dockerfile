# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached unless package-lock.json changes)
COPY package.json package-lock.json ./
RUN npm ci

# VITE_API_URL is baked into the JS bundle at build time
ARG VITE_API_URL=https://vyberia.com
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ─── Stage 2: Serve with nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
