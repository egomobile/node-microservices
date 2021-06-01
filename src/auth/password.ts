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

import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../constants';

let bcryptRounds: number | false = false;

/**
 * Checks if a password matching a hash.
 *
 * @param {string} password The unhashed password.
 * @param {string} hash The password hash.
 *
 * @returns {Promise<boolean>} Promise, that indicates if password does match or not.
 */
export function checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Checks (synchronous) if a password matching a hash.
 *
 * @param {string} password The unhashed password.
 * @param {string} hash The password hash.
 *
 * @returns {boolean} Promise, that indicates if password does match or not.
 */
export function checkPasswordSync(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

function getRounds(): number {
    if (!bcryptRounds) {
        const rounds = parseInt(BCRYPT_ROUNDS || '10');

        if (isNaN(rounds) || rounds < 1) {
            throw new Error('BCRYPT_ROUNDS is no valid number');
        }

        bcryptRounds = rounds;
        return rounds;
    }

    return bcryptRounds;
}

/**
 * Hashes a password string.
 *
 * @param {string} password The unhashed password.
 *
 * @returns {Promise<string>} The promise with the password hash.
 */
export function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, getRounds());
}

/**
 * Hashes a password string synchronous.
 *
 * @param {string} password The unhashed password.
 *
 * @returns {string} The password hash.
 */
export function hashPasswordSync(password: string): string {
    return bcrypt.hashSync(password, getRounds());
}
