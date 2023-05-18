import { SearchKeywords } from "interfaces/models/search_keywords.model.interface";
import { connection, Schema, Document, Types } from "mongoose";
import { vars } from "../constants/vars";

const searchKeywordsSchema: Schema = new Schema(
  {
    keyword: String,
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { collection: "searchKeywords", versionKey: false }
);

const db = connection.useDb(vars.mongoDb);
const searchKeywordsModel = db.model<SearchKeywords>('SearchKeywords', searchKeywordsSchema);


export { searchKeywordsModel };
