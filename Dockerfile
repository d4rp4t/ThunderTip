FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package*.json ./

RUN npm ci --only=production --ignore-scripts

COPY . .

RUN npm run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S thundertip -u 1001
USER thundertip

EXPOSE 3000

CMD ["npm", "start"]
