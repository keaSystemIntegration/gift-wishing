FROM node:19-slim as development

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

FROM node:19-slim as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY --from=development /usr/src/app .

CMD ["node", "src/app.js"]