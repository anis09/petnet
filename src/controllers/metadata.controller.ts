import { NextFunction, Request, Response } from "express";
import { GetSuburbsByStateReqDto, GetSuburbsReqDto, GetSuburbsResByStateDto, GetSuburbsResDto } from "../dtos/metadata.dto";
import MetadataService from "../services/metadata.service";

class AuthController {
  private metadataService = new MetadataService();

  public getSuburbs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: GetSuburbsReqDto = req.query as any;
      const outputData: GetSuburbsResDto =
        await this.metadataService.getSuburbs(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getStateList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outPutData: string[] = await this.metadataService.getStates();
      res.status(200).json(outPutData);
    } catch (error) {
      next(error);
    }
  };
  public getSuburbsByState = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: GetSuburbsByStateReqDto = req.body as any;
      const outputData: GetSuburbsResDto =
        await this.metadataService.getSuburbsByState(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
