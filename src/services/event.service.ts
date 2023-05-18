import { CreateEventDto, CreateEventResDto, DeleteEventResDto, UpdateEventDto, UpdateEventReqDto, UpdateEventResDto } from "../dtos/event.dto";
import { eventModel } from "../models/event.model";
import { Event } from "../interfaces/models/event.model.interface";
import { errors } from "../constants/errors";
import { HttpException } from "../middlewares/error.middleware";
export class EventService {
  private events = eventModel;

  public async createEvent(event: CreateEventDto): Promise<Event> {
    let newEvent: Event = await this.events.create(event);
    return newEvent;
  }
  public async getAllEvents(): Promise<Event[]> {
    let events: Event[] = await this.events.find();
    return events;
  }
  public async updateEvent(eventId: string, inputData: UpdateEventReqDto): Promise<UpdateEventResDto> {
    const foundEvent: Event = await this.events.findOne({_id:eventId});
    if (!foundEvent) throw new HttpException(404,errors.EVENT_NOT_FOUND);
  
    const updatedEvent: Event = await this.events.findByIdAndUpdate(
      eventId,
      inputData,
      { new: true }
    );
  
    return {
      success: updatedEvent!= null ? true : false,
    };
  }
  public async deleteEvent(eventId: string): Promise<DeleteEventResDto> {
    const foundEvent: Event = await this.events.findOne({_id:eventId});
    if (!foundEvent) throw new HttpException(404, errors.EVENT_NOT_FOUND);
  
    await this.events.findByIdAndDelete({_id:eventId});
  
    return {
      success: true,
    };
  }
}
