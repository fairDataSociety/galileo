FROM node:16 as builder

ARG REACT_APP_FAIROSHOST
ARG REACT_APP_WEB_CACHE_URL
ARG REACT_APP_DEFAULT_REGISTRY_REFERENCE
ARG NODE_ENV
ENV REACT_APP_FAIROSHOST=$REACT_APP_FAIROSHOST
ENV REACT_APP_WEB_CACHE_URL=$REACT_APP_WEB_CACHE_URL
ENV REACT_APP_DEFAULT_REGISTRY_REFERENCE=$REACT_APP_DEFAULT_REGISTRY_REFERENCE
ENV NODE_ENV=$NODE_ENV
ARG DNS_ADDRESS
ENV DNS_ADDRESS=$DNS_ADDRESS

WORKDIR /app
COPY web/package*.json ./
RUN yarn
COPY web .
RUN find * -type f -exec  sed -i 's:app.galileo.fairdatasociety.org:'"$DNS_ADDRESS"':g' {} +

SHELL ["/bin/bash", "-eo", "pipefail", "-c"]
RUN env |grep 'REACT\|NODE' > .env

RUN yarn build
COPY web/public/public-example.scene.yaml /app/build/public-scene.yaml

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN sed -i '/index  index.html index.htm/c\        try_files \$uri \$uri/ /index.html;' /etc/nginx/conf.d/default.conf
RUN echo "real_ip_header X-Forwarded-For;" \
    "real_ip_recursive on;" \
    "set_real_ip_from 0.0.0.0/0;" > /etc/nginx/conf.d/ip.conf

EXPOSE 80
RUN apk add --no-cache bash

CMD ["/bin/bash", "-c", "cp /usr/share/nginx/html/example.scene.yaml /usr/share/nginx/html/scene.yaml && cp /usr/share/nginx/html/example.env.js /usr/share/nginx/html/env.js && sed -i \"s+REACT_APP_FAIROSHOST: '',+REACT_APP_FAIROSHOST: '$REACT_APP_FAIROSHOST',+g\" /usr/share/nginx/html/env.js && sed -i \"s+REACT_APP_DEFAULT_REGISTRY_REFERENCE: ''+REACT_APP_DEFAULT_REGISTRY_REFERENCE: '$REACT_APP_DEFAULT_REGISTRY_REFERENCE'+g\" /usr/share/nginx/html/env.js && sed -i \"s+fair_url+$MAP_URL_TEMPLATE+g\" /usr/share/nginx/html/scene.yaml && chown -R nginx /usr/share/nginx/html && nginx -g \"daemon off;\""]
