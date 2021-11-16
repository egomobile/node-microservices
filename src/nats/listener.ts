/* eslint-disable no-underscore-dangle */

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

import { Message, Stan, Subscription, SubscriptionOptions } from 'node-nats-streaming';
import { NatsClient, stan } from './client';
import { Nilable } from '@egomobile/types';

/**
 * Context for an 'onMessage' event.
 */
export interface INatsEventMessageHandlerContext<TEvent extends any = any> {
    /**
     * The function to call, if message should be ack.
     *
     * @param {boolean} [force] Force ack or not. Default: (false)
     */
    ack: (force?: boolean) => void;
    /**
     * The parsed data.
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
        const NATS_GROUP = process.env.NATS_GROUP?.trim();

        if (!NATS_GROUP?.length) {
            throw new Error('No NATS_GROUP defined');
        }

        this.groupName = NATS_GROUP;

        const options = this.stan.subscriptionOptions();
        {
            this.initSubscriptionOptions(options);
            this.subscriptionOptions = options;
        }
    }

    /**
     * Do an automatic ack on each message event or not.
     */
    public autoAck = true;

    /**
     * The NATS group.
     */
    public readonly groupName: string;

    /**
     * Internal NATS client message handler.
     *
     * @param {Message} rawMessage The raw message.
     */
    protected handleSubscriptionMessage(rawMessage: Message): void {
        let shouldAck = true;
        let shouldForceAck = false;
        const ack = (force = false) => {
            shouldAck = true;
            shouldForceAck = !!force;
        };
        const noAck = () => {
            shouldAck = false;
        };

        const onError = (err: any) => {
            console.error(err);

            noAck();
        };
        const onSuccess = () => {
            if (shouldForceAck || (this.autoAck && shouldAck)) {
                rawMessage.ack();
            }
        };

        try {
            const onMessage = this.onMessage;
            if (onMessage) {
                let message: any;
                try {
                    message = parseMessage(rawMessage);
                } catch {
                    rawMessage.ack();  // JSON parse errors should not resend events
                    return;
                }

                onMessage({
                    ack,
                    message,
                    noAck,
                    rawMessage
                }).then(onSuccess)
                    .catch(onError);
            } else {
                onSuccess();
            }
        } catch (e) {
            onError(e);
        }
    }

    /**
     * Initializes the subscription options.
     *
     * @param {SubscriptionOptions} options The "empty" options object.
     */
    protected initSubscriptionOptions(options: SubscriptionOptions) {
        options.setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(60 * 1000)
            .setDurableName(this.groupName);
    }

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

        subscription.on('message', this.handleSubscriptionMessage.bind(this));

        return subscription;
    }

    /**
     * Can be used to register a function, to receive event messages.
     */
    public onMessage?: Nilable<OnNatsEventMessageHandler<TEvent>>;

    /**
     * Gets the underlying basic NATS client.
     *
     * @returns {Stan} The underlying client.
     */
    public get stan(): Stan {
        return this.client.client;
    }

    /**
     * The subscription options.
     */
    public readonly subscriptionOptions: SubscriptionOptions;
}

function parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === 'string'
        ? JSON.parse(data)
        : JSON.parse(data.toString('utf8'));
}
