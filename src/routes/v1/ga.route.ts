import { Router } from "express";
import { Routes } from "../../interfaces/routes.interface";
import authMiddleware from "../../middlewares/auth.middleware";
import GoogleAnalyticsController from "../../controllers/ga.controller";

class GoogleAnalyticsRouteV1 implements Routes {
  public adminPath = "/api/v1/admin/ga";
  public router = Router();
  public googleAnalyticsController = new GoogleAnalyticsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.adminPath}/sessions-platform`,
      authMiddleware,
      this.googleAnalyticsController.getSessionsByPlatform
    );
    this.router.get(
      `${this.adminPath}/sessions-device-category`,
      authMiddleware,
      this.googleAnalyticsController.getSessionsByDeviceCategory
    );
    this.router.get(
      `${this.adminPath}/sessions-region`,
      authMiddleware,
      this.googleAnalyticsController.getSessionsByRegion
    );
    this.router.get(
      `${this.adminPath}/sessions-last-7-days`,
      authMiddleware,
      this.googleAnalyticsController.getSessionsByLast7Days
    );
    this.router.get(
      `${this.adminPath}/sessions-default-channel-group`,
      authMiddleware,
      this.googleAnalyticsController.getSessionsByDefaultChannelGroup
    );
    this.router.get(
      `${this.adminPath}/sessions-os`,
      authMiddleware,
      this.googleAnalyticsController.getSessionsByOperatingSystem
    );
    this.router.get(
      `${this.adminPath}/sessions-device-brand`,
      authMiddleware,
      this.googleAnalyticsController.getSessionsByDeviceBrand
    );
  }
}

export default GoogleAnalyticsRouteV1;