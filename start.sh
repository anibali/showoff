#!/bin/bash -e

# Run database migrations
until knex migrate:latest
do
  echo "Migration failed, retrying in 5 seconds..."
  sleep 5
done

# Start the server
if [ "$NODE_ENV" == "production" ]
then
  node src/server.js
else
  webpack -w
fi
