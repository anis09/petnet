import { connection, Schema, Document, Types } from "mongoose";
import { vars } from '../constants/vars';
import { KanbanColumn } from '../interfaces/models/kanban_column.model.interface';

const kanbanColumnSchema: Schema = new Schema({
    name: String,
    position: Number
}, { collection: 'kanban-columns', timestamps: true, versionKey: false });

const db = connection.useDb(vars.mongoDb);
const kanbanColumnModel = db.model<KanbanColumn & Document>('KanbanColumn', kanbanColumnSchema);

export { kanbanColumnModel };