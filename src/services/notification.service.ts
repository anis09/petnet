import { userModel } from "../models/user.model";
import { CreateNotificationDto } from "../dtos/notification.dto";
import { Notification } from "../interfaces/models/notification.model.interface";
import { notificationModel } from "../models/notification.model";
import mongoose from "mongoose";

export class NotificationService {
  private Notification = notificationModel;

  public async createNotification(
    notificationInfo: CreateNotificationDto
  ): Promise<Notification> {
    let notification = new this.Notification(notificationInfo);
    let notif = await notification.save();
    return notif;
  }
  public async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const notificationList = await this.Notification.find({
      receiverId: userId
    }).populate(
      "senderId",
      "profile.firstName profile.lastName _id",
      userModel
    );

    return notificationList;
  }
  public async getNotificationsByUserV2(
    userId: string
  ): Promise<Notification[]> {
    // const notificationList = await this.Notification.find({
    //   receiverId: userId,
    // })
    // .populate("senderId", "profile.firstName profile.lastName _id", userModel);
    const notificationList = await this.Notification.aggregate([
      {
        $match: { receiverId: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender"
        }
      },
      {
        $unwind: {
          path: "$sender",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          firstName: "$sender.profile.firstName",
          lastName: "$sender.profile.lastName",
          userId: {
            $toString: "$sender._id"
          },
          entityId: "$entityId",
          createdAt: "$createdAt",
          text: "$text",
          type: "$type",
          isReaden: { $cond: [{ $eq: ["$isReaden", true] }, 1, 0] }
        }
      },
      {
        $group: {
          _id: "$entityId",
          count: { $sum: 1 },
          records: { $push: "$$ROOT" },
          timestamp: {
            $last: "$$ROOT.createdAt"
          },
          type: {
            $last: "$$ROOT.type"
          },
          totalReaden: { $sum: "$isReaden" }
        }
      },

      {
        $project: {
          count: "$count",
          records: "$records",
          timestamp: "$timestamp",
          type: "$type",
          isReaden: { $eq: ["$totalReaden", "$count"] },
          totalUnreaden: { $subtract: ["$count", "$totalReaden"] }
        }
      }
    ]);
    return notificationList;
  }
  public async removeNotificationBySender(
    senderId: string,
    receiverId
  ): Promise<void> {
    const notification = await this.Notification.findOneAndRemove({
      senderId: senderId,
      receiverId: receiverId
    });
  }
  public async removeNotificationByReceiverAndPost(
    receiverId: string,
    postId: string
  ): Promise<void> {
    const result = await this.Notification.deleteMany({
      receiverId: receiverId,
      entityId: postId
    });
  }
  public async countNotification(postId: string): Promise<number> {
    const notificationList = await this.Notification.count({
      entityId: postId
    });
    return notificationList;
  }
  public async markAsReaden(postId: string): Promise<any> {
    const result = await this.Notification.updateMany(
      { entityId: postId },
      { $set: { isReaden: true } }
    );
    return result;
  }
  public async markAsReadenMultiple(idList: string[]): Promise<any> {
    const list = idList.map(async (elm) => {
      const result = await this.markAsReaden(elm);
      return result;
    });
    const finalList = await Promise.all(list);
    return finalList;
  }
}
