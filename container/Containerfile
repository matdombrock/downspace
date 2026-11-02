# Stage 1: Build the Svelte client
FROM node:22-alpine AS builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: Runtime image
FROM node:22-alpine
WORKDIR /app

# Install server dependencies (including tsx for running TypeScript)
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci

# Copy server source
COPY server/ ./server/

# Copy built client from builder stage
COPY --from=builder /app/client/dist ./client/dist/

# Notes directory (default location, override with NOTES env)
RUN mkdir -p /app/notes

VOLUME /app/notes

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "--import", "tsx", "server/src/index.ts"]
