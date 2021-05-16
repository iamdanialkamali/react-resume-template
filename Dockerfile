FROM node:12-alpine
RUN apk add --no-cache python g++ make
WORKDIR /app
COPY . .
RUN yarn install pm2 -g
RUN yarn install --production
RUN yarn build
EXPOSE 8000
CMD ["pm2", "start","app.js"]


