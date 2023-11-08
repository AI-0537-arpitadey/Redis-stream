# Use the official Node.js image with Alpine Linux as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy your Node.js application code into the container
COPY . .

# Expose a port if your application requires it
# EXPOSE 3000

# Start your Node.js application
CMD ["node", "app.js"]
