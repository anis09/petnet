import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ActivationStatus } from './../constants/enums';
import { errors } from './../constants/errors';
import { vars } from './../constants/vars';
import { RequestWithUser, TokenPayload } from './../interfaces/auth.interface';
import { HttpException } from './error.middleware';
import { userModel } from './../models/user.model';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
        if (token) {
            const payload = (await verify(token, vars.jwtSecretKey)) as TokenPayload;
            const foundUser = await userModel.findById(payload.uid);

            if (foundUser) {
                if (foundUser.account.activationStatus === ActivationStatus.Inactive) {
                    next(new HttpException(409, errors.INACTIVE_ACCOUNT));
                }

                if (foundUser.account.activationStatus === ActivationStatus.Suspended) {
                    next(new HttpException(409, errors.ACCOUNT_HAS_BEEN_SUSPENDED));
                }

                if (foundUser.account.passwordRecoveredAt) {
                    if (payload.iat < Math.floor(foundUser.account.passwordRecoveredAt.getTime() / 1000)) {
                        next(new HttpException(401, errors.WRONG_AUTHENTICATION));
                    }
                }

                if (foundUser.account.lastSignOut) {
                    if (payload.iat < Math.floor(foundUser.account.lastSignOut.getTime() / 1000)) {
                        next(new HttpException(401, errors.WRONG_AUTHENTICATION));
                    }
                }

                req.user = foundUser._id;
                next();
            } else {
                next(new HttpException(401, errors.WRONG_AUTHENTICATION));
            }
        } 
        else {
            next();
            //next(new HttpException(401, errors.WRONG_AUTHENTICATION));
        }
    } catch (error) {
        next(new HttpException(401, errors.WRONG_AUTHENTICATION));
    }
}

export default authMiddleware;