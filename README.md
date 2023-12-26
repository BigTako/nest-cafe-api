## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Generate migrations

`npm run migration:generate --name=<migration name>`

**⚠do not forget to remove all table from database before generating migration**

## Run migrations

`npm run migration:run`

will run migrations located in migrations directory

## Revert migrations

`npm run migration:revert`

will run migrations located in migrations directory

## License

Nest is [MIT licensed](LICENSE).
