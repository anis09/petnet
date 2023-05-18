import {
  MarkNotificationAsReadenDto,
  MarkNotificationAsReadenMultipleDto
} from "../dtos/notification.dto";
import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../interfaces/auth.interface";
import { Notification } from "../interfaces/models/notification.model.interface";
import { NotificationService } from "../services/notification.service";

class NotificationController {
  private notificationService = new NotificationService();
  public getNotificationByUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { user } = req;
      const outputData: Notification[] =
        await this.notificationService.getNotificationsByUser(user);
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getNotificationByUserV2 = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { user } = req;
      const outputData: Notification[] =
        await this.notificationService.getNotificationsByUserV2(user);
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public markNotificationAsReaden = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: MarkNotificationAsReadenDto = req.body as any;
      const { postId } = inputData;
      const outputData: Notification =
        await this.notificationService.markAsReaden(postId);
      res.status(200).json({
        success: true
      });
    } catch (error) {
      next(error);
    }
  };
  public markNotificationAsReadenMultiple = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: MarkNotificationAsReadenMultipleDto = req.body as any;
      const { entityList } = inputData;
      const outputData: Notification =
        await this.notificationService.markAsReadenMultiple(entityList);
      res.status(200).json({
        success: true
      });
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationController;
