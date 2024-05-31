FROM node:20-alpine

WORKDIR /frontend
COPY . /frontend 

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]