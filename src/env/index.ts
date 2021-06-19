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

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * Options for 'loadEnv*()' functions.
 */
export interface ILoadEnvOptions {
    /**
     * The custom list of possible env files.
     * Default: '.env', '.env.local', '.env.tests'
     */
    files?: string[];
}

const fsAsync = fs.promises;

export type EnvVars = Record<string, string>;

const defaultEnvFiles = ['.env', '.env.local', '.env.tests'];

/**
 * Loads environment variable files of a directory into process.env.
 *
 * @param {string} dir The directory, where the env files are stored.
 * @param {ILoadEnvOptions} [options] Custom options.
 *
 * @returns {Promise<EnvVars>} The promise with the loaded environment variables.
 */
export async function loadEnv(dir: string, options?: ILoadEnvOptions): Promise<EnvVars> {
    const files = options?.files || defaultEnvFiles;

    const env: EnvVars = {};

    for (const envFile of files) {
        const fullEnvPath = path.join(dir, envFile);
        if (!fs.existsSync(fullEnvPath)) {
            continue;
        }

        const stat = await fsAsync.stat(fullEnvPath);
        if (!stat.isFile()) {
            continue;
        }

        const envOfFile = dotenv.parse(
            await fsAsync.readFile(fullEnvPath, 'utf8')
        );
        for (const key in envOfFile) {
            env[key] = process.env[key] = envOfFile[key];
        }
    }

    return env;
}

/**
 * Loads environment variable files of a directory into process.env synchronously.
 *
 * @param {string} dir The directory, where the env files are stored.
 * @param {ILoadEnvOptions} [options] Custom options.
 *
 * @returns {EnvVars} The loaded environment variables.
 */
export function loadEnvSync(dir: string, options?: ILoadEnvOptions): EnvVars {
    const files = options?.files || defaultEnvFiles;

    const env: EnvVars = {};

    for (const envFile of files) {
        const fullEnvPath = path.join(dir, envFile);
        if (!fs.existsSync(fullEnvPath)) {
            continue;
        }

        const stat = fs.statSync(fullEnvPath);
        if (!stat.isFile()) {
            continue;
        }

        const envOfFile = dotenv.parse(
            fs.readFileSync(fullEnvPath, 'utf8')
        );
        for (const key in envOfFile) {
            env[key] = process.env[key] = envOfFile[key];
        }
    }

    return env;
}
