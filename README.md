# Nest-cafe API☕

[Postman collection for testing API](https://documenter.getpostman.com/view/27994867/2s9Ykt5KKm)

#### Techology Stack

[![BackEnd](https://skillicons.dev/icons?i=nodejs,ts,nest,jest,postgresql)](https://skillicons.dev)

_And also JWT for authorization, Nodemailer and Postman for testing API._

# What is it?

> Simple web API built with NestJs using TypeORM with Postgres, which provides convenient interface for overviewing customs and also creating orders.

# How to run:

> To run API , firstly clone my repository with API using `git clone https://github.com/BigTako/nest-cafe-api.
Then run command `npm install` in cloned project root directory to install all necessary packages.
> Next it's required to configure a database, for that install latest version of PostgreSQL([http://postgresql.org/download/](http://postgresql.org/download/)) to your computer. When it's done, use comfortable DB working program(i use [https://dbeaver-io.translate.goog/?\_x_tr_sl=en&\_x_tr_tl=uk&\_x_tr_hl=uk&\_x_tr_pto=sc](https://dbeaver-io.translate.goog/?_x_tr_sl=en&_x_tr_tl=uk&_x_tr_hl=uk&_x_tr_pto=sc)) and create new PostgreSQL connection.

### Congiguration variables

> Depends on what you want to do with solution, there is thee 'modes': `development`, `production` and `test`. If you are a developer, i'll have to create two new files in root directory of project: `.env.development` and `.env.test`. I you want to deploy solution somewhere - create `.env.production`. Despite name, there wont be a lot of difference in these files. Common settings will look like that:
>
> ```
> 	PORT = 3000
> 	HOST = 'http://127.0.0.1:${PORT}'
> 	DB_TYPE = "postgres"
> 	DB_NAME = 'nest-cafe-db'
> 	DB_PORT = "5432"
> 	DB_HOST = 'localhost'
> 	DB_USER = 'postgres'
> 	DB_PASSWORD = 'root'
> 	COOKIE_KEY = 'my super secret cookie key'
> 	JWT_SECRET = 'my super secret token'
> 	JWT_EXPIRES_IN = '24h'
> 	EMAIL_USERNAME = "email@gmail.com"
> 	EMAIL_PASSWORD = "secret key"
> 	EMAIL_SERVICE = "gmail"
> 	EMAIL_FROM = "you"
> ```
>
> You can change variables as you like in order to configure type of database and it's configurations in here, but you have to have in mind , that this file only stores data for configuration. Configuration itself is bussiness of other functionality. So, all thee files will have this structure. In order to test you application you will have to change `DB_*` params for ones corresponds your test DB. DO NOT TEST APPLICATION WITH DB THAT YOU WORK ON!

### Configuration( development of test )

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

> To configure DB of production you'll need to use migrations. If you use Postgres, i generated one for you, so everything you need to do is write: `npm run migration:run`.
> If you use another DB type, clear `migrations` folder and generate new one using: `npm run migration:generate --name=<migration name>`

**⚠do not forget to remove all tables from database before generating migration**

> then run `npm run migration:run` on your production environment.

### Launch

> Lauch of app depends on `NODE_ENV` mode. If you using it of development or test run `npm run start:dev`, in production run `npm run start:prod`.

### Testing

> To test an application just run `npm run test:e2e`. This will lauch whole application runtime test which includes interraction with API as `admin`, `user` and `unauthorized guest`.
> To test any part separately, run `npm run test:e2e <test-file-name>`, example: `npm run test:e2e app.e2e-spec.ts`.

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

# Auth Module

### Sign Up

POST`http://127.0.0.1:3000/api/v1/auth/signup`

Body parameters:

```json
{
  "name": "name",
  "email": "email",
  "password": "password",
  "passwordConfirm": "passwordConfirm"
}
```

### Activate account

PATCH `http://127.0.0.1:3000/api/v1/auth/activateAccount/:token`

### Login

POST`http://127.0.0.1:3000/api/users/login`

Body parameters:

```json
{
  "email": "email",
  "password": "password"
}
```

### Logout

POST`http://127.0.0.1:3000/api/v1/auth/logout`

Logout from current session

### Send Password Reset

POST`http://127.0.0.1:3000/api/v1/auth/forgotPassword`

Body parameters:

```json
{
  "email": "email"
}
```

### Password Reset Confirm

PATCH`http://127.0.0.1:3000/api/v1/auth/resetPassword/:token`

Body parameters:

```json
{
  "password": "password",
  "passwordConfirm": "passwordConfirm"
}
```

Rest password to new one, token is got from email.

# User Module

### Get All Users (routes ADMIN only protected)

**✔supports query filtering and sorting**

GET `http://127.0.0.1:3000/api/v1/users`

### Get User By ID

GET`http://127.0.0.1:3000/api/v1/users/:id`

Where id is user_id

### Create User

POST`http://127.0.0.1:3000/api/v1/users`

Body parameters:

```json
{
  "name": "string",
  "email": "email@email.com",
  "password": "string",
  "passwordConfirm": "string",
  "role": "user|admin",
  "active": "boolean",
  "activated": "boolean"
}
```

### Update User

PATCH`http://127.0.0.1:3000/api/v1/users/:id`

Body parameters(all fields are optional):

```json
{
  "name": "name",
  "email": "email",
  "role": "string(user|admin)"
}
```

Password updates are not allowed here

### Delete User

DELETE`http://127.0.0.1:3000/api/v1/users/:id`

Delete user account(Hard delete)

# Current user(me) Module

### Get current user data

GET`http://127.0.0.1:3000/api/v1/users/me`

### Update current user data

PATCH`http://127.0.0.1:3000/api/v1/users/me`

Body parameters(all fields are optional):

```json
{
  "name": "name",
  "email": "email"
}
```

### Update current user password

PATCH`http://127.0.0.1:3000/api/v1/users/updatePassword`

Body parameters:

```json
{
  "passwordCurrent": "passwordCurrent",
  "password": "password",
  "passwordConfirm": "passwordConfirm"
}
```

### Deactivate current user account

DELETE`http://127.0.0.1:3000/api/v1/users/me/:id`

Delete current user account(Soft delete)

# Customs Module

#### Get All Customs

**✔supports query filtering and sorting**

GET `http://127.0.0.1:3000/api/v1/customs`

### Get Custom By ID

GET`http://127.0.0.1:3000/api/v1/custom/:id`

Where id is custom_id

### Create custom

POST `http://127.0.0.1:3000/api/v1/customs`

Bodyraw (json)

```json
{
  "name": "name",
  "price": "price",
  "category": "category(pizza,burger,drink,cultery)",
  "compounds": "compounds"
}
```

### Update custom by id

PATCH `http://127.0.0.1:3000/api/v1/customs/:id`

```json
{
  "name": "name",
  "price": "number",
  "category": "string(pizza,burger,drink,cultery)",
  "compounds": "string"
}
```

### Delete Custom

DELETE`http://127.0.0.1:3000/api/v1/customs/:id`

Delete custom(Hard delete)

### Get topOrdered customs

\*\*✔supports `limit=number` field

GET `http://127.0.0.1:3000/api/v1/customs/topOrdered`

### Get user top ordered customs

GET `http://127.0.0.1:3000/api/v1/customs/topOrdered/:id`

Where id is user_id

# Orders module

### Get all orders

\*\*✔supports `limit=number` field

GET `http://127.0.0.1:3000/api/v1/customs`

### Get order by id

GET `http://127.0.0.1:3000/api/v1/orders/:id
`

### Create order

POST `http://127.0.0.1:3000/api/v1/orders`

```json
{
  "customs": ["ids of customs"]
}
```

### Update order

PATCH `http://127.0.0.1:3000/api/v1/orders/:id

```json
{
    "status": "status",
    "customs": [customs ids]
}
```

### Delete order by id

DELETE `http://127.0.0.1:3000/api/v1/orders/1`

### Get current user orders

GET `http://127.0.0.1:3000/api/v1/orders/me`

\*\*✔supports `limit=number` field

### Update current user order

PATCH `http://127.0.0.1:3000/api/v1/orders/me/:id

```json
{
  "customs": [1]
}
```

### Delete current user order by id

DELETE `http://127.0.0.1:3000/api/v1/orders/me/:id`

> Made by `BigTako`
