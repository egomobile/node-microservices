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

import { createLogger as createWinstonLogger, format, Logger, transports } from 'winston';
import { LOCAL_DEVELOPMENT } from '../constants';

/**
 * Creates a new logger instance.
 *
 * @returns {Logger} The new instance.
 */
export function createLogger(): Logger {
    return createWinstonLogger();
}

// the global logger
export const logger = createLogger();

if (LOCAL_DEVELOPMENT === 'true') {
    // console output
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}
