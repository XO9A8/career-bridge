# Stage 1: Base
FROM node:22-alpine AS base

# Stage 2: Deps (Install dependencies only when needed)
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 3: Builder (Build the Next.js app)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 4: Runner (Production image)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Don't run as root for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build and static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]
