FROM node:8.0.0-alpine

# Install some additional packages that we need.
RUN apk add --no-cache tini curl bash sudo

# Use Tini as the init process. Tini will take care of important system stuff
# for us, like forwarding signals and reaping zombie processes.
ENTRYPOINT ["/sbin/tini", "--"]

# Create a working directory for our application.
RUN mkdir -p /app
WORKDIR /app

# Install native dependencies (for "canvas")
RUN sudo apk add --no-cache make g++ python pkgconfig pixman cairo-dev

# Install Node header files for node-gyp
RUN yarn global add node-gyp-install \
 && node-gyp-install

# Switch to a non-root user
RUN chown -R node:node /app/ \
 && echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-node
USER node

# Install the project's NPM dependencies.
COPY package.json .
RUN sudo mkdir -p /deps/node_modules \
 && sudo chown -R node:node /deps/ \
 && yarn install --modules-folder /deps/node_modules

# Set environment variables to point to the installed NPM modules.
ENV NODE_PATH=/deps/node_modules \
    PATH=/deps/node_modules/.bin:$PATH

# Copy our application files into the image.
COPY . /app

# Bundle client-side assets.
RUN rm -rf dist && npm run build

# Start the server on exposed port 3000.
EXPOSE 3000
CMD [ "npm", "start" ]
