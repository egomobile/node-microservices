/* eslint-disable spaced-comment */

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

/// <reference path="../index.d.ts" />

import joi from 'joi';

export * from './api';
export * from './auth';
export * from './cache';
export * from './constants';
export * from './db';
export * from './diagnostics';
export * from './env';
export * from './errors';
export * from './express';
export * from './mail';
export * from './nats';
export * from './storage';
export * from './utils';

/**
 * Namespace / link to 'joi' module, used by that library.
 */
export const schema = joi;
