FROM node:16

WORKDIR /usr/src/osm_bee_app/web
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 3000

CMD ["yarn", "start"]
