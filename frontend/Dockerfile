# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install build deps (alpine build deps)
RUN apk add --no-cache git python3 make g++

COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# Ensure Vite build uses production env (VITE_ env vars can be injected by docker-compose)
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

# 2) Production nginx stage
FROM nginx:alpine
# Remove default site
RUN rm -rf /usr/share/nginx/html/*
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a small nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]