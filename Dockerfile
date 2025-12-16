FROM node:18-alpine
EXPOSE 8080
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install --legacy-peer-deps
COPY . .
RUN cd frontend && npm install --legacy-peer-deps && npm run build
CMD ["npm", "run", "start:prod"]