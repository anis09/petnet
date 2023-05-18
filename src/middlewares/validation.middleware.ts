import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { errors } from "./../constants/errors";

const validationMiddleware = (
  type: any,
  value: string | "body" | "query" | "params" = "body",
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true
): RequestHandler => {
  return function (req: Request, res: Response, next: NextFunction) {
    validate(plainToClass(type, req[value]), {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    }).then((validationErrors: ValidationError[]) => {
      if (validationErrors.length > 0) {
        console.log("Errors", validationErrors[0].children);
        res.status(400).json({
          message: errors.INVALID_REQUEST,
        });
        return;
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
