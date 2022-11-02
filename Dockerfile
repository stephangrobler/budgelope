FROM node:16.13.0 AS ui-build

WORKDIR /code/ui
COPY ui/. /code/ui
RUN cd /code/ui && npm install && npm run build



FROM node:16.13.0 AS server-build

WORKDIR /code

COPY server/package.json /code/package.json
COPY server/package-lock.json /code/package-lock.json
COPY --from=ui-build code/ui/dist /code/web/dist

RUN npm install

COPY server/. /code

EXPOSE 5005

CMD [ "npm", "run", "start" ]