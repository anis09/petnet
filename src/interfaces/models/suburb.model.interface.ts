export interface Suburb {
    _id: string;
    name: string;
    postcode: number;
    state: {
        name: string;
        abbreviation: string;
    };
    locality: string;
    location: {
        type: string;
        coordinates: number[];
    };
};