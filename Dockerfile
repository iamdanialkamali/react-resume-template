FROM node:12-alpine
RUN apk add --no-cache python g++ make
WORKDIR /app
COPY . .
RUN yarn install --production
RUN yarn build
EXPOSE 8000
CMD ["node", "./server.js"]


