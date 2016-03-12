**WORK IN PROGRESS** (unless your name is Zhen, in which case nothing
is going on here).

## Setup

Requires Docker Engine and Docker Compose.

```sh
cp env/postgres.env.example env/postgres.env
docker volume create showoff-db-data
docker-compose run web npm install
docker-compose run -e NODE_ENV=production web gulp build
docker-compose run web knex migrate:latest
docker-compose run web knex seed:run
docker-compose up
```
