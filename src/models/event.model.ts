import { connection, Schema, Document, Types } from "mongoose";
import { vars } from "../constants/vars";
import { Event } from "../interfaces/models/event.model.interface";

const eventSchema: Schema = new Schema(
  {
    title: String,
    description: String,
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    start: Date,
    end: Date,
    color: String,
    isAllDay: { type: Boolean },
  },
  { collection: "events", versionKey: false }
);

const db = connection.useDb(vars.mongoDb);
const eventModel = db.model<Event & Document>("Event", eventSchema);

export { eventModel };
