# Build stage
FROM rust:1.81 as builder

# Install Node.js and Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock (if available)
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package.json ./

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["node", "dist/server.js"]

