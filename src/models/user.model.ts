import { connection, Schema, Document, Types } from "mongoose";
import { vars } from "./../constants/vars";
import { User } from "./../interfaces/models/user.model.interface";

const userSchema: Schema = new Schema(
  {
    account: {
      kind: String,
      companyId: {
        type: Types.ObjectId,
        ref: "Company",
      },
      activationStatus: String,
      isVerified: Boolean,
      verificationCode: String,
      verificationExpireAt: Date,
      registrationMethod: String,
      providerId: String,
      email: String,
      password: String,
      passwordRecoveryToken: String,
      passwordRecoveryExpireAt: Date,
      passwordRecoveredAt: Date,
      lastSignIn: Date,
      lastSignOut: Date,
    },
    profile: {
      firstName: String,
      lastName: String,
      phone: String,
      state: String,
      suburb: String,
      address: String,
      zipCode: Number,
      bio: String,
      avatarUrl: String,
    },
    preferences: {
      notificationsIsAllowed: Boolean,
      notifications: {
        likesIsEnabled: Boolean,
        followsIsEnabled: Boolean,
        messagesIsEnabled: Boolean,
      },
      emailsIsAllowed: Boolean,
      emails: {
        updatesIsEnabled: Boolean,
        featuredOffersIsEnabled: Boolean,
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    deviceId: { type: String, default: "" },
  },
  { collection: "users", timestamps: true, versionKey: false }
);

const db = connection.useDb(vars.mongoDb);
const userModel = db.model<User & Document>("User", userSchema);

export { userModel };
