FROM node:16-alpine

RUN apk update
RUN apk upgrade

RUN mkdir /app

# copy and build client
RUN mkdir /app/client
COPY client/package.json client/package-lock.json /app/client/
ADD client/src /app/client/src
ADD client/public /app/client/public
WORKDIR /app/client
RUN npm install
RUN npm run build

# copy and build server
RUN mkdir /app/server
COPY server/package.json server/package-lock.json server/index.mjs /app/server/
WORKDIR /app/server
RUN npm install
RUN cp -a ../client/build public
