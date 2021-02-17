/**
 * This file is part of the @egodigital/microservices distribution.
 * Copyright (c) e.GO Digital GmbH, Aachen, Germany (https://www.e-go-digital.com/)
 *
 * @egodigital/microservices is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * @egodigital/microservices is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * The secret for signing and validating JWT.
 */
export const JWT_SECRET = process.env.JWT_SECRET?.trim();

/**
 * The name of the cluster, that contains this and the other microservices.
 */
export const NATS_CLUSTER_ID = process.env.NATS_CLUSTER_ID?.trim();

/**
 * The name of the pod group / kubernetes deployment.
 */
export const NATS_GROUP = process.env.NATS_GROUP?.trim();

/**
 * The URL to the NATS server.
 */
export const NATS_URL = process.env.NATS_URL?.trim();

/**
 * The name of the POD, which is used as client ID for NATS, e.g.
 */
export const POD_NAME = process.env.POD_NAME?.trim();