# This Dockerfile uses a multi-stage build to keep the output image size small.
# Building requires Docker Engine 17.09 or newer.

################################################################################

FROM node:8.9.1-alpine as builder

# Install build requirements.
RUN apk add --no-cache \
    build-base python pkgconfig cairo-dev jpeg-dev pango-dev \
    autoconf libtool automake git

# Set up the directory structure.
RUN mkdir /app \
 && chown -R node:node /app
WORKDIR /app

# Install Node header files for use with node-gyp.
RUN yarn global add node-gyp-install && node-gyp-install

################################################################################

FROM builder as builder-dev

# Set environment to "development".
ENV NODE_ENV=development

RUN mkdir -p /home/user/.cache/yarn \
 && chmod -R 777 /home/user

################################################################################

FROM builder as builder-prod

# Set environment to "production".
ENV NODE_ENV=production

# Download and build NPM dependencies.
COPY package.json yarn.lock ./
COPY subpackages ./subpackages
RUN NODE_ENV=development yarn install --frozen-lockfile

# Copy our application files into the image.
COPY . /tmp/app
RUN mv node_modules /tmp/app/node_modules \
 && rm -rf /app \
 && mv /tmp/app /

# Bundle client-side assets.
RUN rm -rf dist && npm run build

# Remove dev dependencies.
RUN yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline

################################################################################

FROM node:8.9.1-alpine as app

# Install some additional packages that we need.
RUN apk add --no-cache tini curl bash

# Use Tini as the init process. Tini will take care of important system stuff
# for us, like forwarding signals and reaping zombie processes.
ENTRYPOINT ["/sbin/tini", "--"]

# Install native dependencies.
RUN apk add --no-cache cairo libjpeg-turbo pango

# Set up the directory structure.
RUN mkdir -p /app \
 && chown -R node:node /app
WORKDIR /app

# Switch to a non-root user
USER node

# Set path to include node module executables.
ENV PATH=/app/node_modules/.bin:$PATH

# Expose port 3000.
EXPOSE 3000

# Set default command to start the server.
CMD [ "npm", "start" ]

################################################################################

FROM app as app-dev

# Set environment to "development".
ENV NODE_ENV=development

# Make the "node" user a sudoer.
USER root
RUN apk add --no-cache sudo
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-node
USER node

################################################################################

FROM app as app-prod

# Set environment to "production".
ENV NODE_ENV=production

# Copy our application files into the image.
COPY --chown=node:node --from=builder-prod /app /app
