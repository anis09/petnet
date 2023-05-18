import { MarkNotificationAsReadenDto } from "../dtos/notification.dto";
import { NextFunction, Request, Response } from "express";
import { EventService } from "../services/event.service";
import { RequestWithUser } from "../interfaces/auth.interface";
import { Notification } from "../interfaces/models/notification.model.interface";
import { Event } from "../interfaces/models/event.model.interface";
import { CreateEventDto, DeleteEventResDto, UpdateEventDto, UpdateEventReqDto, UpdateEventResDto } from "../dtos/event.dto";
class EventController {
  private eventService = new EventService();
  public getAllEvents = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const events: Event[] = await this.eventService.getAllEvents();
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  };
  public createEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqInputData: CreateEventDto = req.body as any;
      const { user } = req;
      reqInputData.createdBy = user;
      const event: Event = await this.eventService.createEvent(reqInputData);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  };
  public updateEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { eventId } = req.params as any;
      const inputData: UpdateEventReqDto = req.body;
      const outputData: UpdateEventResDto = await this.eventService.updateEvent(
        eventId,
        inputData
      );
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  
  public deleteEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { eventId} = req.params as any;
      const outputData: DeleteEventResDto = await this.eventService.deleteEvent(
        eventId
        
      );
  
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  
}

export default EventController;
