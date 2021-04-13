FROM node:14.14.0
ENV NODE_ENV=production

WORKDIR /ekko

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD ["node", "ekko-server.js"]