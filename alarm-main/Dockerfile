
#stage 1
FROM node:latest as build

WORKDIR /app
COPY ./ /app/

RUN npm install
RUN npm run build

#stage 2
FROM nginx:latest
COPY --from=build /app/dist/alarm-main /usr/share/nginx/html