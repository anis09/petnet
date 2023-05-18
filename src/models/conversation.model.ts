import { connection, Schema, Document, Types } from "mongoose";
import { vars } from "../constants/vars";
import { Conversation } from "../interfaces/models/conversation.model.interface";

const conversationSchema: Schema = new Schema(
  {
    members: {
      type: Array,
      items: {
        type: Types.ObjectId,
        ref: 'User'
      }
    }
  },
  { collection: "conversations", versionKey: false }
);

const db = connection.useDb(vars.mongoDb);
const conversationModel = db.model<Conversation & Document>("Conversation", conversationSchema);

export { conversationModel };
