# Nest-cafe API☕

[Postman collection for testing API](https://documenter.getpostman.com/view/27994867/2s9Ykt5KKm)

#### Techology Stack

[![BackEnd](https://skillicons.dev/icons?i=nodejs,ts,nest,jest,postgresql,docker)](https://skillicons.dev)

_And also JWT for authorization, Nodemailer and Postman for testing API._

# What is it?

> Simple web API built with NestJs using TypeORM with Postgres, which provides convenient interface for overviewing customs and also creating orders. App is build for deployment on costless AWS EC2 instance.

## Load

> Firstly clone my repository with API using `git clone https://github.com/BigTako/nest-cafe-api.`
> Next run `cd nest-cafe` in cloned repo directory(`nest-cafe-api`).Then run command `npm install` to install all necessary packages.

### Congiguration variables

> Configure your environment by creating new `.env` file in `./nest-cafe` dir with such variables:
>
> ```
> 	COOKIE_KEY = 'my super secret cookie key' # key for hashing cookies
> 	JWT_SECRET = 'my super secret token' # use long secret string
> 	JWT_EXPIRES_IN = '24h' # when jwt will become invalid automaticaly
> 	EMAIL_USERNAME = "email@gmail.com" # config var for email provider
> 	EMAIL_PASSWORD = "secret key" # config var for email provider
> 	EMAIL_SERVICE = "gmail" # config var for email provider
> 	EMAIL_FROM = "you"
> ```
>
> You can change variables as you like in order to configure type of database and it's configurations in here, but you have to have in mind , that this file only stores data for configuration. Configuration itself is bussiness of other functionality.

### Configuration( development or test )

> We also have some files in `config` folder, lets look at them:
>
> 1. `cache.config.ts`
>    1. Solution uses data caching for some routes. You can specify how long cache 'living-time' using `ttl` param(in milliseconds).
> 2. `email.config.ts`
>    1. In my application i use Gmail as email service. If you use another one, just specify settings you need, `nodemailer` will figure it out.
> 3. `error.config.ts`
>    1. Message of common errors specified there, feel free to change(DO NOT CHANGE VARIABLE NAMES)
> 4. `orm.config.ts`
>    1. FIle with database, if you user DB different from Postres, change them to one you need.

### Configuration ( production )

> For database in production you will need to run a migration because it's not synchronized with app.

1. Run `docker exec nest-cafe-api-backend npm run migration:generate --name=<migration name>` to generate new migration.
   Use will see a message like this:

```
Migration /app/migrations/1706450857768-init.js has been generated successfully.
```

2. Run `docker exec nest-cafe-api-backend npm run migration:run` to run migration. Use will see a message like this at the end of the output:

```
Migration Init1706450857768 has been  executed successfully.
```

**⚠Migration can be generated if DB doesn't have any tables!**

## Launch:

> To launch an application return to project root(`cd ..`) run `docker-compose -f <docker-compose-file-name> up` depending on your environment.
> To force image rebuild before run, use:

```bash
  docker-compose -f <docker-compose-file-name> up --build
```

### Testing

**⚠Keep in mind that production env has no tests!!!**

> To test an app you will need a separate container. Create it by `docker-compose -f docker-compose.test.yaml up -d`. This will run container in detached mode(you will not see app output in console).
> Next, run `docker exec nest-cafe-api-test-backend npm run test:e2e` to run all tests. To test any part separately, run `docker exec nest-cafe-api-test-backend npm run test:e2e <test-file-name>`, example: `docker exec nest-cafe-api-test-backend npm run test:e2e app.e2e-spec.ts`

**⚠Disclamer!!**

> As you have seen above every container commands is executed like `docker exec <container-name> <command>`. It's neccessary to execute commands this way, even `npm install`.

### Util commands:

> Stop all the containers:

```bash
  docker stop $(docker ps -q)
```

> Remove all containers(even named):

```bash
  docker rm -f $(docker ps -a -q)
```

> Remove all images(even tagged):

```bash
  docker rmi -f $(docker images -q)
```

> Remove all volumes(even named):

```bash
  docker volume rm $(docker volume ls -q)
```

# Endpoints:

> [Auth Module](#Auth-Module)
>
> [Users Module](#Users-Module)
>
> [Customs Module](#Customs-Module)
>
> [Orders Module](#Orders-Module)

## Query filtering and sorting

> Some routes of API support special feature `quering`.That means that you can controll count and view of documents route returns.

- example: `http://127.0.0.1:3000/api/v1/customs/?fields=id,name,category&sort=-price&limit=3&page=1`

Here:

- fields = use `fields` parameter to select only defined fields in each of returned documents.
- sort - use `sort` parameter to sort by any field of Post model `sort=field`. Order of sorting is regulated by `-` at the beginning of `field` what means `reversed`.
- limit - use `limit` parameter to limit the number of posts to be returned.
- page - use `page` to divide returned docs into groups(size of group defined by `limit`).
- Any other fields will be considered as 'filters' , you can user them by passing `field[operator]=value`.
- Operators are:
- `[gt]` - greater than value(Number fields)
- `[lt]` - less than value(Number fields)
- `[gte]` - greater that or equal to value(Number fields)
- `[lte]` - less than or equal to value(Number fields)
- `[eq]` - equals
- nothing means `equals`, example `field=value`

> Made by `BigTako`
