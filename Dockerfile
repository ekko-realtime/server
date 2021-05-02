
FROM node:current-alpine3.11 AS build
WORKDIR /ekko
ADD package.json .
RUN npm install
ADD . .

FROM node:current-alpine3.11
COPY --from=build /ekko .
EXPOSE 3000
CMD ["node", "ekko.js"]
