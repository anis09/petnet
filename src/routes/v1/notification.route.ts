import NotificationController from "../../controllers/notification.controller";
import { Router } from "express";
import { Routes } from "../../interfaces/routes.interface";
import authMiddleware from "../../middlewares/auth.middleware";

class NotificationRouteV1 implements Routes {
  public path = "/api/v1/notifications";
  public adminPath = "/api/v1/admin/notifications";
  public router = Router();
  public notificationController = new NotificationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.notificationController.getNotificationByUser
    );
    this.router.get(
      `${this.adminPath}`,
      authMiddleware,
      this.notificationController.getNotificationByUser
    );
    this.router.get(
      `${this.path}/v2`,
      authMiddleware,
      this.notificationController.getNotificationByUserV2
    );
    this.router.get(
      `${this.adminPath}/v2`,
      authMiddleware,
      this.notificationController.getNotificationByUserV2
    );
    this.router.put(
      `${this.path}`,
      authMiddleware,
      this.notificationController.markNotificationAsReaden
    );
    this.router.put(
      `${this.adminPath}`,
      authMiddleware,
      this.notificationController.markNotificationAsReaden
    );
    this.router.put(
      `${this.adminPath}-multi`,
      authMiddleware,
      this.notificationController.markNotificationAsReadenMultiple
    );
  }
}

export default NotificationRouteV1;
