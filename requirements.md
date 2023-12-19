# Overview

> Create an API of small cafe where users can overview customs and order them.
> Your API must allow users to register, overview customs and order them.
> Develop the server and database for your app in this challenge. Create the API server.That means that you have to create the API responses for a web app.You must use a relational database.
> Add an admin panel to manipulate data (customs, users, users, etc.) which is accessible only for users with admin privileges.
> Do not forget abouterror handling. It must be informative and useful.

# Functionality

# Admin panel

> At first, create anadmin panelto manipulate data (for example customs, users, orders etc.) only for users with admin access rights. You must implement user authorizationby yourself.The admin must have an opportunity to make all CRUD operations with entities.In the architecture of your backend, implement at least two kinds of roles: user and admin. Their functionality will be described below.

## Authorization

- sign up

```
  body: {
    name: string,
    email: string,
    password: string,
    passwordConfirm : string,
  }
```

- activate account

- log in

```
  body: {
    email: string,
    password: string,
  }
```

- log out

- forgot password

```
  body: {
    email: string,
  }
```

- reset password

```
  body: {
    password: string,
    passwordConfirm : string,
  }
```

## User

- get all users

- get one user by id

- create user

```
body: {
  name: string,
  email: string,
  password: string,
  passwordConfirm : string,
  role: string(user|admin),
  active: boolean (default: false),
  activated: boolean (default: false),
  createdAt: Date (default now()),
}
```

- update user

```
  # all are optional
  body: {
    name: string,
    email: string,
    role: string(user|admin)
  }
```

- delete user(hard delete)

## Custom

- get all customs

- get custom by id

- get most ordered customs

- get most ordered customs by user

- create custom

```
  body: {
    name: string,
    price: number(0 to 3000),
    category: string('pizza', 'burger', 'drink', 'cultery'),
    compound: string,
    createdAt: Date (default now()),
  }
```

- update custom

```
  # all are optional
  body: {
    name: string,
    price: number(0 to 3000),
    category: string('pizza', 'burger', 'drink', 'cultery'),
    compound: string
      }
```

- delete custom

## Order

- get all orders

- get order by id

- create order

```
  body: {
    user: number(id),
    customs: number[id]
  }
```

- update order

```
  # all are optional
  body: {
    customs: number[id]
  }
```

- delete order

# User interface

## Authorization

- sign up

```
  body: {
    name: string,
    email: string,
    password: string,
    passwordConfirm : string,
  }
```

- activate account

- log in

```
  body: {
    email: string,
    password: string,
  }
```

- log out

- forgot password

```
  body: {
    email: string,
  }
```

- reset password

```
  body: {
    password: string,
    passwordConfirm : string,
  }
```

## User

- Get own account info

## Custom

- get all customs

- get custom by id

- get most ordered customs

- get own most ordered customs

## Order

- get own orders

- get own order by id

- create order

```
  body: {
    user: number(id),
    customs: number[id]
  }
```

- delete own order
