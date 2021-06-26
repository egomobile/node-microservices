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

import { Request, RequestHandler, Response } from 'express';
import { log } from '../diagnostics';
import { isDev, isLocalDev } from '../utils';

/**
  * Custom options for 'withErrorHandler()' function.
  */
export interface IWithErrorHandlerOptions {
    /**
      * Custom error handler.
      *
      * @param {any} error The error.
      * @param {Request} request The request context.
      * @param {Response} response The response context.
      */
    handler?: (error: any, request: Request, response: Response) => any;
}

/**
  * Wraps a request handler with an error handler.
  *
  * @param {RequestHandler} handler The handler to wrap.
  * @param {IWithErrorHandlerOptions} [options] Custom options.
  *
  * @returns {RequestHandler} The wrapper.
  */
export function withErrorHandler(handler: RequestHandler, options?: IWithErrorHandlerOptions): RequestHandler {
    let errorHandler = options?.handler;
    if (!errorHandler) {  // use default?
        errorHandler = (err, req, resp) => {
            if (!resp.headersSent) {
                resp.status(500);
            }

            if (isLocalDev() || isDev()) {
                const errMsg = `${err?.stack || err}`;

                log.error(errMsg);
                return resp.send(errMsg);
            }

            return resp.send();
        };
    }

    return async (request, response, next) => {
        try {
            return await Promise.resolve(
                handler(request, response, next)
            );
        } catch (ex) {
            return Promise.resolve(
                errorHandler!(ex, request as Request, response)
            );
        }
    };
}
