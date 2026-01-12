# Use the official Node.js image as the base image
FROM node:22-alpine

RUN apk add --no-cache \
    wget \
    curl \
    unzip \
    ca-certificates

# Install Trivy
RUN wget -q https://github.com/aquasecurity/trivy/releases/download/v0.68.2/trivy_0.68.2_Linux-64bit.tar.gz && \
    tar zxf trivy_0.68.2_Linux-64bit.tar.gz && \
    mv trivy /usr/local/bin/ && \
    rm trivy_0.68.2_Linux-64bit.tar.gz && \
    chmod +x /usr/local/bin/trivy

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Create necessary directories
RUN mkdir -p scan-results

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "--max-old-space-size=150", "dist/main"]
