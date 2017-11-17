# Showoff

WARNING: Showoff is still under heavy development. Use at own risk.

## Setup

Requires Docker Engine (17.09+) and Docker Compose (1.17.0+).

1.  Create the environment variable configuration files. A script is provided to
    guide you through this process.
    ```sh
    $ scripts/config
    ```
2.  Start the Showoff server.
    ```sh
    $ docker-compose up
    ```
3.  [Optional] Seed the database with some dummy data.
    ```sh
    $ docker-compose run --rm web knex seed:run
    ```

## Upgrading

```sh
$ git pull
$ docker-compose up --build -d
```

## License

(C) 2017 Aiden Nibali

This project is open source under the terms of the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).
