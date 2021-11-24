FROM node:16 as builder

WORKDIR /app
COPY web/package*.json ./
RUN yarn
COPY web .
RUN yarn build

FROM nginx:1.21.1-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
RUN apk add --no-cache bash

CMD ["/bin/bash", "-c", "cp /usr/share/nginx/html/example.scene.yaml /usr/share/nginx/html/scene.yaml && cp /usr/share/nginx/html/example.env.js /usr/share/nginx/html/env.js && sed -i \"s+REACT_APP_FAIROSHOST: '',+REACT_APP_FAIROSHOST: '$REACT_APP_FAIROSHOST',+g\" /usr/share/nginx/html/env.js && sed -i \"s+REACT_APP_DEFAULT_REGISTRY_REFERENCE: ''+REACT_APP_DEFAULT_REGISTRY_REFERENCE: '$REACT_APP_DEFAULT_REGISTRY_REFERENCE'+g\" /usr/share/nginx/html/env.js && sed -i \"s+fair_url+$MAP_URL_TEMPLATE+g\" /usr/share/nginx/html/scene.yaml && nginx -g \"daemon off;\""]
