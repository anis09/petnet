import { connection, Schema, Document, Types } from "mongoose";
import { vars } from '../constants/vars';
import { Message } from '../interfaces/models/message.model.interface';

const messageSchema: Schema = new Schema({
    conversationId: {
        type: Types.ObjectId,
        ref: 'Conversation'
    },
    senderId: {
        type: Types.ObjectId,
        ref: 'User'
    },
    messageType: String,
    body: String,
    sentAt: Date,
    seenAt: Date
}, { collection: 'messages', versionKey: false });

const db = connection.useDb(vars.mongoDb);
const messageModel = db.model<Message & Document>('Message', messageSchema);

export { messageModel };