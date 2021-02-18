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

import { Message, Stan, Subscription, SubscriptionOptions } from 'node-nats-streaming';
import { NatsClient, stan } from './client';
import { NATS_GROUP } from '../constants';

/**
 * Context for an 'onMessage' event.
 */
export interface INatsEventMessageHandlerContext<TEvent extends any = any> {
    /**
     * The function to call, if message should be ack.
     */
    ack: () => void;
    /**
     * The parsed data,
     */
    message: TEvent;
    /**
     * The function to call, if message should NOT be ack.
     */
    noAck: () => void;
    /**
     * The raw NATS message.
     */
    rawMessage: Message;
}

/**
 * Handles a message.
 *
 * @param {INatsEventMessageHandlerContext<TEvent>} context The context.
 */
export type OnNatsEventMessageHandler<TEvent extends any = any> =
    (context: INatsEventMessageHandlerContext<TEvent>) => Promise<void>;

/**
 * A NATS listener.
 */
export class NatsListener<TEvent extends any = any> {
    /**
     * Initializes a new instance of that class.
     *
     * @param {string} subject The subject / topic.
     * @param {NatsClient} [client] The custom, underlying client instance.
     */
    public constructor(
        public readonly subject: string,
        public readonly client: NatsClient = stan
    ) {
        if (!NATS_GROUP?.length) {
            throw new Error('No NATS_GROUP defined');
        }

        this.groupName = NATS_GROUP;

        this.subscriptionOptions = this.stan
            .subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(60 * 1000)
            .setDurableName(this.groupName);
    }

    /**
     * The NATS group.
     */
    public readonly groupName: string;

    /**
     * Start listening.
     *
     * @returns {Subscription} The new subscription.
     */
    public listen(): Subscription {
        const subscription = this.stan.subscribe(
            this.subject,
            this.groupName,
            this.subscriptionOptions
        );

        subscription.on('message', (rawMessage: Message) => {
            let shouldAck = true;
            const ack = () => {
                shouldAck = true;
            };
            const noAck = () => {
                shouldAck = false;
            };

            try {
                // eslint-disable-next-line no-unused-expressions
                const onMessage = this.onMessage;
                if (onMessage) {
                    onMessage({
                        ack,
                        message: parseMessage(rawMessage),
                        noAck,
                        rawMessage
                    });
                }
            } catch (e) {
                console.error(e);

                noAck();
            } finally {
                if (shouldAck) {
                    rawMessage.ack();
                }
            }
        });

        return subscription;
    }

    /**
     * Can be used to register a function, to receive event messages.
     */
    public onMessage?: OnNatsEventMessageHandler<TEvent> | null | undefined;

    /**
     * The subscription options.
     */
    public subscriptionOptions: SubscriptionOptions;

    /**
     * Gets the underlying basic NATS client.
     *
     * @returns {Stan} The underlying client.
     */
    public get stan(): Stan {
        return this.client.client;
    }
}

function parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === 'string'
        ? JSON.parse(data)
        : JSON.parse(data.toString('utf8'));
}