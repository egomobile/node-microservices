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

type MongoDatabaseAction<TResult extends any = any> = (client: any) => Promise<TResult>;

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
     */
    constructor() {
        if (!MONGO_DB?.length) {
            throw new Error('No MONGO_DB defined');
        }

        if (!MONGO_URL?.length) {
            throw new Error('No MONGO_URL defined');
        }

        this.isCosmosDB = MONGO_IS_COSMOSDB === 'true';
        this.mongoDB = MONGO_DB;
        this.mongoUrl = MONGO_URL;
    }

    /**
     * Does a count on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {any} [query] The optional query.
     * @param {any} [options] Custom options.
     *
     * @returns {Promise<number>} The promise with the number of documents.
     */
    public async count(collectionName: string, query?: any, options?: any): Promise<number> {
        if (this.isCosmosDB) {
            // some versions of Cosmos DB instances
            // do not support 'count()' operations
            // so we have to do a 'find()' first
            return (await this.find(collectionName, query || {}, options)).length;
        }

        return this.withConnection(client => {
            const db = client.db(this.mongoDB);
            const collection = db.collection(collectionName);

            return collection.count(query, options);
        });
    }

    /**
     * Does a find on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {any} query The query.
     * @param {any} [options] Custom options.
     *
     * @returns {Promise<T[]>} The promise with the result.
     */
    public find<T extends any = any>(
        collectionName: string,
        query: any,
        options?: any
    ): Promise<T[]> {
        return this.withConnection(client => {
            const db = client.db(this.mongoDB);
            const collection = db.collection(collectionName);

            return collection.find(query, options).toArray();
        });
    }

    /**
     * Do an insert on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {any[]} docs The documents to insert.
     * @param {any} [options] Custom options.
     *
     * @returns {Promise<any>} The promise with the result.
     */
    public insert(collectionName: string, docs: any[], options?: any): Promise<any> {
        return this.withConnection(client => {
            const db = client.db(this.mongoDB);
            const collection = db.collection(collectionName);

            return collection.insertMany(docs, options);
        });
    }

    private async withConnection<TResult extends any = any>(
        action: MongoDatabaseAction<TResult>
    ) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { MongoClient } = require('mongodb');

        const client = await MongoClient.connect(this.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        try {
            return await action(client);
        } finally {
            client.close();
        }
    }
}
