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

import jwt from 'jsonwebtoken';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { JWT_SECRET } from './constants';
import { Nilable } from '@egodigital/types';

/**
 * Options for 'withJWT()' function.
 */
export interface IWithJWTOptions {
    /**
     * The custom logic, if authorization failed.
     *
     * @param {Request} request The request context.
     * @param {Response} response The response context.
     */
    onUnauthorized?: (request: Request, response: Response) => any;

    /**
     * The custom logic, to setup the verified token.
     *
     * @param {any} token The decoded and verified token.
     * @param {Request} request The request context.
     * @param {Response} response The response context.
     */
    setupToken?: (token: any, request: Request, response: Response) => any;
}

/**
 * Creates a new Express middleware, that checks for a valid JWT.
 *
 * @param {Nilable<IWithJWTOptions>} [options] The custom options.
 *
 * @returns {RequestHandler} The new middleware.
 */
export function withJWT(options?: Nilable<IWithJWTOptions>): RequestHandler {
    if (!JWT_SECRET?.length) {
        throw new Error('No JWT_SECRET defined');
    }

    let onUnauthorized = options?.onUnauthorized;
    if (!onUnauthorized) {
        onUnauthorized = (req, resp) => resp.status(401).json({
            success: false,
            data: 'Unauthorized'
        });
    }

    let setupToken = options?.setupToken;
    if (!setupToken) {
        setupToken = (t, req, resp) => {
            req.userToken = t;
        };
    }

    return (async (request: Request, response: Response, next: NextFunction) => {
        try {
            // for speed reasons, we do not normalize the strings here,
            // like lowercasing them
            //
            // format: Authorization: Bearer <TOKEN>

            const authorization = request.headers['authorization'];
            if (authorization?.startsWith('Bearer ')) {
                const bearer = authorization.substr(7);

                const token = jwt.verify(bearer, JWT_SECRET!);
                if (token) {
                    await Promise.resolve(
                        setupToken!(token, request, response)
                    );

                    return next();
                }
            }
        } catch { /* ignore */ }

        return Promise.resolve(
            onUnauthorized!(request, response)
        );
    }) as any;
}