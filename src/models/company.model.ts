import { connection, Schema, Document } from 'mongoose';
import { vars } from '../constants/vars';
import { Company } from '../interfaces/models/company.model.interface';

const companySchema: Schema = new Schema({
    name: String,
    breederPrefix: String,
    email: String,
    phone: String,
    state: String,
    suburb: String,
    address: String,
    zipCode: Number,
    bio: String,
    website: String,
    logo: String,
    cover: String
}, { collection: 'companies', versionKey: false });

const db = connection.useDb(vars.mongoDb);
const companyModel = db.model<Company & Document>('Company', companySchema);

export { companyModel };