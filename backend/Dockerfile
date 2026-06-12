FROM node:20-bullseye-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "src/index.js"]
