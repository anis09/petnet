import { NextFunction, Request, Response } from "express";
import { logger } from "./../utils/logger";
import { errors } from "./../constants/errors";

export class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || errors.SOMETHING_WENT_WRONG;
    console.log("Error", error);
    logger.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
    );
    res
      .status(status)
      .json({ message: status >= 500 ? errors.SOMETHING_WENT_WRONG : message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
