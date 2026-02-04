FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Install build dependencies needed by native modules (e.g. canvas, tesseract)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development

COPY package.json package-lock.json ./
# Prefer `npm ci` for reproducible installs, but fall back to `npm install`
# if the lockfile is out of sync (common in CI/build-agent environments).
RUN npm ci || npm install --prefer-offline --no-audit --no-fund

COPY . .

RUN npm run build

# Remove dev dependencies to keep runtime image small
RUN npm prune --production

FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built output and production dependencies
COPY --from=builder /app/.output .output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
