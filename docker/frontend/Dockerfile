FROM alexxxnf/spa-builder:12.1 as builder

COPY ./package.json ./yarn.lock ./app/

WORKDIR /app/frontend

COPY ./frontend/package.json ./frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --focus

COPY ./frontend ./
RUN yarn run build --prod --configuration=docker

FROM alexxxnf/nginx-spa:1.19.2

COPY ./docker/frontend/docker-entrypoint.sh /docker-entrypoint.sh
COPY --from=builder /usr/local/bin/brotli /usr/local/bin
COPY --from=builder /app/frontend/dist/VirusMutationsAI /etc/nginx/html/

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
