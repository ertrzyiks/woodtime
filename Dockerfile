FROM alpine

COPY package.json /app/package.json
COPY ./apps/*/package.json /app
WORKDIR /app

ENTRYPOINT ["/bin/sh"]
