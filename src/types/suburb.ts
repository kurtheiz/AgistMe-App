export enum LocationType {
    REGION = 'REGION',
    SUBURB = 'SUBURB',
    STATE = 'STATE'
}

export type Suburb = {
    id: string;
    suburb: string;
    postcode: string;
    state: string;
    region: string;
    geohash: string;
    locationType: LocationType;
};

export type SuburbResponse = {
    suburbs: Suburb[];
    count: number;
};
