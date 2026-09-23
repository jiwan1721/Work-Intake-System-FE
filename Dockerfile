FROM node:22-slim

WORKDIR /app

# Install dependencies first so the layer is cached across code changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
