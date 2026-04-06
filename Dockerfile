# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Bake a placeholder — replaced at runtime by the entrypoint script
RUN mkdir -p src/environments && \
    printf "export const environment = {\n  production: true,\n  apiBaseUrl: '__API_BASE_URL__',\n};\n" \
    > src/environments/environment.production.ts
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist/plenario-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["/docker-entrypoint.sh"]
