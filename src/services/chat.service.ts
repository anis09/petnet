import mongoose from "mongoose";
import {
  ConversationDto,
  ConversationMemberDto,
  GetConversationsResDto,
  GetConversationUserResDto,
  GetMessagesResDto,
  MessageAggDto,
  MessageDto,
  MessageLimitDto,
  SendMessageReqDto,
  SendMessageResDto,
} from "../dtos/chat.dto";
import { errors } from "../constants/errors";
import { Conversation } from "../interfaces/models/conversation.model.interface";
import { Message } from "../interfaces/models/message.model.interface";
import { HttpException } from "../middlewares/error.middleware";
import { conversationModel } from "../models/conversation.model";
import { messageModel } from "../models/message.model";
import { userModel } from "../models/user.model";

import { NotificationService } from "./notification.service";
import { NotificationType } from "../constants/enums";
import io, { getUser } from "../utils/socket";
import { MobileNotificationDto } from "dtos/notification.dto";
import FirebaseService from "./firebase.service";
import { User } from "interfaces/models/user.model.interface";

class ChatService {
  private conversations = conversationModel;
  private messages = messageModel;
  private users = userModel;
  private notification: NotificationService;
  private firebase: FirebaseService;

  constructor() {
    this.notification = new NotificationService();
    this.firebase = new FirebaseService();
  }

