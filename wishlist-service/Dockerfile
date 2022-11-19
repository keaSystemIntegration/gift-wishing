FROM node:19-slim

WORKDIR /app
COPY package.json ./
COPY src ./src

RUN npm install
EXPOSE 80
CMD node src/app.js