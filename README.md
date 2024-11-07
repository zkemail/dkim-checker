# DKIM Registry Checker

This project checks the validity of DKIMs registered in the DKIM registry contract. Follow the steps below to build and run the application using Docker.

## Prerequisites

- [Docker](https://www.docker.com/) must be installed
- [Yarn](https://classic.yarnpkg.com/en/docs/install) must be installed

## Local Setup

1. Clone the repository.

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies.

   ```bash
   yarn install
   ```

3. Compile TypeScript.

   ```bash
   yarn build
   ```

4. Start the application.

   ```bash
   yarn start
   ```
## WebSocket Notifications

The application listens on port 8080 and provides WebSocket functionality for receiving real-time notifications about DKIM registry updates. You can connect to the WebSocket endpoint at `ws://localhost:8080` to receive these notifications.

A sample client implementation is provided in `client.html` which demonstrates how to connect to the WebSocket server and handle notifications. You can use this as a reference for implementing your own client.

Example usage of the sample client:

1. Start the application
2. Open `client.html` in a web browser
3. The client will automatically connect to the WebSocket server and display notifications as they arrive

## Setup Using Docker

### Building the Docker Image

1. Build the Docker image using the `Dockerfile`.

   ```bash
   docker build -t dkim-checker .
   ```

2. To create an image for the x86 architecture, use the following command.

   ```bash
   docker buildx build --platform linux/amd64 -t dkim-checker-x86 .
   ```

### Running the Docker Container

1. Start the container using the built image with environment variables.

   ```bash
   docker run -e WEBSOCKET_PROVIDER_URL=wss://zksync-sepolia.g.alchemy.com/v2/mmChuLGSsbfFHWnY3FNu7nElGZLiNMSc -e CONTRACT_ADDRESS=0x0D269D8A1e0B0815bCBe4953E560993F1f391a6E -p 8080:8080 dkim-checker
   ```

   To use the x86 image with environment variables, use the following command.

   ```bash
   docker run -e WEBSOCKET_PROVIDER_URL=wss://zksync-sepolia.g.alchemy.com/v2/mmChuLGSsbfFHWnY3FNu7nElGZLiNMSc -e CONTRACT_ADDRESS=0x0D269D8A1e0B0815bCBe4953E560993F1f391a6E -p 8080:8080 dkim-checker-x86
   ```

## Notes

- If `Dockerfile` or `docker-compose.yml` is included in the project, configure it accordingly.
- Adjust port numbers and environment variables as needed.

## License

This project is licensed under the MIT License.
