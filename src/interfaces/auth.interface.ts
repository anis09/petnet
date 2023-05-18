import { Request } from 'express';

export interface TokenPayload {
    uid: string;
    iat: number;
};

export interface TokenData {
    token: string;
    expiresIn: string;
};

export interface RequestWithUser extends Request {
    user: string;
};