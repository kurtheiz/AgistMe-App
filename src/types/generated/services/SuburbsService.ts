/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SuburbResponse } from '../models/SuburbResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SuburbsService {
    /**
     * Search Suburbs
     * Search suburbs with typeahead functionality
     *
     * Args:
     * q (str): Search query (minimum 2 characters)
     * limit (int): Maximum number of results (1-50, default 10)
     * regions (bool): Whether to include regions in the search results (default True)
     * @param q Search query
     * @param limit Maximum number of results
     * @param regions Whether to include regions in the search results
     * @returns SuburbResponse Successful Response
     * @throws ApiError
     */
    public static searchSuburbsV1SuburbsSearchGet(
        q: string,
        limit: number = 10,
        regions: boolean = true,
    ): CancelablePromise<SuburbResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/suburbs/search',
            query: {
                'q': q,
                'limit': limit,
                'regions': regions,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
