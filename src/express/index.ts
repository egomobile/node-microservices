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

import { RequestHandler } from 'express';
import { LOCAL_DEVELOPMENT } from '../constants';

/**
 * Wraps a request handler with an error handler.
 *
 * @param {RequestHandler} handler The handler to wrap.
 *
 * @returns {RequestHandler} The wrapper.
 */
export function withErrorHandler(handler: RequestHandler): RequestHandler {
    return async (request, response, next) => {
        try {
            return await Promise.resolve(
                handler(request, response, next)
            );
        } catch (ex) {
            if (!response.headersSent) {
                response.status(500);
            }

            if (LOCAL_DEVELOPMENT === 'true') {
                return response.send(`${ex}`);
            }

            return response.send();
        }
    };
}
