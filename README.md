[![npm](https://img.shields.io/npm/v/@egomobile/microservices.svg)](https://www.npmjs.com/package/@egomobile/microservices)

# @egomobile/microservices

> Shared library for microservices, written for [Node.js](https://nodejs.org/en/blog/release/v12.0.0/), in [TypeScript](https://www.typescriptlang.org/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egomobile/microservices
```

## Usage

### Auth

#### Passwords

Hash passwords with [bcrypt](https://en.wikipedia.org/wiki/Bcrypt):

```typescript
import { checkPassword, checkPasswordSync, hashPassword, hashPasswordSync } from '@egomobile/microservices';

const hash1 = await hashPassword('test');
const doesMatch1 = await checkPassword('test', hash1);  // true

const hash2 = hashPasswordSync('test');
const doesMatch2 = checkPasswordSync('Test', hash2);  // false
```

#### JWT

Sign and verify [JSON Web Tokens](https://en.wikipedia.org/wiki/JSON_Web_Token):

```typescript
import { signJWT, verifyJWT } from '@egomobile/microservices';

interface IUserToken {
    uuid: string;
}

const jwt = signJWT({
    uuid: 'cb246b52-b8cd-4916-bfad-6bfc43845597'
});

const decodedToken = verifyJWT<IUserToken>(jwt);
```

##### Express

Use predefined [Express middleware](https://expressjs.com/en/guide/using-middleware.html) to verify and decode JWTs:

```typescript
import express from 'express';
import { withJWT } from '@egomobile/microservices';

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

Connect to a [NATS](https://en.wikipedia.org/wiki/NATS_Messaging) server:

```typescript
import { stan } from '@egomobile/microservices';

await stan.connect();
stan.exitOnClose();
```

#### Listener

Listen for events:

```typescript
import { NatsListener } from '@egomobile/microservices';

interface IMyEvent {
    foo: string;
    bar: number;
}

const myEventListener = new NatsListener<IMyEvent>('my.event');

myEventListener.onMessage = async (context) => {
    // handle message in context.message of type IMyEvent
};

myEventListener.listen();
```

#### Publisher

Publish events:

```typescript
import { NatsPublisher } from '@egomobile/microservices';

interface IMyEvent {
    foo: string;
    bar: number;
}

const myEventPublisher = new NatsPublisher<IMyEvent>('my.event');

await myEventPublisher.publish({
    foo: "TM+MK",
    bar: 42
});
```

## Documentation

The API documentation can be found [here](https://egomobile.github.io/node-microservices/).