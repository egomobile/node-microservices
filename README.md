[![npm](https://img.shields.io/npm/v/@egodigital/microservices.svg)](https://www.npmjs.com/package/@egodigital/microservices)

# @egodigital/microservices

> Shared library for microservices, written for [Node.js](https://nodejs.org/en/blog/release/v12.0.0/), in [TypeScript](https://www.typescriptlang.org/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egodigital/microservices
```

## Usage

### Auth

#### Passwords

```typescript
import { checkPassword, checkPasswordSync, hashPassword, hashPasswordSync } from '@egodigital/microservices';

const hash1 = await hashPassword('test');
const matches2 = await checkPassword('test', hash1);

const hash2 = hashPasswordSync('test');
const matches2 = checkPasswordSync('test', hash2);
```

#### JWT

```typescript
import { signJWT, verifyJWT } from '@egodigital/microservices';

interface IUserToken {
    uuid: string;
}

const jwt = signJWT({
    uuid: 'cb246b52-b8cd-4916-bfad-6bfc43845597'
});

const decodedToken = verifyJWT<IUserToken>(jwt);
```

##### Express

```typescript
import express from 'express';
import { withJWT } from '@egodigital/microservices';

const app = express();

app.get('/', withJWT(), async (request, response) => {
    // decoded, valid user token is stored in:
    // request.userToken
});

app.listen(4242, () => {
    console.log('Service is listening ...');
});
```

### Constants

| Name              | Description                                                                 | Example                            |
|-------------------|-----------------------------------------------------------------------------|------------------------------------|
| `BCRYPT_ROUNDS`   | The number of rounds for bcrypt hashing. Default: `10`                      | `12`                               |
| `JWT_SECRET`      | The secret for signing and validating JWT.                                  | `mySecretJWTSecret`                |
| `NATS_CLUSTER_ID` | The name of the cluster, that contains all microservices.                   | `my-cluster`                       |
| `NATS_GROUP`      | The name of the pod group / Kubernetes deployment.                          | `my-service-or-deployment`         |
| `NATS_URL`        | The URL to the NATS server.                                                 | `http://my-nats-service:4222`      |
| `POD_NAME`        | The name of the pod. This should come as imported metadata from Kubernetes. | `my-service-or-deployment-xcsgbxv` |

### NATS

```typescript
import { stan } from '@egodigital/microservices';

await stan.connect();
stan.exitOnClose();
```

#### Listener

```typescript
import { stan } from '@egodigital/microservices';

interface IMyEvent {
    foo: string;
    bar: number;
}

const myEventListener = new NatsListener('my.event');

myEventListener.onMessage = (context) => {
    // handle message in context.message of type IMyEvent
};

myEventListener.listen();
```

#### Publisher

```typescript
import { stan } from '@egodigital/microservices';

interface IMyEvent {
    foo: string;
    bar: number;
}

const myEventPublisher = new NatsPublisher('my.event');

await myEventPublisher.publish({
    foo: "TM+MK",
    bar: 42
});
```

## Documentation

The API documentation can be found [here](https://egodigital.github.io/node-microservices/).