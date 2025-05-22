FROM node:22.15.0-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22.15.0-alpine3.21

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]