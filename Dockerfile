# Use the official Rust image as a base
FROM rust:1.81

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

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["yarn", "start"]

