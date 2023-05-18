import { connection, Schema, Document, Types } from "mongoose";
import { vars } from "../constants/vars";
import { Post } from "../interfaces/models/post.model.interface";

const postSchema: Schema = new Schema(
  {
    kind: String,
    title: String,
    description: String,
    price: Number,
    adoptionFee: Number,
    pet: {
      petType: String,
      microshipId: String,
      name: String,
      breed: String,
      dadBreed: String,
      momBreed: String,
      sex: String,
      isDesexed: Boolean,
      age: String,
      size: String,
      veterinaryChecked: Boolean,
      isVaccinated: Boolean,
      coatLength: String,
      color: String,
      isInShelter: Boolean,
      care: String,
      expectedAdultSize: String,
      goodWith: String,
    },
    location: {
      state: String,
      suburb: String,
    },
    images: {
      type: Array,
      items: {
        url: String,
      },
    },
    childImages: {
      type: Array,
      items: {
        url: String,
      },
    },
    parentImages: {
      type: Array,
      items: {
        url: String,
      },
    },
    postedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { collection: "posts", versionKey: false, timestamps: true }
);

const db = connection.useDb(vars.mongoDb);
const postModel = db.model<Post & Document>("Post", postSchema);

export { postModel };
