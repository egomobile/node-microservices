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

import { Express, RequestHandler } from 'express';
import { PassportStatic } from 'passport';
import { IBearerStrategyOptionWithRequest } from 'passport-azure-ad';
import { AZURE_AD_AUDIENCE, AZURE_AD_CLIENT_ID, AZURE_AD_IDENTITY_METADATA, AZURE_AD_IS_B2C, AZURE_AD_LOGGING_LEVEL, AZURE_AD_PASS_REQ_TO_CALLBACK, AZURE_AD_POLICY_NAME, AZURE_AD_VALIDATE_ISSUER } from '../constants';

/**
 * Result of a 'setupForAzureAD' function call.
 */
export interface ISetupForAzureADResult {
    /**
     * Creates a request handler, which requires a valie Azure AD Bearer token.
     */
    withAzureADBearer: () => RequestHandler;
}

/**
 * Sets up an Express instance for use with Azure AD.
 *
 * @param {Express} app The underlying Express instance.
 *
 * @returns {ISetupForAzureADResult} The result.
 */
export function setupAppForAzureAD(app: Express): ISetupForAzureADResult {
    if (!AZURE_AD_IDENTITY_METADATA?.length) {
        throw new Error('No AZURE_AD_IDENTITY_METADATA defined');
    }

    if (!AZURE_AD_CLIENT_ID?.length) {
        throw new Error('No AZURE_AD_CLIENT_ID defined');
    }

    const passport: PassportStatic = require('passport-azure-ad');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { BearerStrategy } = require('passport-azure-ad');

    const config: IBearerStrategyOptionWithRequest = {
        identityMetadata: AZURE_AD_IDENTITY_METADATA,
        clientID: AZURE_AD_CLIENT_ID,
        audience: AZURE_AD_AUDIENCE,
        policyName: AZURE_AD_POLICY_NAME,
        isB2C: AZURE_AD_IS_B2C === 'true',
        validateIssuer: AZURE_AD_VALIDATE_ISSUER === 'true',
        loggingLevel: AZURE_AD_LOGGING_LEVEL as any || 'info',
        passReqToCallback: AZURE_AD_PASS_REQ_TO_CALLBACK === 'true'
    };

    const strategy = new BearerStrategy(config, (token: any, done: any) => {
        // send user info using the second argument
        done(null, {}, token);
    });

    app.use(passport.initialize());
    passport.use(strategy);

    return {
        withAzureADBearer: () => passport.authenticate('oauth-bearer', { session: false })
    };
}
