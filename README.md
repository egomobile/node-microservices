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

###### Azure AD

You can connect with [Azure AD](https://azure.microsoft.com/en-us/services/active-directory/), by using [passport](https://www.npmjs.com/package/passport) and [passport-azure-ad](https://www.npmjs.com/package/passport-azure-ad) modules:

```typescript
import express from 'express';
import { setupAppForAzureAD } from '@egomobile/microservices';

const app = express();

const { withAzureADBearer } = setupAppForAzureAD(app);

app.get('/', withAzureADBearer(), async (request, response) => {
    // get decoded token
    const authInfo: any = request.authInfo;

    return response.json(authInfo);
});

app.listen(4242, () => {
    console.log('Service is listening ...');
});
```

### Constants

| Name              | Description                                                                 | Example                            |
|-------------------|-----------------------------------------------------------------------------|------------------------------------|
| `APPLICATION_INSIGHTS_KEY` | Application Insights key. | `dd7589fc-1cf9-413e-bf6c-aa1253858b55` |
| `AZURE_AD_AUDIENCE` | Azure AD audience. | `6b3c51b9-7cc0-4327-a901-e5b889efbbaa` |
| `AZURE_AD_CLIENT_ID` | App ID for Azure AD. | `6b3c51b9-7cc0-4327-a901-e5b889efbbaa` |
| `AZURE_AD_IDENTITY_METADATA` | Identity metadata. | `https://myazuread.b2clogin.com/myazuread.onmicrosoft.com/my_policy/v2.0/.well-known/openid-configuration` |
| `AZURE_AD_IS_B2C` | `true` if Azure AD is running in B2C context. | `true` |
| `AZURE_AD_LOGGING_LEVEL` | Azure ADlogging level. Possible values are `error`, `info` or `warn`. | `info` |
| `AZURE_AD_PASS_REQ_TO_CALLBACK` | `true` if Azure AD request should be passed to callback. | `false` |
| `AZURE_AD_POLICY_NAME` | Azure AD policy name. | `my_policy` |
| `AZURE_STORAGE_CONNECTION_*` | The string of the connection to the storage. | `DefaultEndpointsProtocol=https;....windows.net` |
| `AZURE_STORAGE_CONNECTION_*_CONTAINER` | The name of the underlying container. | `my_container` |
| `AZURE_AD_VALIDATE_ISSUER` | `true` if Azure AD issuer should be validated or not. | `false` |
| `BCRYPT_ROUNDS`   | The number of rounds for bcrypt hashing. Default: `10`                      | `12`                               |
| `JWT_SECRET`      | The secret for signing and validating JWT.                                  | `mySecretJWTSecret`                |
| `LOCAL_DEVELOPMENT` | `true` if app running in local development context or not. | `false` |
| `LOG_LEVEL` | The name of the [logging level](https://www.npmjs.com/package/winston#logging-levels). | `debug` |
| `MONGO_DB` | The name of the database to connect to. | `myDatabase` |
| `MONGO_IS_COSMOSDB` | `true`, if server runs as [Cosmos DB](https://docs.microsoft.com/en-us/azure/cosmos-db/introduction) instance. | `true` |
| `MONGO_IS_LAZY` | If `true`, `MongoDatabase` will throw an error, if not enough configuration data is available, the first time an instance of it is used, instead the time an instance of it is created. | `true` |
| `MONGO_URL` | The connection URL. | `mongodb://mongo.example.com:27017` |
| `NATS_CLUSTER_ID` | The name of the cluster, that contains all microservices.                   | `my-cluster`                       |
| `NATS_GROUP`      | The name of the pod group / Kubernetes deployment.                          | `my-service-or-deployment`         |
| `NATS_URL`        | The URL to the NATS server.                                                 | `http://my-nats-service:4222`      |
| `POD_NAME`        | The name of the pod. This should come as imported metadata from Kubernetes. | `my-service-or-deployment-xcsgbxv` |

### Diagnostics

The library uses [winston](https://www.npmjs.com/package/winston) as logger:

```typescript
import { logger } from '@egomobile/microservices';

logger.info('Hello e.GO!', {
    file: __filename
});
```

#### Application Insights

Setup [Application Insights](https://www.npmjs.com/package/applicationinsights):

```typescript
import { setupApplicationInsights } from '@egomobile/microservices';

// you must define 'APPLICATION_INSIGHTS_KEY'
// and must not be in local development context
setupApplicationInsights();
```

### MongoDB

Use `MongoDatabase` class, which has simple support to handle [MongoDB](https://www.npmjs.com/package/mongodb) connections:

```typescript
import { MongoDatabase } from '@egomobile/microservices';

const mongo = new MongoDatabase();

// insert
await mongo.insert('myCollection', [{
    uuid: '8d41b8fc-2110-4b05-91ff-0a40c007be9d',
    last_name: 'Kloubert',
    first_name: 'Marcel'
}, {
    uuid: '90b7191d-44ce-43c9-a6e3-b777a8b9c8a6',
    last_name: 'M',
    first_name: 'Tanja'
}]);

// find
const docs = await mongo.find('myCollection', {
    first_name: 'Tanja'
});

// count
const docsCount = await mongo.count('myCollection', {
    first_name: 'Marcel'
});
```

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