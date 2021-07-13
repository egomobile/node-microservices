/**
 * This file is part of the @egomobile/microservices distribution.
 * Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
 *
 * @egomobile/microservices is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * @egomobile/microservices is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const pQueue = require('p-queue').default;
import type { CollectionInsertManyOptions, Db as MongoDb, FilterQuery, FindOneOptions, InsertWriteOpResult, MongoClient as MongoDBClient, MongoCountPreferences, WithoutProjection } from 'mongodb';

/**
 * Options for 'createSingletonMongoProvider()' function.
 */
export interface ICreateSingletonMongoProviderOptions {
    /**
     * A function, that provides the options for the singleton.
     *
     * @returns {IMongoDatabaseOptions | Promise<IMongoDatabaseOptions>} The options or the promise with the options.
     */
    getClientOptions: () => IMongoDatabaseOptions | Promise<IMongoDatabaseOptions>;
}

/**
 * Options for 'MongoDatabase' class.
 */
export interface IMongoDatabaseOptions {
    /**
     * The name of the database.
     */
    db: string;
    /**
     * Is Cosmos DB or not.
     */
    isCosmosDB?: boolean;
    /**
     * The URI.
     */
    url: string;
}

/**
 * Creates function that provides a MongoDB client.
 *
 * @returns {Promise<MongoDBClient>} The promise with the new connection.
 */
export type MongoClientProvider = () => Promise<MongoDBClient>;

/**
 * A MongoDB document.
 */
export type MongoDocument<T> = T & { _id: any };

/**
 * A Mongo schema.
 */
export type IMongoSchema = {
    /**
     * The list of props and values.
     */
    [key: string]: any;
};

/**
 * Action for 'withClient()' method of 'MongoDatabase' class.
 *
 * @param {MongoDBClient} client The open client.
 * @param {MongoDb} db The underlying default database instance.
 *
 * @returns {Promise<TResult>} The promise with the result.
 */
export type WithMongoClientAction<TResult extends any = any> =
    (client: MongoDBClient, db: MongoDb) => Promise<TResult>;

/**
 * Creates a new function, that provides a singleton Mongo client connection.
 *
 * @param {ICreateSingletonMongoProviderOptions} options The options.
 *
 * @returns {MongoClientProvider} The new function.
 */
export function createSingletonMongoClientProvider(options: ICreateSingletonMongoProviderOptions): MongoClientProvider {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { MongoClient } = require('mongodb');

    let client: MongoDBClient | null = null;
    let clientOptions: IMongoDatabaseOptions | null = null;
    const queue = new pQueue({
        autoStart: true,
        concurrency: 1
    });

    const reopen = async () => {
        try {
            let oldClient = client;
            client = null;

            if (oldClient && oldClient.isConnected()) {
                try {
                    await oldClient.close();
                } catch { }
            }

            const newClientOptions = await Promise.resolve(options.getClientOptions());

            const url = newClientOptions.url?.trim();
            if (!url?.length) {
                throw new Error('No Mongo url defined');
            }

            const newClient: MongoDBClient = await MongoClient.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            await newClient.connect();

            client = newClient;
            clientOptions = newClientOptions;
        } catch (ex) {
            client = null;

            throw ex;
        }
    };

    return () => queue.add(async () => {
        let shouldRetry = false;

        try {
            let currentDb = client;
            if (currentDb) {
                const db = clientOptions!.db?.trim();
                if (!db?.length) {
                    throw new Error('No Mongo database defined');
                }

                shouldRetry = true;

                // test connection
                await currentDb.db(db)
                    .collections();

                return currentDb;
            } else {
                await reopen();
            }
        } catch (ex) {
            if (shouldRetry) {
                await reopen();
            } else {
                throw ex;
            }
        }

        return client!;
    });
}

/**
 * A connection to a MongoDB database.
 */
export class MongoDatabase {
    protected readonly options: Partial<IMongoDatabaseOptions>;

