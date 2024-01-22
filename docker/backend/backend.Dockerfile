FROM debian:bookworm

WORKDIR /workdir

RUN apt update && apt install -y \
    curl \
    wget \
    tar \
    make \
    build-essential \
    zlib1g-dev \
    libncurses5-dev \
    libgdbm-dev \
    libnss3-dev \
    libssl-dev \
    libreadline-dev \
    libffi-dev \
    libsqlite3-dev \
    libbz2-dev \
    python3 && \
    apt install -y python3-pip \
    python3.11-venv && \
    rm -rf /var/lib/apt/lists/*

COPY docker/backend/entrypoint_be.sh /workdir/entrypoint_be.sh
RUN chmod +x /workdir/entrypoint_be.sh

EXPOSE 8000

ENTRYPOINT ["bash", "docker/backend/entrypoint_be.sh"]