import { NextFunction, Request, Response } from "express";
import { GetSessionsByDefaultChannelGroupResDto, GetSessionsByDeviceBrandResDto, GetSessionsByDeviceCategoryResDto, GetSessionsByLast7DaysResDto, GetSessionsByOperatingSystemResDto, GetSessionsByPlatformResDto, GetSessionsByRegionResDto } from "../dtos/ga.dto";
import GoogleAnalyticsService from "../services/ga.service";

class GoogleAnalyticsController {
  private googleAnalyticsService = new GoogleAnalyticsService();

  public getSessionsByPlatform = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetSessionsByPlatformResDto = await this.googleAnalyticsService.getSessionsByPlatform();

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getSessionsByDeviceCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetSessionsByDeviceCategoryResDto = await this.googleAnalyticsService.getSessionsByDeviceCategory();

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getSessionsByRegion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetSessionsByRegionResDto = await this.googleAnalyticsService.getSessionsByRegion();

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getSessionsByLast7Days = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetSessionsByLast7DaysResDto = await this.googleAnalyticsService.getSessionsByLast7Days();

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getSessionsByDefaultChannelGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetSessionsByDefaultChannelGroupResDto = await this.googleAnalyticsService.getSessionsByDefaultChannelGroup();

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getSessionsByOperatingSystem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetSessionsByOperatingSystemResDto = await this.googleAnalyticsService.getSessionsByOperatingSystem();

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getSessionsByDeviceBrand = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetSessionsByDeviceBrandResDto = await this.googleAnalyticsService.getSessionsByDeviceBrand();

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
}

export default GoogleAnalyticsController;