    /**
     * Initializes a new instance of that class.
     *
     * @param {IMongoDatabaseOptions} [options] Custom options.
     */
    constructor(options?: IMongoDatabaseOptions) {
        const MONGO_IS_COSMOSDB = process.env.MONGO_IS_COSMOSDB?.toLowerCase().trim();
        const MONGO_DB = process.env.MONGO_DB?.trim();
        const MONGO_IS_LAZY = process.env.MONGO_IS_LAZY?.toLowerCase().trim();
        const MONGO_URL = process.env.MONGO_URL?.trim();

        let isCosmosDB: boolean | undefined;
        let db: string | undefined;
        let url: string | undefined;
        if (options) {
            isCosmosDB = options.isCosmosDB;
            db = options.db;
            url = options.url;
        } else {
            isCosmosDB = MONGO_IS_COSMOSDB === 'true';
            db = MONGO_DB;
            url = MONGO_URL;
        }

        this.options = {
            db,
            isCosmosDB: !!isCosmosDB,
            url
        };

        if (MONGO_IS_LAZY !== 'true') {
            this.checkOptionsOrThrow();
        }
    }

    private checkOptionsOrThrow() {
        const { db, url } = this.options;

        if (!db?.length) {
            throw new Error('No MONGO_DB defined');
        }

        if (!url?.length) {
            throw new Error('No MONGO_URL defined');
        }
    }

    /**
     * Does a count on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {FilterQuery<T>} [query] The optional query.
     * @param {MongoCountPreferences} [options] Custom options.
     *
     * @returns {Promise<number>} The promise with the number of documents.
     */
    public async count<T = IMongoSchema>(
        collectionName: string,
        query?: FilterQuery<T>,
        options?: MongoCountPreferences | WithoutProjection<FindOneOptions<T>>
    ): Promise<number> {
        if (this.options.isCosmosDB) {
            // some versions of Cosmos DB instances
            // do not support 'count()' operations
            // so we have to do a 'find()' first
            return (await this.find(collectionName, query || {}, options as WithoutProjection<FindOneOptions<T>>)).length;
        }

        return this.withClient(client => {
            const db = client.db(this.options.db!);
            const collection = db.collection(collectionName);

            return collection.count(query, options as MongoCountPreferences) as Promise<number>;
        });
    }

    /**
     * Does a find on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {FilterQuery<T>} query The query.
     * @param {WithoutProjection<FindOneOptions<T>>} [options] Custom options.
     *
     * @returns {Promise<T[]>} The promise with the result.
     */
    public find<T = IMongoSchema>(
        collectionName: string,
        query: FilterQuery<T>,
        options?: WithoutProjection<FindOneOptions<T>>
    ): Promise<T[]> {
        return this.withClient(client => {
            const db = client.db(this.options.db!);
            const collection = db.collection(collectionName);

            return collection.find(query, options)
                .toArray() as Promise<T[]>;
        });
    }

    /**
     * Does a findOne on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {FilterQuery<T>} query The query.
     * @param {FindOneOptions<T>} [options] Custom options.
     *
     * @returns {Promise<T|null>} The promise with the result or (null) if not found.
     */
    public findOne<T = IMongoSchema>(
        collectionName: string,
        query: FilterQuery<T>,
        options?: FindOneOptions<T extends IMongoSchema ? IMongoSchema : T>
    ): Promise<T | null> {
        return this.withClient(client => {
            const db = client.db(this.options.db!);
            const collection = db.collection(collectionName);

            return collection.findOne(query as any, options as any) as any;
        });
    }

    /**
     * Do an insert on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {T[]} docs The documents to insert.
     * @param {CollectionInsertManyOptions} [options] Custom options.
     *
     * @returns {Promise<InsertWriteOpResult<MongoDocument<T>>>} The promise with the result.
     */
    public insert<T = IMongoSchema>(collectionName: string, docs: T[], options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult<MongoDocument<T>>> {
        return this.withClient(client => {
            const db = client.db(this.options.db!);
            const collection = db.collection(collectionName);

            return collection.insertMany(docs, options);
        });
    }

    /**
     * Opens a new client connections and executes an action for it.
     * After invocation the underlying connection is closed automatically.
     *
     * @param {WithMongoClientAction<TResult>} action The action to invoke.
     *
     * @returns {Promise<TResult>} The promise with the result.
     */
    public async withClient<TResult extends any = any>(
        action: WithMongoClientAction<TResult>
    ): Promise<TResult> {
        this.checkOptionsOrThrow();

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { MongoClient } = require('mongodb');

        const client: MongoDBClient = await MongoClient.connect(this.options.url!, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        try {
            return await action(client, client.db(this.options.db!));
        } finally {
            await client.close();
        }
    }
}
