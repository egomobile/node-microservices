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

import { Stan } from 'node-nats-streaming';
import { NatsClient, stan } from './client';

/**
 * A basic NATS event publisher.
 */
export class NatsPublisher<TEvent extends any = any> {
    /**
     * Initializes a new instance of that class.
     *
     * @param {string} subject The subject.
     * @param {NatsClient} [client] The custom, underlying client instance.
     */
    public constructor(
        public readonly subject: string,
        public readonly client: NatsClient = stan
    ) { }

    /**
     * Publishes data.
     *
     * @param {TEvent} data The data to publish.
     *
     * @returns {Promise<void>} The promise
     */
    public publish(data: TEvent): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.stan.publish(this.subject, Buffer.from(JSON.stringify(data), 'utf8'), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Gets the underlying raw client.
     *
     * @returns {Stan} The client.
     */
    public get stan(): Stan {
        return this.client.client;
    }
}