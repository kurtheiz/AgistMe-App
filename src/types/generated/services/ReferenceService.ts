/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferenceData } from '../models/ReferenceData';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReferenceService {
    /**
     * Get Reference Data
     * Get reference data including pricing plans and features
     * @returns ReferenceData Successful Response
     * @throws ApiError
     */
    public static getReferenceDataV1ReferenceDataGet(): CancelablePromise<ReferenceData> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rd',
        });
    }
}
