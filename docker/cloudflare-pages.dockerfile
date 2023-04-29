# Set the following environment variables when running the backend image: 
# CLOUDFLARE_API_TOKEN=
# CLOUDFLARE_ACCOUNT_ID=
# CLOUDFLARE_PROJECT_NAME=
# CLOUDFLARE_PROJECT_BRANCH=


# -----------------
# Frontend builder
# -----------------

FROM node:19 AS frontend-builder
COPY frontend /frontend
RUN cd /frontend && npm install && npm run build:prod

# -----------------
# Backend
# -----------------

FROM golang:1.20.3-bullseye as builder
RUN apt-get update && apt-get install -y libvips-dev && rm -rf /var/lib/apt/lists/*
COPY tools/ /app
RUN --mount=type=cache,target=/root/.cache/go-build \
    cd /app && go build -buildvcs=false ./cmd/sfwatch

FROM node:20-bullseye AS backend
RUN apt-get update && apt-get install -y libvips && rm -rf /var/lib/apt/lists/*
RUN npm install -g wrangler

# Copy app binaries
RUN mkdir -p /app/bin
COPY --from=builder /app/sfwatch /app/bin/sfwatch

# Copy frontend files
COPY --from=frontend-builder /frontend/build /app/frontend

VOLUME ["/app/storage"]
ENTRYPOINT ["/app/bin/sfwatch", "-r", "/app/storage", "-f", "/app/frontend", "-d", "wrangler pages publish --project-name $CLOUDFLARE_PROJECT_NAME --branch $CLOUDFLARE_PROJECT_BRANCH {{ .PagesPath }}"]
