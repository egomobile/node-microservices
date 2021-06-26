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

import express, { Request, RequestHandler, Response } from 'express';
import joi from 'joi';

/**
 * The context of a 'SchemaValidationErrorHandler' execution.
 */
export interface ISchemaValidationErrorHandlerContext<TRequest extends Request = Request, TResponse extends Response = Response> {
    /**
     * The request context.
     */
    request: TRequest;
    /**
     * The response context.
     */
    response: TResponse;
    /**
     * The validation result.
     */
    validation: joi.ValidationResult;
}

/**
 * Custom options for 'withDataURL()' function.
 */
export interface IWithDataURLOptions {
    /**
     * The default encoding, using for text inputs. Default: 'ascii'
     */
    encoding?: BufferEncoding;
    /**
     * A custom error handler.
     */
    errorHandler?: SchemaValidationErrorHandler;
    /**
     * The maximum size of the body, in bytes. Default: 134217728
     */
    limit?: number;
}

/**
 * Custom options for 'withSchema()' function.
 */
export interface IWithSchemaOptions {
    /**
     * The default encoding, using for text inputs. Default: 'utf8'
     */
    encoding?: BufferEncoding;
    /**
     * A custom error handler.
     */
    errorHandler?: SchemaValidationErrorHandler;
    /**
     * The maximum size of the body, in bytes. Default: 134217728
     */
    limit?: number;
    /**
     * One or more custom middlewares, which should be executed BEFORE
     * validation middleware is executed.
     *
     * By default, a matching middleware is trying to be set, based
     * on the schema type.
     */
    use?: RequestHandler | RequestHandler[];
}

/**
 * Describes a custom error handler for 'withValidator()' function.
 *
 * @param {ISchemaValidationErrorHandlerContext} context The execution context.
 */
export type SchemaValidationErrorHandler = (context: ISchemaValidationErrorHandlerContext) => any;

const defaultSchemaValidationErrorHandler: SchemaValidationErrorHandler = ({ response, validation }) => {
    if (!response.headersSent) {
        response.status(400)
            .header('Content-Type', 'text/plain; charset=utf-8');
    }

    return response.send(validation.error!.message);
};

/**
 * Creates middlewares, that parse input as data URI and overwrites
 * props of 'request' object with new 'body' and content type,
 * if valid.
 *
 * @param {IWithDataURLOptions} [options] The custom options.
 *
 * @returns {RequestHandler[]} The new middlewares.
 */
export function withDataURI(options?: IWithDataURLOptions): RequestHandler[] {
    const schema = joi.string().strict().min(1).dataUri().required();

    return [
        ...withSchema(schema, {
            encoding: options?.encoding || 'ascii',
            errorHandler: options?.errorHandler,
            limit: options?.limit
        }),

        (request, response, next) => {
            // data:<MIME>;base64,<BASE64-DATA>
            const dataUri: string = request.body;

            const sep1 = dataUri.indexOf(':');  // data:<MIME>
            const sep2 = dataUri.indexOf(';');  // <MIME>;base64
            const sep3 = dataUri.indexOf(',');  // base64,<BASE64-DATA>

            // extract data
            // and overwrite props
            request.headers['content-type'] = dataUri.substr(sep1 + 1, sep2 - sep1 - 1)
                .toLowerCase() || 'application/octet-stream';
            request.body = Buffer.from(dataUri.substr(sep3 + 1), 'base64');

            return next();
        }
    ];
}

/**
 * Creates a list of middlewares, which are parsing and validation the input body
 * using a schema.
 *
 * @param {joi.AnySchema} schema The schema to use.
 * @param {IWithSchemaOptions} [options] The custom options.
 *
 * @returns {RequestHandler[]} The created middlewares.
 */
export function withSchema(schema: joi.AnySchema, options?: IWithSchemaOptions): RequestHandler[] {
    const errorHandler = options?.errorHandler || defaultSchemaValidationErrorHandler;

    const limit = typeof options?.limit === 'number' ? options.limit : 134217728;

    const handlers: RequestHandler[] = [];

    // add pre-middlewares
    if (options?.use) {
        // custom

        handlers.push(
            ...(Array.isArray(options?.use) ? options?.use : [options?.use])
        );
    } else {
        // default

        switch (schema.type as joi.Types) {
            case 'binary':
                handlers.push(express.raw({
                    limit,
                    type: ''
                }));
                break;

            case 'string':
                handlers.push(express.text({
                    defaultCharset: options?.encoding || 'utf8',
                    limit
                }));
                break;

            case 'object':
            case 'array':
                handlers.push(express.json({
                    limit,
                    strict: true
                }));
                break;
        }
    }

    // the validator itself
    handlers.push(
        (request, response, next) => {
            const validation = schema.validate(request.body);
            if (validation.error) {
                return errorHandler({
                    request: request as Request,
                    response: response as Response,
                    validation
                });
            }

            return next();
        }
    );

    return handlers;
}
