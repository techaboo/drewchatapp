FROM node:20-alpine

# Install Docker CLI to spawn DuckDuckGo MCP container
RUN apk add --no-cache docker-cli

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application code
COPY server.js .
COPY README.md .

# Expose the bridge server port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
