# Showoff

## Setup

Requires Docker Engine and Docker Compose.

```sh
$ sed "s/\(POSTGRES_PASSWORD=\).*/\1$(openssl rand -hex 32)/" \
  env/postgres.env.example > env/postgres.env
$ docker-compose build
$ docker-compose up
```

You can also seed the database with some example notebooks.

```sh
$ docker-compose run --rm web knex seed:run
```

## Upgrading

```sh
$ docker-compose stop
$ git pull
$ docker-compose build
$ docker-compose up
```
