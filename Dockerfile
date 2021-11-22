FROM node:16 as builder

WORKDIR /app
COPY web/package*.json ./
RUN yarn
COPY web .
RUN yarn build

FROM nginx:1.21.1-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
