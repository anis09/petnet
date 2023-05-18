FROM node:16.17.1
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 8080
# For best practices you may add some HealthCheks to the app
CMD npm run start:prod