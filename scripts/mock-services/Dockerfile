FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose ports for different mock services
EXPOSE 8080 8081 8082

# Start the mock services
CMD ["node", "index.js"]
