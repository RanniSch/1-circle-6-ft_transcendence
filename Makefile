.DEFAULT_GOAL:= all

all:
		docker compose -f ./docker-compose.yml up --build -d

log:
		@docker compose -f ./docker-compose.yml logs | less

down:
		docker compose down

up:
		docker compose up -d

backend_exe:
		docker exec -it backend bash

postgres_exe:
		docker exec -it postgres_db bash

backend_re:
		docker compose -f ./docker-compose.yml stop backend
		docker rmi -f ft_transcendence_be
		docker compose -f ./docker-compose.yml up --build -d backend

postgres_re:
		docker compose -f ./docker-compose.yml stop postgres
		docker rmi -f postgres:16
		docker compose -f ./docker-compose.yml up --build -d postgres

fclean:
		docker system prune -af