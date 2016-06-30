FROM node:5.0

# Run Tini as PID 1, allowing us to send signals like SIGTERM to the command
# we decide to run.
ENV TINI_VERSION v0.9.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

RUN apt-get update \
 && apt-get install -y libcairo2-dev libjpeg62-turbo-dev libpango1.0-dev libgif-dev build-essential g++

# Give unknown non-root users a place to call home.
# This is required for npm/bower install during development.
RUN mkdir -p /home/default && chmod 777 /home/default

# Install NPM modules.
RUN mkdir /deps
WORKDIR /deps
COPY package.json .
RUN npm install --quiet
ENV NODE_PATH=/deps/node_modules
ENV PATH=$NODE_PATH/.bin:$PATH

# Copy application into the container.
RUN mkdir /app
WORKDIR /app
COPY . /app

# Bundle client-side stuff.
RUN rm -rf dist \
 && NODE_ENV=production gulp build

EXPOSE 3000
CMD [ "npm", "start" ]
