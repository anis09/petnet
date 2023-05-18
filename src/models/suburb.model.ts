import { connection, Schema, Document } from 'mongoose';
import { vars } from '../constants/vars';
import { Suburb } from '../interfaces/models/suburb.model.interface';

const suburbSchema: Schema = new Schema({
    name: String,
    postcode: Number,
    state: {
        name: String,
        abbreviation: String
    },
    locality: String,
    location: {
        type: String,
        coordinates: [Number]
    }
}, { collection: 'suburbs', versionKey: false });

const db = connection.useDb(vars.mongoDb);
const suburbModel = db.model<Suburb & Document>('Suburb', suburbSchema);

export { suburbModel };