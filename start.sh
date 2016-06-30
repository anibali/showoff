#!/bin/bash -e

# Run database migrations
until knex migrate:latest
do
  echo "Migration failed, retrying in 5 seconds..."
  sleep 5
done

# Start the server
if [[ "$NODE_ENV" -eq "production" ]]
then
  node src/server.js
else
  nodemon -L -x "node --nolazy" -e .js -w src src/server.js
fi
