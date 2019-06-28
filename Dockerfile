FROM node:10-alpine

ENV KUBE_CONFIG_METHOD="getInCluster()"

# Create Directory for the Container
WORKDIR /app

COPY package.json .

# Copy the files we need to our new Directory
COPY . /app

# Grab dependencies and transpile src directory to dist
RUN npm install

# Start the server
ENTRYPOINT ["node", "server.js"]