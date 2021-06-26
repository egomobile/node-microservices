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
 * List of possible values for API error descriptions.
 */
export type ApiErrors = string | string[];

/**
 * An API result.
 */
export interface IApiResult<T extends any = any> {
    /**
     * The data.
     */
    data?: T;
    /**
     * One or more errors.
     */
    errors?: ApiErrors | null;
    /**
     * Api call was successful or not.
     */
    success: boolean;
}

/**
 * Factory for IApiResult<T> interface.
 */
export class ApiResult<T extends any = any> implements IApiResult<T> {
    private constructor(success: boolean, data?: T, errors?: ApiErrors | null) {
        this.success = success;
        this.data = data;
        this.errors = errors;
    }

    /**
     * @inheritdoc
     */
    public data?: T;
    /**
     * @inheritdoc
     */
    public errors?: ApiErrors | null;
    /**
     * @inheritdoc
     */
    public success: boolean;

    /**
     * Creates a new instance with 'success = false',
     *
     * @param {ApiErrors|null} errors One or more errors (if defined).
     * @param {T} [data] The optional data.
     *
     * @returns {ApiResult<T>} The new instance.
     */
    public static failed<T>(errors: ApiErrors | null, data?: T): ApiResult<T> {
        return new ApiResult<T>(false, data, errors);
    }

    /**
     * Creates a new instance with 'success = false',
     *
     * @param {T} [data] The optional data.
     *
     * @returns {ApiResult<T>} The new instance.
     */
    public static success<T>(data?: T): ApiResult<T> {
        return new ApiResult<T>(true, data);
    }

    /**
     * @inheritdoc
     */
    public toJSON(): any {
        return {
            success: this.success,
            data: this.data,
            errors: this.errors
        };
    }
}
