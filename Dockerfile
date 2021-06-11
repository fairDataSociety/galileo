# base image
FROM node:16

# set working directory
WORKDIR /usr/src/osm_bee_app/web

COPY package*.json ./
# COPY package.json ./
# COPY package-lock.json ./

# concat multiple run instructions
# sort them alphabetically
#RUN npm install \
#    npm audit fix
RUN yarn install

COPY . .
# ADD . .
EXPOSE 3000

CMD ["yarn", "start"]
