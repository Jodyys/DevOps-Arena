FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# If there was a build step, it would go here. For Express, we just copy.

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Run as non-root user
USER node

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/src ./src

EXPOSE 4000

ENV PORT 4000

CMD ["npm", "start"]
