FROM nginx:alpine-slim

RUN apk update && \
    apk upgrade --available && \
    rm -rf /var/cache/apk/*

ADD ./conf/nginx.example.conf /etc/nginx/nginx.conf
COPY ./wait-for.sh /wait-for.sh