  public async sendMessage(
    userId: string,
    input: SendMessageReqDto
  ): Promise<SendMessageResDto> {
    if (userId === input.receiverId)
      throw new HttpException(400, errors.INVALID_REQUEST);

    const foundUser: User = await this.users.findOne({
      _id: input.receiverId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    let success: boolean = false;

    const foundConversation: Conversation = await this.conversations.findOne({
      members: {
        $all: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(input.receiverId),
        ],
      },
    });

    let conversationId: mongoose.Types.ObjectId;

    if (!foundConversation) {
      conversationId = new mongoose.Types.ObjectId();
      const createdConversation: Conversation = await this.conversations.create(
        {
          _id: conversationId,
          members: [
            new mongoose.Types.ObjectId(userId),
            new mongoose.Types.ObjectId(input.receiverId),
          ],
        }
      );

      const createdMessage: Message = await this.messages.create({
        conversationId,
        senderId: new mongoose.Types.ObjectId(userId),
        messageType: input.messageType,
        body: input.body,
        sentAt: new Date(),
        seenAt: null,
      });

      if (createdConversation !== null && createdMessage !== null) {
        success = true;
      }
    } else {
      conversationId = new mongoose.Types.ObjectId(foundConversation._id);

      const foundMessages: MessageLimitDto[] = await this.messages.aggregate([
        {
          $match: {
            conversationId,
            senderId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $project: {
            _id: 0,
            diff: {
              $dateDiff: {
                startDate: "$sentAt",
                endDate: new Date(),
                unit: "second",
              },
            },
          },
        },
      ]);

      if (foundMessages.length > 9) {
        if (foundMessages[9].diff <= 60) {
          throw new HttpException(409, errors.TOO_MANY_MESSAGES);
        }
      }

      const createdMessage: Message = await this.messages.create({
        conversationId,
        senderId: userId,
        messageType: input.messageType,
        body: input.body,
        sentAt: new Date(),
        seenAt: null,
      });

      if (createdMessage !== null) {
        success = true;
      }

      const senderUser: any = await this.users.findOne({
        _id: userId,
        isArchived: false,
      });
      let notification = await this.notification.createNotification({
        senderId: userId,
        receiverId: input.receiverId,
        type: NotificationType.messageRequest,
        entityId: conversationId.toHexString(),
        text: `${senderUser.profile.firstName} ${senderUser.profile.lastName} sent you a message`,
        createdAt: new Date(Date.now()),
      });
      let mobileNotification: MobileNotificationDto = {
        title: `${senderUser.profile.firstName} ${senderUser.profile.lastName}`,
        body: `sent you a message`,
        event: NotificationType.messageRequest,
        payload: input.body,
        sender: senderUser._id,
      };
      this.firebase.sendNotifcation(
        foundUser.deviceId,
        `${senderUser.profile.firstName} ${senderUser.profile.lastName}`,
        input.body
      );
      let socketUser = getUser(input.receiverId);

      if (socketUser) {
        io.sockets
          .to(socketUser.socketId)
          .emit("new-notification", notification);
        io.sockets
          .to(socketUser.socketId)
          .emit("new-mobile-notification", mobileNotification);
      }
    }

    return {
      success,
      conversationId: conversationId.toHexString(),
    };
  }

  public async getConversations(
    userId: string,
    pageNumber: string,
    pageSize: string,
    search?: string
  ): Promise<GetConversationsResDto> {
    const searchFilter =
      search && search !== ""
        ? { $regex: search, $options: "i" }
        : { $exists: true };

    const countConversations = await this.conversations.aggregate([
      {
        $match: {
          members: {
            $in: [new mongoose.Types.ObjectId(userId)],
          },
        },
      },
      {
        $unwind: {
          path: "$members",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          members: {
            $ne: new mongoose.Types.ObjectId(userId),
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            {
              "user.profile.firstName": searchFilter,
            },
            {
              "user.profile.lastName": searchFilter,
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const foundConversations: ConversationDto[] =
      await this.conversations.aggregate([
        {
          $match: {
            members: {
              $in: [new mongoose.Types.ObjectId(userId)],
            },
          },
        },
        {
          $unwind: {
            path: "$members",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            members: {
              $ne: new mongoose.Types.ObjectId(userId),
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                "user.profile.firstName": searchFilter,
              },
              {
                "user.profile.lastName": searchFilter,
              },
            ],
          },
        },
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "conversationId",
            as: "messages",
          },
        },
        {
          $addFields: {
            lastMessage: { $arrayElemAt: ["$messages", -1] },
          },
        },
        {
          $project: {
            _id: 0,
            conversationId: {
              $toString: "$_id",
            },
            user: {
              userId: {
                $toString: "$user._id",
              },
              firstName: "$user.profile.firstName",
              lastName: "$user.profile.lastName",
              avatarUrl: "$user.profile.avatarUrl",
              isArchived: "$user.isArchived",
            },
            lastMessage: {
              messageType: "$lastMessage.messageType",
              body: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $and: [
                          {
                            $ne: [
                              "$lastMessage.senderId",
                              new mongoose.Types.ObjectId(userId),
                            ],
                          },
                          { $eq: ["$lastMessage.messageType", "IMAGE"] },
                        ],
                      },
                      then: {
                        $concat: ["$user.profile.firstName", " sent a photo."],
                      },
                    },
                    {
                      case: {
                        $and: [
                          {
                            $eq: [
                              "$lastMessage.senderId",
                              new mongoose.Types.ObjectId(userId),
                            ],
                          },
                          { $eq: ["$lastMessage.messageType", "IMAGE"] },
                        ],
                      },
                      then: "You sent a photo.",
                    },
                    {
                      case: {
                        $and: [
                          {
                            $ne: [
                              "$lastMessage.senderId",
                              new mongoose.Types.ObjectId(userId),
                            ],
                          },
                          { $eq: ["$lastMessage.messageType", "FILE"] },
                        ],
                      },
                      then: {
                        $concat: ["$user.profile.firstName", " sent a file."],
                      },
                    },
                    {
                      case: {
                        $and: [
                          {
                            $eq: [
                              "$lastMessage.senderId",
                              new mongoose.Types.ObjectId(userId),
                            ],
                          },
                          { $eq: ["$lastMessage.messageType", "FILE"] },
                        ],
                      },
                      then: "You sent a file.",
                    },
                  ],
                  default: "$lastMessage.body",
                },
              },
              sentAt: "$lastMessage.sentAt",
            },
            unseen: {
              $size: {
                $filter: {
                  input: "$messages",
                  cond: {
                    $and: [
                      {
                        $eq: ["$$this.seenAt", null],
                      },
                      {
                        $ne: [
                          "$$this.senderId",
                          new mongoose.Types.ObjectId(userId),
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $sort: {
            "lastMessage.sentAt": -1,
          },
        },
        {
          $skip: (parseInt(pageNumber) - 1) * parseInt(pageSize),
        },
        {
          $limit: parseInt(pageSize),
        },
      ]);

    return {
      total:
        countConversations && countConversations.length > 0
          ? countConversations[0].count
          : 0,
      conversations:
        foundConversations && foundConversations.length > 0
          ? foundConversations
          : [],
    };
  }

  public async getConversationUser(
    userId: string,
    conversationId: string
  ): Promise<GetConversationUserResDto> {
    const foundConversations: GetConversationUserResDto[] =
      await this.conversations.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(conversationId),
          },
        },
        {
          $unwind: {
            path: "$members",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            members: {
              $ne: new mongoose.Types.ObjectId(userId),
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            user: {
              userId: {
                $toString: "$user._id",
              },
              firstName: "$user.profile.firstName",
              lastName: "$user.profile.lastName",
              avatarUrl: "$user.profile.avatarUrl",
              isArchived: "$user.isArchived",
            },
          },
        },
      ]);

    return {
      user:
        foundConversations && foundConversations.length > 0
          ? foundConversations[0].user
          : null,
    };
  }

  public async getMessages(
    userId: string,
    pageNumber: string,
    pageSize: string,
    conversationId: string
  ): Promise<GetMessagesResDto> {
    await this.messages.updateMany(
      {
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderId: {
          $ne: new mongoose.Types.ObjectId(userId),
        },
        seenAt: null,
      },
      {
        $set: {
          seenAt: new Date(),
        },
      }
    );

    const conversationMember: ConversationMemberDto[] =
      await this.conversations.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(conversationId),
          },
        },
        {
          $unwind: {
            path: "$members",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            members: {
              $ne: new mongoose.Types.ObjectId(userId),
            },
          },
        },
        {
          $project: {
            _id: 0,
            member: {
              $toString: "$members",
            },
          },
        },
      ]);

    if (conversationMember.length > 0) {
      const receiverId = conversationMember[0].member;

      const socketUser = getUser(receiverId);
      if (socketUser) {
        io.sockets.to(socketUser.socketId).emit("see-message", {
          conversationId,
          receiverId,
        });
      }
    }

    const countMessages = await this.conversations.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(conversationId),
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversationId",
          as: "messages",
        },
      },
      {
        $unwind: {
          path: "$messages",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const foundMessages: MessageAggDto[] = await this.conversations.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(conversationId),
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversationId",
          as: "messages",
        },
      },
      {
        $unwind: {
          path: "$messages",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$members",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          members: {
            $ne: new mongoose.Types.ObjectId(userId),
          },
        },
      },
      {
        $project: {
          _id: 0,
          messageId: {
            $toString: "$messages._id",
          },
          senderType: {
            $cond: [{ $eq: ["$members", "$messages.senderId"] }, "OTHER", "ME"],
          },
          messageType: "$messages.messageType",
          body: "$messages.body",
          sentAt: "$messages.sentAt",
          seenAt: "$messages.seenAt",
        },
      },
      {
        $sort: {
          sentAt: -1,
        },
      },
      {
        $skip: (parseInt(pageNumber) - 1) * parseInt(pageSize),
      },
      {
        $limit: parseInt(pageSize),
      },
    ]);

    let messages: MessageDto[] = [];
    for (const item of foundMessages) {
      messages.push({
        messageId: item.messageId,
        senderType: item.senderType,
        messageType: item.messageType,
        body: item.body,
        sentAt: item.sentAt,
        seenAt: item.seenAt,
      });
    }

    const total: number =
      countMessages && countMessages.length > 0 ? countMessages[0].count : 0;
    const hasNext: boolean =
      parseInt(pageNumber) * parseInt(pageSize) < total ? true : false;

    return {
      // user:
      //   foundMessages && foundMessages.length > 0
      //     ? foundMessages[0].user
      //     : null,
      total,
      hasNext,
      pageNumber,
      messages,
    };
  }
}

export default ChatService;
