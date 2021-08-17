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
 * A cache (client).
 */
export interface ICache {
    /**
     * Removes all entries.
     *
     * @returns {Promise<boolean>} The promise that indicates if operation was successful or not.
     */
    flush(): Promise<boolean>;
    /**
     * Tries to return a value from cache by key.
     *
     * @param {string} key The key.
     * @param {TDefault} [defaultValue] The custom default value.
     *
     * @returns {Promise<TResult|TDefault|undefined>} The promise with the value or the default value.
     */
    get<TResult extends any = any>(key: string): Promise<TResult | undefined>;
    get<TResult, TDefault>(key: string, defaultValue: TDefault): Promise<TResult | TDefault>;
    /**
     * Sets or deletes a value.
     *
     * @param {string} key The key.
     * @param {any} value The (new) value. A value of (null) or (undefined) will delete the value of a key.
     * @param {number|false} [ttl] The time in seconds, the value "lives". (false) indicates that the value does not become invalid and "lives forever".
     *
     * @returns {Promise<boolean>} The promise, that indicates if operation was successful or not.
     */
    set(key: string, value: any, ttl?: number | false): Promise<boolean>;
}
