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

const nodeEnvDev = 'development';
const nodeEnvProd = 'production';
const nodeEnvTest = 'test';

/**
 * Custom options for 'readStream()' function.
 */
export interface IReadStreamOptions {
    /**
     * The custom string encoding. Default: 'utf8'
     */
    encoding?: BufferEncoding;
}

/**
 * Checks if NODE_ENV has a value of 'development'.
 *
 * @returns {boolean} Has a value of 'development' or not.
 */
export function isDev(): boolean {
    return isNodeEnv(nodeEnvDev);
}

/**
 * Checks if app runs in Jest environment or not.
 *
 * @returns {boolean} Is running in Jest environment or not.
 */
export function isJest(): boolean {
    return !!process.env.JEST_WORKER_ID?.length;
}

/**
 * Checks if app is running in local development mode or not.
 *
 * @returns {boolean} Runs in local development mode or not.
 */
export function isLocalDev(): boolean {
    return isTruely(process.env.LOCAL_DEVELOPMENT);
}

/**
 * Checks if a value is (null) or (undefined).
 *
 * @param {any} val The value to check.
 *
 * @returns {boolean} Is (null) or (undefined).
 */
export function isNil(val: any): val is (null | undefined) {
    return typeof val === 'undefined' ||
        val === null;
}

/**
 * Checks if NODE_ENV environment variable has a specific value.
 *
 * @param {any} envName The name to check.
 *
 * @returns {boolean} Has the value of envName or not.
 */
export function isNodeEnv(envName: any): boolean {
    let NODE_ENV = toStringSafe(process.env.NODE_ENV).toLowerCase().trim();
    envName = toStringSafe(process.env.NODE_ENV).toLowerCase().trim();

    if (!NODE_ENV.length) {  // set default?
        if (isLocalDev()) {
            NODE_ENV = nodeEnvDev;
        } else {
            NODE_ENV = nodeEnvProd;
        }
    }

    return NODE_ENV === envName;
}

/**
 * Checks if NODE_ENV has a value of 'production'.
 *
 * @returns {boolean} Has a value of 'production' or not.
 */
export function isProd(): boolean {
    return isNodeEnv(nodeEnvProd);
}

/**
 * Checks if NODE_ENV has a value of 'test'.
 *
 * @returns {boolean} Has a value of 'test' or not.
 */
export function isTest(): boolean {
    return isNodeEnv(nodeEnvTest);
}

/**
 * Handles a value as string and checks if it prepresents a (true).
 *
 * @param {any} val The input value.
 *
 * @returns {boolean} Can be handled as (true) value.
 *                    Possible values are: '1', 'true', 'y', 'yes'
 */
export function isTruely(val: any): boolean {
    switch (toStringSafe(val).toLowerCase().trim()) {
        case '1':
        case 'true':
        case 'y':
        case 'yes':
            return true;

        default:
            return false;
    }
}

/**
 * Reads the current content of a stream.
 *
 * @param {NodeJS.ReadableStream} stream The input stream.
 * @param {IReadStreamOptions} options Custom options.
 *
 * @returns {Promise<Buffer>} The promise with the read data.
 */
export async function readStream(stream: NodeJS.ReadableStream, options?: IReadStreamOptions): Promise<Buffer> {
    let data = Buffer.alloc(0);

    for await (const chunk of stream) {
        data = Buffer.concat([
            data,
            Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, options?.encoding || 'utf8')
        ]);
    }

    return data;
}

/**
 * Executes an actions in background.
 *
 * @param {Function} action The action to invoke.
 * @param {any[]} [args] One or more arguments for the action.
 *
 * @returns {Promise<TResult>} The promise with the result of the action.
 */
export function tick<TResult>(
    action: (...args: any[]) => Promise<TResult>,
    ...args: any[]
): Promise<TResult> {
    return new Promise<TResult>((result, reject) => {
        try {
            process.nextTick(() => {
                try {
                    action(...args)
                        .then(result)
                        .catch(reject);
                } catch (ex) {
                    reject(ex);
                }
            });
        } catch (ex) {
            reject(ex);
        }
    });
}

/**
 * Converts a value to a string.
 *
 * @param {any} val The input value.
 *
 * @returns {string} The value as string.
 */
export function toStringSafe(val: any): string {
    if (typeof val === 'string') {
        return val;
    }

    if (!isNil(val)) {
        try {
            if (Buffer.isBuffer(val)) {
                return val.toString('utf8');
            }

            if (typeof val['toString'] === 'function') {
                return String(val.toString());
            }

            return String(val);
        } catch { }
    }

    return '';
}
