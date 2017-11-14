# This Dockerfile uses a multi-stage build to keep the output image size small.
# Building requires Docker Engine 17.09 or newer.


### Stage 1: Download and build NPM dependencies

FROM node:8.9.1-alpine as deps

# Install build requirements.
RUN apk add --no-cache build-base python pkgconfig cairo-dev jpeg-dev pango-dev
RUN apk add --no-cache autoconf libtool automake

# Set up the directory structure.
RUN mkdir /app \
 && chown -R node:node /app
WORKDIR /app

# Install Node header files for use with node-gyp.
RUN yarn global add node-gyp-install && node-gyp-install

# Download and build NPM dependencies.
COPY package.json yarn.lock ./
COPY subpackages ./subpackages
RUN yarn install --frozen-lockfile


### Stage 2: Build the Showoff image

FROM node:8.9.1-alpine

# Install some additional packages that we need.
RUN apk add --no-cache tini curl bash sudo

# Use Tini as the init process. Tini will take care of important system stuff
# for us, like forwarding signals and reaping zombie processes.
ENTRYPOINT ["/sbin/tini", "--"]

# Install native dependencies
RUN apk add --no-cache cairo libjpeg-turbo pango

# Set up the directory structure.
RUN mkdir -p /app /deps \
 && chown -R node:node /app /deps
WORKDIR /app

# Switch to a non-root user
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-node
USER node

# Copy in the project's NPM dependencies.
COPY --chown=node:node --from=deps /app/node_modules /deps/node_modules

# Set environment variables to point to the installed NPM modules.
ENV NODE_PATH=/deps/node_modules \
    PATH=/deps/node_modules/.bin:$PATH

# Copy our application files into the image.
COPY --chown=node:node . /app

# Set environment to "production"
ENV NODE_ENV=production

# Bundle client-side assets.
RUN rm -rf dist && npm run build

# Start the server on exposed port 3000.
EXPOSE 3000
CMD [ "npm", "start" ]
