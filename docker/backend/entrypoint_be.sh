#!/bin/bash

cd /workdir/backend

python3 -m venv ft_venv
source ft_venv/bin/activate
pip install -r requirements.txt
echo 'source /workdir/backend/ft_venv/bin/activate' >> /root/.bashrc

migrate() {
    python manage.py makemigrations
    python manage.py migrate
}
migrate

echo "Django Server is running on port 8000"
python /workdir/backend/manage.py runserver 0.0.0.0:8000