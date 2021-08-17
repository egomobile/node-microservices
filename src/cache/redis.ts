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

import _ from 'lodash';
import { RedisClient } from 'redis';
import { promisify } from 'util';
import { tick, toStringSafe } from '../utils';
import { ICache } from './icache';

const REDIS_HOST = process.env.REDIS_HOST?.trim() || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT?.trim() || '6379');

/**
 * A Redis based cache implementation.
 */
export class RedisCache implements ICache {
    redis = require('redis');

    protected delAsync: any = null;
    protected flushdbAsync: any = null;
    protected getAsync: any = null;
    protected redisClient: RedisClient | null = null;
    protected setAsync: any = null;

    public constructor() {
        this.redisClient = this.redis.createClient({
            host: REDIS_HOST,
            port: REDIS_PORT
        });

        if (this.redisClient) {
            this.redisClient.on('error', (error: any) => {
                console.warn(`REDIS ERROR: ${toStringSafe(error)}`, {
                    file: __filename
                });
            });

            this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);
            this.flushdbAsync = promisify(this.redisClient.flushdb).bind(this.redisClient);
            this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
            this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
        }
    }

    /**
     * @inheritdoc
     */
    public flush(): Promise<boolean> {
        return tick(async () => {
            try {
                return await this.flushdbAsync('ASYNC');
            } catch {
                return false;
            }
        });
    }

    /**
     * @inheritdoc
     */
    public get<TResult extends any = any>(key: string): Promise<TResult>;
    public get<TResult, TDefault>(key: string, defaultValue: TDefault): Promise<TResult | TDefault>;
    public get<TResult extends any = any, TDefault extends any = any>(key: string, defaultValue?: TDefault): Promise<TResult | TDefault | undefined> {
        return tick(async () => {
            try {
                const value = await this.getAsync(key);
                if (typeof value === 'string') {
                    return JSON.parse(value);
                }
            } catch { }

            return defaultValue;
        });
    }

    /**
     * @inheritdoc
     */
    public set(key: string, value: any, ttl: number | false = 3600): Promise<boolean> {
        return tick(async () => {
            try {
                if (_.isNil(value)) {
                    await this.delAsync(key);
                } else {
                    const jsonStr = JSON.stringify(value);

                    if (ttl === false) {
                        await this.setAsync(key, jsonStr);
                    } else {
                        await this.setAsync(key, jsonStr, 'EX', ttl);
                    }
                }

                return true;
            } catch {
                return false;
            }
        });
    }
}
