#!/bin/bash -e

nodemon -L -x "node --nolazy" -e .js -w src src/server.js
