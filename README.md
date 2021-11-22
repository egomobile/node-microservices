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

| Name                                   | Description                                                                                                                                                                             | Example                                                                                                    |
|----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `APPLICATION_INSIGHTS_KEY`             | Application Insights key.                                                                                                                                                               | `dd7589fc-1cf9-413e-bf6c-aa1253858b55`                                                                     |
| `AZURE_AD_AUDIENCE`                    | Azure AD audience.                                                                                                                                                                      | `6b3c51b9-7cc0-4327-a901-e5b889efbbaa`                                                                     |
| `AZURE_AD_CLIENT_ID`                   | App ID for Azure AD.                                                                                                                                                                    | `6b3c51b9-7cc0-4327-a901-e5b889efbbaa`                                                                     |
| `AZURE_AD_IDENTITY_METADATA`           | Identity metadata.                                                                                                                                                                      | `https://myazuread.b2clogin.com/myazuread.onmicrosoft.com/my_policy/v2.0/.well-known/openid-configuration` |
| `AZURE_AD_IS_B2C`                      | `true` if Azure AD is running in B2C context.                                                                                                                                           | `true`                                                                                                     |
| `AZURE_AD_LOGGING_LEVEL`               | Azure ADlogging level. Possible values are `error`, `info` or `warn`.                                                                                                                   | `info`                                                                                                     |
| `AZURE_AD_PASS_REQ_TO_CALLBACK`        | `true` if Azure AD request should be passed to callback.                                                                                                                                | `false`                                                                                                    |
| `AZURE_AD_POLICY_NAME`                 | Azure AD policy name.                                                                                                                                                                   | `my_policy`                                                                                                |
| `AZURE_STORAGE_CONNECTION_*`           | The string of the connection to the storage.                                                                                                                                            | `DefaultEndpointsProtocol=https;....windows.net`                                                           |
| `AZURE_STORAGE_CONNECTION_*_CONTAINER` | The name of the underlying container.                                                                                                                                                   | `my_container`                                                                                             |
| `AZURE_AD_VALIDATE_ISSUER`             | `true` if Azure AD issuer should be validated or not.                                                                                                                                   | `false`                                                                                                    |
| `BCRYPT_ROUNDS`                        | The number of rounds for bcrypt hashing. Default: `10`                                                                                                                                  | `12`                                                                                                       |
| `EMAIL_FROM`                           | The email from field.                                                                                                                                                                   | `no-reply@e-go-mobile.com`                                                                                 |
| `EMAIL_HOST`                           | The host for sending mail.                                                                                                                                                              | `smtp.office365.com`                                                                                       |
| `EMAIL_PASSWORD`                       | The email password for authentication.                                                                                                                                                  | `<some secure password>`                                                                                   |
| `EMAIL_PORT`                           | The port for sending mail.                                                                                                                                                              | `587`                                                                                                      |
| `EMAIL_SECURE`                         | Should the email be send encryted?                                                                                                                                                      | `false`                                                                                                    |
| `EMAIL_USER`                           | The email user for authentication.                                                                                                                                                      | `no-reply@e-go-mobile.com`                                                                                 |
| `EMAIL_TO`                             | The email to field.                                                                                                                                                                     | `some@address.com`                                                                                         |
| `JWT_SECRET`                           | The secret for signing and validating JWT.                                                                                                                                              | `mySecretJWTSecret`                                                                                        |
| `LOCAL_DEVELOPMENT`                    | `true` if app running in local development context or not.                                                                                                                              | `false`                                                                                                    |
| `LOG_LEVEL`                            | The name of the [logging level](https://www.npmjs.com/package/winston#logging-levels).                                                                                                  | `debug`                                                                                                    |
| `MONGO_DB`                             | The name of the database to connect to.                                                                                                                                                 | `myDatabase`                                                                                               |
| `MONGO_IS_LAZY`                        | If `true`, `MongoDatabase` will throw an error, if not enough configuration data is available, the first time an instance of it is used, instead the time an instance of it is created. | `true`                                                                                                     |
| `MONGO_URL`                            | The connection URL.                                                                                                                                                                     | `mongodb://mongo.example.com:27017`                                                                        |
| `NATS_CLUSTER_ID`                      | The name of the cluster, that contains all microservices.                                                                                                                               | `my-cluster`                                                                                               |
| `NATS_GROUP`                           | The name of the pod group / Kubernetes deployment.                                                                                                                                      | `my-service-or-deployment`                                                                                 |
| `NATS_URL`                             | The URL to the NATS server.                                                                                                                                                             | `http://my-nats-service:4222`                                                                              |
| `POD_NAME`                             | The name of the pod. This should come as imported metadata from Kubernetes.                                                                                                             | `my-service-or-deployment-xcsgbxv`                                                                         |

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

### Express

#### Schema

Use `schema` namespace, which is a link to embedded [joi](https://www.npmjs.com/package/joi) module, and build-in middlewares to validate input.

```typescript
import { schema, withDataURI, withSchema } from '@egomobile/microservices';

interface IMySchema {
    email?: string;
    first_name: string;
    last_name: string;
}

const mySchema = schema.object({
    email: schema.string().strict().trim().email().optional()
    first_name: schema.string().strict().trim().min(1).required()
    last_name: schema.string().strict().trim().min(1).required()
}).required();


// withSchema() will automatically add
// middleware, created by express.json()
// with a limit of 128 MB
app.post('/user/register', withSchema(mySchema), async (request, response) => {
    const body: IMySchema = request.body;

    // ...
});

// withDataURI() will automatically add middlewares
// to parse the input
app.put('/user/image', withDataURI(), async (request, response) => {
    // data:<MIME>;base64,<BASE64-DATA>

    const mime = request.headers['content-type'] as string;  // <MIME>
    const body: Buffer = request.body;  // decoded <BASE64-DATA>

    // ...
});
```

### MongoDB

Use `MongoDatabase` class, which has simple support to handle [MongoDB](https://www.npmjs.com/package/mongodb) connections:

```typescript
import { MongoDatabase } from '@egomobile/microservices';

const mongo = new MongoDatabase();
await mongoDb.connect();

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

mongo.disconnect();
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