FROM node:20.16-alpine as build
WORKDIR /app/build
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .

EXPOSE 4000

CMD ["src/index.js"]