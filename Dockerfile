# Stage 1: Build
FROM node:20-alpine AS builder

ARG API_BASE_URL=https://api.plenario.app

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p src/environments && \
    printf "export const environment = {\n  production: true,\n  apiBaseUrl: '%s',\n};\n" "$API_BASE_URL" \
    > src/environments/environment.production.ts
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist/plenario-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
