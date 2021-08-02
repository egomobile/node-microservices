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

import { isLocalDev } from '../utils';

/**
 * Sets up Application Insights for that app,
 * if 'APPLICATION_INSIGHTS_KEY' environment variable is defined
 * AND app is not running in local development context.
 */
export function setupApplicationInsights() {
    const APPLICATION_INSIGHTS_KEY = process.env.APPLICATION_INSIGHTS_KEY?.trim();

    if (!isLocalDev() && APPLICATION_INSIGHTS_KEY?.length) {
        const applicationInsights = require('applicationinsights');

        applicationInsights.setup(APPLICATION_INSIGHTS_KEY).start();
    }
}
