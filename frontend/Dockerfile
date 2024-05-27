FROM node:20-alpine

WORKDIR /frontend
COPY . /frontend 

RUN npm install

RUN npm run build

COPY .env /app/.env

EXPOSE 3000

CMD ["npm", "start"]