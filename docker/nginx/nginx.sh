#!/bin/bash

service nginx status

sed -i 's|http://localhost:8000|'http://localhost:8000'|g' /etc/nginx/sites-available/backend
sed -i 's|https://10.12.14.3|'https://10.12.14.3'|g' /etc/nginx/sites-available/backend

openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout /etc/ssl/localhost.key -out /etc/ssl/localhost.pem -subj "/C=DE/CN=localhost"
openssl x509 -outform pem -in /etc/ssl/localhost.pem -out /etc/ssl/localhost.crt

cd /etc/nginx/sites-enabled

rm -rf default

if [ ! -e ./backend ]; then
    ln -s ../sites-available/backend .
fi

echo "10.12.14.3    42finalboss.de" | tee -a /etc/hosts

service nginx restart
service nginx status
tail -f /dev/null