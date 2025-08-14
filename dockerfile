# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the app
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Run the app
FROM node:18-alpine AS runner
WORKDIR /app

# If you have a .next/standalone folder from outputFileTracing (for optimization):
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/public ./public

COPY --from=builder /app ./
ENV NODE_ENV production

EXPOSE 3000

CMD ["npm", "start"]
