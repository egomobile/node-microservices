# Change Log (@egomobile/microservices)

## 0.32.0

* add `getMicrosoftMe()` and `tryGetMicrosoftMe()` functions
* add `RequestError` error class

## 0.31.0

* remove [p-queue](https://www.npmjs.com/package/p-queue) module

## 0.30.1

* `options` in `MongoDatabase` is protected now
* bugfixes

## 0.29.0

* **BREAKING CHANGE**: `ICreateSingletonMongoProviderOptions` now has only a `getClientOptions()` property

## 0.28.0

* add `createSingletonMongoClientProvider()` function
* `npm update`

## 0.27.1

* **BREAKING CHANGE**: `withErrorHandler()` outputs extended error message, when in local development mode or in `development` node environment
* add `readStream()`, `withDataURI()` and `withSchema()` functions
* add `schema` namespace, that is a link to embedded [joi](https://www.npmjs.com/package/joi) module
* code cleanups and improvements
* bugfixes

## 0.26.1

* **BREAKING CHANGE**: `getBlobStorageClient()` => `getAzureBlobStorageClient()`
* **BREAKING CHANGE**: `getBlobStorageContainerClient()` => `getAzureBlobStorageContainerClient()`

## 0.25.0

* add `getBlobStorageClient()` and `getBlobStorageContainerClient()` functions
* `npm update`

## 0.24.0

* add `decodeJWT()` function
* add optional `options` parameter for `verifyJWT()` function

## 0.23.0

* **BREAKING CHANGES**: remove global constants for Application Insights, Azure, JWT, password and NATS features, and the following ones: `LOCAL_DEVELOPMENT`, `LOG_LEVEL`
* add 'isDev()', `isJest()`, `isLocalDev()`, `isNodeEnv()`, `isProd()`, `isTest()` and `isTruely()` functions

## 0.22.3

* add `MONGO_IS_LAZY`: if `true`, `MongoDatabase` will throw an error, if not enough configuration data is available, the first time an instance of it is used, instead the time an instance of it is created
* bugfixes

## 0.21.0

* add `loadEnv()` and `loadEnvSync()` functions
* `npm update`
* code cleanups and improvements

## 0.20.0

* add `options` parameter to `withErrorHandler()` function
* `npm update`

## 0.19.0

* add `ApiResult` and `IApiResult` types

## 0.18.0

* add second argument `db` to `withClient()` method of `MongoDatabase` class

## 0.17.0

* better typings and `withClient()` method for `MongoDatabase` class

## 0.16.0

* **IMPORTANT CHANGE**: console output by `logger` instance is activated by default now

## 0.15.0

* add `findOne()` method to `MongoDatabase` class

## 0.14.0

* add `IMongoDatabaseOptions` for constructor of `MongoDatabase` class

## 0.13.0

* default [logging level](https://www.npmjs.com/package/winston#logging-levels) is set now
* add `log()` function

## 0.12.0

* add default [logger](https://www.npmjs.com/package/winston)
* add [MongoDB](https://www.npmjs.com/package/mongodb) support

## 0.11.0

* downgrade to [TypeScript 4.2.4](https://www.npmjs.com/package/typescript/v/4.2.4)
* fix typos
* code cleanups and improvements

## 0.10.0

* add `isNil`, `tick`, `toStringSafe` and `withErrorHandler` helper functions

## 0.9.2

* can connect with [Azure AD](https://azure.microsoft.com/en-us/services/active-directory/), by using [passport](https://www.npmjs.com/package/passport) and [passport-azure-ad](https://www.npmjs.com/package/passport-azure-ad) now
* can setup app for use with [Application Insights](https://azure.microsoft.com/en-us/services/monitor/
* bugfixes

## 0.8.0

* change to [e.GO Mobile](https://e-go-mobile.com/)
* `npm update`

## 0.7.0

* `npm update`

## 0.6.0

* BREAKING CHANGE: [express](https://www.npmjs.com/package/express) is now added to [peerDependencies](https://nodejs.org/es/blog/npm/peer-dependencies/)
* typos

## 0.5.0

* code cleanups and improvements

## 0.4.1

* better error handling of [onMessage](https://egodigital.github.io/node-microservices/classes/nats_listener.natslistener.html#onmessage) listener

## 0.3.0

* BREAKING CHANGE: [subscriptionOptions](https://egodigital.github.io/node-microservices/classes/nats_listener.natslistener.html#subscriptionoptions) property of [NatsListener](https://egodigital.github.io/node-microservices/classes/nats_listener.natslistener.html) class is read-only now
* fixes

## 0.2.3

* add functions, that hashes passwords with bcrypt
* add JWT helper functions

## 0.1.4

* initial release