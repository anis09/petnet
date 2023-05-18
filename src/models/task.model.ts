import { connection, Schema, Document, Types } from "mongoose";
import { vars } from '../constants/vars';
import { Task } from '../interfaces/models/task.model.interface';

const taskSchema: Schema = new Schema({
    status: String,
    name: String,
    description: String,
    attachments: {
        type: Array,
        items: {
            url: String,
        }
    },
    assignee: {
        type: Types.ObjectId,
        ref: "User",
    },
    reporter: {
        type: Types.ObjectId,
        ref: "User",
    },
    priority: String,
    dueDate: Date,
    comments: [
        {
            commentType: String,
            body: String,
            postedBy: {
                type: Types.ObjectId,
                ref: "User",
            },
            postedAt: Date
        }
    ]
}, { collection: 'tasks', timestamps: true, versionKey: false });

const db = connection.useDb(vars.mongoDb);
const taskModel = db.model<Task & Document>('Task', taskSchema);

export { taskModel };