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

import jwt, { SignOptions } from 'jsonwebtoken';
import { Nilable, Optional } from '@egomobile/types';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { JWT_SECRET } from '../constants';

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

function getSecret() {
    if (!JWT_SECRET?.length) {
        throw new Error('No JWT_SECRET defined');
    }

    return JWT_SECRET;
}

/**
 * Creates a JWT from an object.
 *
 * @param {string} decodedToken The token as object.
 * @param {Optional<SignOptions>} [options] Additional and custom sign options.
 *
 * @returns {string} The JWT.
 */
export function signJWT(decodedToken: any, options?: Optional<SignOptions>): string {
    return jwt.sign(decodedToken, getSecret(), options);
}

/**
 * Verifies a JWT and returns it decoded version, if succeeded.
 *
 * @param {string} token The token as string.
 *
 * @returns {TToken|false} The decoded token, or (false), if verification failed.
 */
export function verifyJWT<TToken extends any = any>(token: string): TToken | false {
    try {
        const decodedToken = jwt.verify(token, getSecret());
        if (decodedToken) {
            return decodedToken as any;
        }
    } catch { /* ignore */ }

    return false;
}

/**
 * Creates a new Express middleware, that checks for a valid JWT.
 *
 * @param {Nilable<IWithJWTOptions>} [options] The custom options.
 *
 * @returns {RequestHandler} The new middleware.
 */
export function withJWT(options?: Nilable<IWithJWTOptions>): RequestHandler {
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

                const token = jwt.verify(bearer, getSecret());
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
