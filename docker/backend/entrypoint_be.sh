#!/bin/bash

cd /workdir/backend

python3 -m venv ft_venv
source ft_venv/bin/activate
pip install -r requirements.txt
echo 'source /workdir/backend/ft_venv/bin/activate' >> /root/.bashrc

django-admin compilemessages

migrate() {
    python manage.py makemigrations
    python manage.py migrate
}
migrate

python manage.py collectstatic --noinput

if ! command -v uvicorn &> /dev/null
then
    echo "uvicorn could not be found"
    pip install uvicorn
fi

echo "Django Server is running on port 8000"
uvicorn backend.asgi:application --host 0.0.0.0 --port 8000