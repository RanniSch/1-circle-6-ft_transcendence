FROM nginx:1.25.3

COPY docker/nginx/config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]