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

import { createLogger as createWinstonLogger, format, LeveledLogMethod, Logger, transports } from 'winston';
import { isTruely } from '../utils';

/**
 * A log function.
 *
 * The function itself logs DEBUG message.
 */
export interface ILogFunc extends LeveledLogMethod {
    /**
     * Logs errors.
     */
    error: LogFuncAction;
    /**
     * Logs infos.
     */
    info: LogFuncAction;
    /**
     * Logs verbose.
     */
    verbose: LogFuncAction;
    /**
     * Logs warning.
     */
    warn: LogFuncAction;
}

/**
 * A log action.
 *
 * @param {string} message The message.
 * @param {any[]} [meta] One or more meta data.
 *
 * @returns {ILogFunc} The new function.
 */
export type LogFuncAction = (message: string, ...meta: any[]) => ILogFunc;

/**
 * Creates a new logger function.
 *
 * @param {Logger} l The custom base logger.
 *
 * @returns {ILogFunc} The new function.
 */
export function createLogFunc(l: Logger): ILogFunc {
    const func: ILogFunc = (function (message: string, ...meta: any[]) {
        l.debug(message, ...meta);
        return func;
    }) as any;

    func.error = (message: string, ...meta: any[]) => {
        l.error(message, ...meta);
        return func;
    };

    func.info = (message: string, ...meta: any[]) => {
        l.info(message, ...meta);
        return func;
    };

    func.verbose = (message: string, ...meta: any[]) => {
        l.verbose(message, ...meta);
        return func;
    };

    func.warn = (message: string, ...meta: any[]) => {
        l.warn(message, ...meta);
        return func;
    };

    return func;
}

/**
 * Creates a new logger instance.
 *
 * @returns {Logger} The new instance.
 */
export function createLogger(): Logger {
    const LOG_LEVEL = process.env.LOG_LEVEL?.toLowerCase().trim();

    return createWinstonLogger({
        level: LOG_LEVEL ||
            (isTruely(process.env.LOCAL_DEVELOPMENT) ? 'debug' : 'info')
    });
}

// the global logger
export const logger = createLogger();

// logger outputs
{
    // console output
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

/**
 * The global log function.
 */
export const log = createLogFunc(logger);
