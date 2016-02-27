#!/bin/bash -e

nodemon -L -x "node --use-strict --nolazy" -e .js -w src src/server.js
