FROM node:10-alpine

RUN apk add --no-cache tini

WORKDIR /home/node/app
RUN chown node:node /home/node/app

USER node

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "npm", "start" ]
