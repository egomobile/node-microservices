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
