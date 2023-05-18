import { Request } from 'express';

export interface RequestWithFile extends Request {
    files: [
        {
            filename: string;
            path: string;
            mimetype: string;
        }
    ]
};