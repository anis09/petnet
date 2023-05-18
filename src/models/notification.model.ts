import { connection, Schema, Document, Types } from "mongoose";
import { vars } from "../constants/vars";
import { Notification } from "../interfaces/models/notification.model.interface";

const notificationSchema: Schema = new Schema(
  {
    receiverId: {
      type: Types.ObjectId,
      ref: "User",
    },
    senderId: {
      type: Types.ObjectId,
      ref: "User",
    },
    text: String,
    type: String,
    entityId: String,
    createdAt: Date,
    isReaden: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "notifications", versionKey: false }
);

const db = connection.useDb(vars.mongoDb);
const notificationModel = db.model<Notification & Document>(
  "Notification",
  notificationSchema
);

export { notificationModel };
