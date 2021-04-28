
FROM node:14.2.0-alpine3.11 AS build
WORKDIR /ekko
ADD package.json .
RUN npm install
ADD . .

FROM node:14.2.0-alpine3.11
COPY --from=build /ekko .
EXPOSE 3000
CMD ["node", "ekko.js"]
