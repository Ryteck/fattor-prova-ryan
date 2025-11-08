# Stage 1: Base image for dependencies and build
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json yarn.lock* pnpm-lock.yaml* ./
RUN \ 
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
  else npm install --frozen-lockfile; fi

# Stage 2: Build the Next.js application
FROM base AS builder

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production runtime image
FROM node:22-alpine AS runner

# Set working directory
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Command to start the Next.js application in production mode
CMD ["npm", "start"]
