import { connection, Schema, Document, Types } from "mongoose";
import { vars } from "../constants/vars";
import { KanbanCard } from "../interfaces/models/kanban_card.model.interface";

const kanbanCardSchema: Schema = new Schema(
  {
    kanbanColumnId: {
      type: Types.ObjectId,
      ref: "KanbanColumn"
    },
    name: String,
    description: String,
    attachments: [String],
    assignee: [{ type: Types.ObjectId, ref: "User" }],
    reporter: [{ type: Types.ObjectId, ref: "User" }],
    priority: String,
    due: [Number],
    isCompleted: Boolean,
    comments: [
      {
        avatar: String,
        name: String,
        messageType: String,
        message: String,
        postedBy: {
          type: Types.ObjectId,
          ref: "User"
        },
        createdAt: Date
      }
    ]
  },
  { collection: "kanban-cards", timestamps: true, versionKey: false }
);

const db = connection.useDb(vars.mongoDb);
const kanbanCardModel = db.model<KanbanCard & Document>(
  "KanbanCard",
  kanbanCardSchema
);

export { kanbanCardModel };
