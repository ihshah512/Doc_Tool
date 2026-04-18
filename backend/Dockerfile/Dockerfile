# Use Node 20 on Debian (required for LibreOffice apt install)
FROM node:20-bullseye-slim

# Install LibreOffice and dependencies
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    fonts-liberation \
    fonts-dejavu \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p src/uploads

# Expose port
EXPOSE 10000

# Start the server
CMD ["npm", "start"]
