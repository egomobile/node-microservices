/* eslint-disable no-underscore-dangle */

/**
 * This file is part of the @egodigital/microservices distribution.
 * Copyright (c) e.GO Digital GmbH, Aachen, Germany (https://www.e-go-digital.com/)
 *
 * @egodigital/microservices is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * @egodigital/microservices is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import nats, { Stan } from 'node-nats-streaming';
import { Nilable } from '@egodigital/types';
import { NATS_CLUSTER_ID, NATS_URL, POD_NAME } from '../constants';

/**
 * A simple NATS client.
 */
export class NatsClient {
    private _client: Nilable<Stan>;

    /**
     * Gets the underlying basic client.
     *
     * @returns {Stan} The NATS client.
     */
    public get client(): Stan {
        if (!this._client) {
            throw new Error('Client not connected');
        }

        return this._client;
    }

    /**
     * Starts a new connection to a NATS server.
     *
     * @returns {Promise<Stan>} The promise with the base client.
     */
    public connect(): Promise<Stan> {
        if (!NATS_URL?.length) {
            throw new Error('No NATS_URL defined');
        }

        if (!NATS_CLUSTER_ID?.length) {
            throw new Error('No NATS_CLUSTER_ID defined');
        }

        if (!POD_NAME?.length) {
            throw new Error('No POD_NAME defined');
        }

        return new Promise<Stan>((resolve, reject) => {
            try {
                const newClient = nats.connect(NATS_CLUSTER_ID!, POD_NAME!, {
                    url: NATS_URL
                });

                newClient.once('error', (err) => {
                    reject(err);
                });

                newClient.once('connect', () => {
                    this._client = newClient;
                    resolve(newClient);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Registers the process events to close the client of exit.
     */
    public exitOnClose() {
        // close process, if connection to NATS
        // is terminated
        this.client.once('close', () => process.exit());

        // try to close connection, if process closes
        process.once('exit', () => this.tryClose());
        process.once('SIGINT', () => this.tryClose());
        process.once('SIGUSR1', () => this.tryClose());
        process.once('SIGUSR2', () => this.tryClose());
        process.once('uncaughtException', (err) => {
            process.exitCode = 2;
            console.error(err);

            this.tryClose();
        });
    }

    private tryClose() {
        try {
            this._client?.close();
        } catch (e) {
            console.warn(e);
        }
    }
}

/**
 * A default NATS client instance.
 */
export const stan = new NatsClient();