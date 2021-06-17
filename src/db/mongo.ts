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

import type { CollectionInsertManyOptions, FilterQuery, FindOneOptions, InsertWriteOpResult, MongoClient as MongoDBClient, MongoCountPreferences, WithoutProjection } from 'mongodb';

/**
 * A MongoDB document.
 */
export type MongoDocument<T> = T & { _id: any };

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
 * Action for 'withClient()' method of 'MongoDatabase' class.
 */
export type WithMongoClientAction<TResult extends any = any> = (client: MongoDBClient) => Promise<TResult>;

const MONGO_IS_COSMOSDB = process.env.MONGO_IS_COSMOSDB?.toLowerCase().trim();
const MONGO_DB = process.env.MONGO_DB?.trim();
const MONGO_URL = process.env.MONGO_URL?.trim();

/**
 * A connection to a MongoDB database.
 */
export class MongoDatabase {
    private readonly isCosmosDB: boolean;
    private readonly mongoDB: string;
    private readonly mongoUrl: string;

    /**
     * Initializes a new instance of that class.
     *
     * @param {IMongoDatabaseOptions} [options] Custom options.
     */
    constructor(options?: IMongoDatabaseOptions) {
        let isCosmosDB: boolean;
        let mongoDB: string | undefined;
        let mongoUrl: string | undefined;
        if (options) {
            isCosmosDB = !!options.isCosmosDB;
            mongoDB = options.db;
            mongoUrl = options.url;
        } else {
            isCosmosDB = MONGO_IS_COSMOSDB === 'true';
            mongoDB = MONGO_DB;
            mongoUrl = MONGO_URL;
        }

        if (!mongoDB?.length) {
            throw new Error('No MONGO_DB defined');
        }

        if (!mongoUrl?.length) {
            throw new Error('No MONGO_URL defined');
        }

        this.isCosmosDB = isCosmosDB;
        this.mongoDB = mongoDB;
        this.mongoUrl = mongoUrl;
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
    public async count<T extends any = any>(
        collectionName: string,
        query?: FilterQuery<T>,
        options?: MongoCountPreferences | WithoutProjection<FindOneOptions<T>>
    ): Promise<number> {
        if (this.isCosmosDB) {
            // some versions of Cosmos DB instances
            // do not support 'count()' operations
            // so we have to do a 'find()' first
            return (await this.find(collectionName, query || {}, options as WithoutProjection<FindOneOptions<T>>)).length;
        }

        return this.withClient(client => {
            const db = client.db(this.mongoDB);
            const collection = db.collection(collectionName);

            return collection.count(query, options as MongoCountPreferences);
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
    public find<T extends any = any>(
        collectionName: string,
        query: FilterQuery<T>,
        options?: WithoutProjection<FindOneOptions<T>>
    ): Promise<T[]> {
        return this.withClient(client => {
            const db = client.db(this.mongoDB);
            const collection = db.collection(collectionName);

            return collection.find(query, options)
                .toArray();
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
    public findOne<T extends any = any>(
        collectionName: string,
        query: FilterQuery<T>,
        options?: FindOneOptions<T>
    ): Promise<T | null> {
        return this.withClient(client => {
            const db = client.db(this.mongoDB);
            const collection = db.collection(collectionName);

            return collection.findOne(query, options);
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
    public insert<T extends any = any>(collectionName: string, docs: T[], options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult<MongoDocument<T>>> {
        return this.withClient(client => {
            const db = client.db(this.mongoDB);
            const collection = db.collection(collectionName);

            return collection.insertMany(docs, options);
        });
    }

    /**
     * Opens a new client connections and executes an action for it.
     *
     * @param {WithMongoClientAction<TResult>} action The action to invoke.
     *
     * @returns {Promise<TResult>} The promise with the result.
     */
    public async withClient<TResult extends any = any>(
        action: WithMongoClientAction<TResult>
    ): Promise<TResult> {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { MongoClient } = require('mongodb');

        const client: MongoDBClient = await MongoClient.connect(this.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        try {
            return await action(client);
        } finally {
            await client.close();
        }
    }
}
