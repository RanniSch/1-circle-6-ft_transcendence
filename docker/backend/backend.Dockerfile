FROM debian:bookworm

WORKDIR /workdir

RUN apt update && apt install -y \
    nano \
    iputils-ping \
    gettext \
    python3 \
    python3-pip \
    python3.11-venv && \
    rm -rf /var/lib/apt/lists/*

COPY docker/backend/entrypoint_be.sh /workdir/entrypoint_be.sh
RUN chmod +x /workdir/entrypoint_be.sh

EXPOSE 8000

ENTRYPOINT ["bash", "docker/backend/entrypoint_be.sh"]