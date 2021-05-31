# Change Log (@egomobile/microservices)

## 0.9.1

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