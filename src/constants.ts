/* eslint-disable @typescript-eslint/naming-convention */
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
 * Application Insights key.
 */
export const APPLICATION_INSIGHTS_KEY = process.env.APPLICATION_INSIGHTS_KEY?.trim();

// Azure AD settings
export const AZURE_AD_AUDIENCE = process.env.AZURE_AD_AUDIENCE?.trim();
export const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID?.trim();
export const AZURE_AD_IDENTITY_METADATA = process.env.AZURE_AD_IDENTITY_METADATA?.trim();
export const AZURE_AD_IS_B2C = process.env.AZURE_AD_IS_B2C?.toLowerCase().trim();
export const AZURE_AD_LOGGING_LEVEL = process.env.AZURE_AD_LOGGING_LEVEL?.toLowerCase().trim();
export const AZURE_AD_PASS_REQ_TO_CALLBACK = process.env.AZURE_AD_PASS_REQ_TO_CALLBACK?.toLowerCase().trim();
export const AZURE_AD_POLICY_NAME = process.env.AZURE_AD_POLICY_NAME?.trim();
export const AZURE_AD_VALIDATE_ISSUER = process.env.AZURE_AD_VALIDATE_ISSUER?.toLowerCase().trim();

/**
 * The number of rounds for bcrypt hashing.
 */
export const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS?.trim();

/**
 * The secret for signing and validating JWT.
 */
export const JWT_SECRET = process.env.JWT_SECRET?.trim();

/**
 * Indicates if app currently running under local development or not.
 */
export const LOCAL_DEVELOPMENT = process.env.LOCAL_DEVELOPMENT?.toLowerCase().trim();

/**
 * The log level.
 */
export const LOG_LEVEL = process.env.LOG_LEVEL?.toLowerCase().trim();

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
