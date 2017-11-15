# Showoff

## Setup

Requires Docker Engine (17.09+) and Docker Compose (1.17.0+).

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
$ git pull
$ docker-compose build
$ docker-compose up -d
```

## License

(C) 2017 Aiden Nibali

This project is open source under the terms of the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).
