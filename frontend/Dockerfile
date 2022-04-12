# First stage: builder container
FROM node:17.8-alpine3.14

RUN mkdir /app
COPY package.json package-lock.json /app/
RUN cd /app && npm install
COPY . /app
RUN cd /app && npm run build

# Second stage: nginx container
FROM nginx:1.21.6
COPY --from=0 /app/build /app/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
RUN mkdir /app/data && mkdir /app/extra
