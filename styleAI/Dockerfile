FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

FROM base AS dependencies
RUN npm ci --legacy-peer-deps

FROM dependencies AS development
WORKDIR /app
# We don't need to copy the source code here as it will be mounted as a volume
ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM dependencies AS builder
COPY . .
# Build the application - environment variables will be passed at runtime
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./

# Only set essential environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Use a shell script to start the application
COPY --from=builder /app/docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
