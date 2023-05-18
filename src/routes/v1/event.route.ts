import EventController from "../../controllers/event.controller";
import { Router } from "express";
import { Routes } from "../../interfaces/routes.interface";
import authMiddleware from "../../middlewares/auth.middleware";

class EventRouteV1 implements Routes {
  public path = "/api/v1/admin/events";
  public router = Router();
  public eventController = new EventController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.eventController.getAllEvents
    );
    this.router.post(
      `${this.path}`,
      authMiddleware,
      this.eventController.createEvent
    );
    this.router.put(
      `${this.path}/:eventId`,
      authMiddleware,
      this.eventController.updateEvent
    );
    this.router.delete(
      `${this.path}/:eventId`,
      authMiddleware,
      this.eventController.deleteEvent
    )
  }
}

export default EventRouteV1;
