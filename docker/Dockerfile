# Multi-stage dockerfile for different Stamp Finder containers
# Build context must be ..

# =====================================
#          Backend images
# =====================================
FROM python:3.10 AS backend-base

WORKDIR /app

# Create user, data and logs directories
RUN useradd -M -u 1042 sf && mkdir -p /app/data/internal /app/data/public && chown -R sf:sf /app/data 

# Backend requirements
ENV PYTHONPATH=/app/backend/src
COPY backend/requirements.txt backend/requirements.txt
RUN pip3 install -r backend/requirements.txt && pip install uwsgi supervisor

# Backend files
ENV SFB_CONFIG_PATH=/app/docker/config.yml
COPY backend /app/backend

# Entrypoint files
COPY docker /app/docker
RUN chmod +x /app/docker/*.sh

USER sf

FROM backend-base AS backend-updater
ENTRYPOINT ["/app/docker/run_updater.sh"]

FROM backend-base AS backend-uwsgi
ENTRYPOINT ["/app/docker/run_uwsgi.sh"]


# =====================================
#          Frontend image
# =====================================                  
FROM node:17.8-alpine3.14 AS frontend-build
ARG GA_TAG
RUN mkdir /app
COPY frontend/package.json frontend/package-lock.json /app/
RUN cd /app && npm install
COPY frontend /app
RUN cd /app && REACT_APP_GA_ID=$GA_TAG npm run build:client:prod

FROM nginx:1.21.6 AS frontend
COPY --from=frontend-build /app/build-client /app/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
RUN mkdir /app/data
