FROM node:12-alpine
RUN apk add --no-cache python g++ make
WORKDIR /app
COPY . .
RUN yarn install --production
RUN yarn build
CMD ["node", "server.js"]


