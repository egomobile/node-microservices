import { Nilable } from '@egomobile/types';
import express from 'express';

declare module 'express' {
    export interface Request {
        /**
         * The user token.
         */
        userToken: any;
    }
}