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

import axios from 'axios';
import { Express, RequestHandler } from 'express';
import { PassportStatic } from 'passport';
import { IBearerStrategyOptionWithRequest } from 'passport-azure-ad';
import { RequestError } from '../errors/requestError';

/**
 * An object of a current user in Microsoft Graph API.
 *
 * @see https://docs.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
 */
export interface IMicrosoftMe {
    businessPhones?: string[];
    displayName?: string;
    givenName?: string;
    id: string;
    jobTitle?: string;
    mail?: string;
    mobilePhone?: string;
    officeLocation?: string;
    preferredLanguage?: string;
    surname?: string;
    userPrincipalName: string;
}

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
 * Returns information about the current user, using an access token.
 *
 * @param {string} accessToken The access token.
 *
 * @returns {Promise<IMicrosoftMe>} The promise with the access token.
 */
export async function getMicrosoftMe(accessToken: string): Promise<IMicrosoftMe> {
    try {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.status !== 200) {
            throw new RequestError(response, `Unexpected response ${response.status}`);
        }

        return response.data;
    } catch (ex) {
        throw new RequestError(ex, ex.message);
    }
}

/**
 * Sets up an Express instance for use with Azure AD.
 *
 * @param {Express} app The underlying Express instance.
 *
 * @returns {ISetupForAzureADResult} The result.
 */
export function setupAppForAzureAD(app: Express): ISetupForAzureADResult {
    const AZURE_AD_AUDIENCE = process.env.AZURE_AD_AUDIENCE?.trim();
    const AZURE_AD_CLIENT_ID = process.env.AZURE_AD_CLIENT_ID?.trim();
    const AZURE_AD_IDENTITY_METADATA = process.env.AZURE_AD_IDENTITY_METADATA?.trim();
    const AZURE_AD_IS_B2C = process.env.AZURE_AD_IS_B2C?.toLowerCase().trim();
    const AZURE_AD_LOGGING_LEVEL = process.env.AZURE_AD_LOGGING_LEVEL?.toLowerCase().trim();
    const AZURE_AD_PASS_REQ_TO_CALLBACK = process.env.AZURE_AD_PASS_REQ_TO_CALLBACK?.toLowerCase().trim();
    const AZURE_AD_POLICY_NAME = process.env.AZURE_AD_POLICY_NAME?.trim();
    const AZURE_AD_VALIDATE_ISSUER = process.env.AZURE_AD_VALIDATE_ISSUER?.toLowerCase().trim();

    if (!AZURE_AD_IDENTITY_METADATA?.length) {
        throw new Error('No AZURE_AD_IDENTITY_METADATA defined');
    }

    if (!AZURE_AD_CLIENT_ID?.length) {
        throw new Error('No AZURE_AD_CLIENT_ID defined');
    }

    const passport: PassportStatic = require('passport');
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

/**
 * Tries to return information about the current user, using an access token.
 *
 * @param {string} accessToken The access token.
 *
 * @returns {Promise<IMicrosoftMe | false>} The promise with the access token or (false) if not possible.
 */
export async function tryGetMicrosoftMe(accessToken: string): Promise<IMicrosoftMe | false> {
    try {
        return await getMicrosoftMe(accessToken);
    } catch {
        return false;
    }
}
