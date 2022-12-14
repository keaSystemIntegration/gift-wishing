FROM node:18
RUN npm i -g pnpm
WORKDIR /usr
COPY package.json pnpm-lock.yaml  ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY sqlite ./sqlite
RUN pnpm install
RUN pnpm generate-prisma
COPY src ./src
RUN pnpm build

#EXPOSE 8080
CMD ["node", "./dist/app.js"]