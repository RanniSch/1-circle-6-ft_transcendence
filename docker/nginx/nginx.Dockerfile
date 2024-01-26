FROM debian:bookworm

RUN apt update && apt install -y iputils-ping nginx openssl nano && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workdir

COPY docker/nginx/nginx.sh /workdir/
COPY docker/nginx/config/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/config/backend.conf /etc/nginx/sites-available/backend

RUN chmod +x /workdir/nginx.sh

EXPOSE 80

#SSL
EXPOSE 443

CMD [ "nginx" "-g" "daemon off;" ]