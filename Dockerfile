  
FROM node:16-alpine as build

WORKDIR /usr/src/app
COPY . ./
COPY ./config/dev.env ./.env
RUN yarn install 
RUN yarn build

FROM nginx:1.17-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY --from=build /usr/src/app/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 3301
CMD ["nginx", "-g", "daemon off;"]