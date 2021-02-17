[![npm](https://img.shields.io/npm/v/@egodigital/microservices.svg)](https://www.npmjs.com/package/@egodigital/microservices)

# @egodigital/microservices

> Shared library for microservices, written for [Node.js](https://nodejs.org/en/blog/release/v12.0.0/), in [TypeScript](https://www.typescriptlang.org/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egodigital/microservices
```

## Usage

#### Constants

| Name | Description | Example |
|-------------------|-----------------------------------------------------------------------------|------------------------------------|
| `JWT_SECRET`      | The secret for signing and validating JWT.                                  | `mySecretJWTSecret`                |
| `NATS_CLUSTER_ID` | The name of the cluster, that contains this and the other microservices.    | `ego-microservice-cluster`         |
| `NATS_GROUP`      | The name of the pod group / kubernetes deployment.                          | `my-service-or-deployment`         |
| `NATS_URL`        | The URL to the NATS server.                                                 | `http://my-nats-service:4222`      |
| `POD_NAME`        | The name of the pod. This should come as imported metadata from Kubernetes. | `my-service-or-deployment-XCSGBxV` |

### Express

#### JWT

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

myEventPublisher.publish({
    foo: "TM+MK",
    bar: 42
});
```