FROM python:3.10

WORKDIR /app

# Create user & data directory
RUN useradd -M -u 1042 sfb && mkdir -p /app/data && chown sfb:sfb /app/data

# Install requirements
ENV PYTHONPATH=/app/src
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt && pip install uwsgi supervisor

# Install app
ENV SFB_CONFIG_PATH=/app/docker/config.yml
COPY . .
USER sfb

ENTRYPOINT ["/app/docker/entrypoint.sh"]
