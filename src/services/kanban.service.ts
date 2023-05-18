import {
  AddKanbanCardCommentReqDto,
  AddKanbanCardCommentResDto,
  CreateKanbanCardReqDto,
  CreateKanbanCardResDto,
  CreateKanbanColumnReqDto,
  CreateKanbanColumnResDto,
  DeleteKanbanCardResDto,
  DeleteKanbanColumnResDto,
  EditKanbanCardCommentReqDto,
  GetKanbanResDto,
  RemoveKanbanCardCommentReqDto,
  SetKanbanColumnsPositionReqDto,
  SetKanbanColumnsPositionResDto,
  UpdateKanbanCardReqDto,
  UpdateKanbanCardResDto,
  UpdateKanbanColumnReqDto,
  UpdateKanbanColumnResDto,
  UpdateKanbanReqDto,
  UpdateKanbanResDto
} from "../dtos/kanban.dto";
import { errors } from "../constants/errors";
import { KanbanCard } from "../interfaces/models/kanban_card.model.interface";
import { KanbanColumn } from "../interfaces/models/kanban_column.model.interface";
import { HttpException } from "../middlewares/error.middleware";
import { kanbanCardModel } from "../models/kanban_card.model";
import { kanbanColumnModel } from "../models/kanban_column.model";
import mongoose from "mongoose";
import io, { getUser } from "../utils/socket";
import UserService from "./user.service";
import { User } from "interfaces/models/user.model.interface";
import { GetCurrentUserResDto } from "dtos/user.dto";

class KanbanService {
  private kanbanCards = kanbanCardModel;
  private kanbanColumns = kanbanColumnModel;
  private userServ: UserService;
  constructor() {
    this.userServ = new UserService();
  }

  public async getKanban(): Promise<GetKanbanResDto> {
    const [foundCards, foundColumns, foundOrderIds] = await Promise.all([
      this.kanbanCards.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "assignee",
            foreignField: "_id",
            as: "assignee"
          }
        },
        {
          $unwind: {
            path: "$assignee",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "reporter",
            foreignField: "_id",
            as: "reporter"
          }
        },
        {
          $unwind: {
            path: "$reporter",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$comments",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "comments.postedBy",
            foreignField: "_id",
            as: "postedBy"
          }
        },
        {
          $unwind: {
            path: "$postedBy",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: {
            "comments.createdAt": -1
          }
        },
        {
          $group: {
            _id: "$_id",
            id: {
              $first: {
                $toString: "$_id"
              }
            },
            name: {
              $first: "$name"
            },
            description: {
              $first: "$description"
            },
            attachments: {
              $first: "$attachments"
            },
            assignee: {
              $first: {
                id: {
                  $toString: "$assignee._id"
                },
                name: {
                  $concat: [
                    "$assignee.profile.firstName",
                    " ",
                    "$assignee.profile.lastName"
                  ]
                },
                avatar: "$assignee.profile.avatarUrl"
              }
            },
            reporter: {
              $first: {
                id: {
                  $toString: "$reporter._id"
                },
                name: {
                  $concat: [
                    "$reporter.profile.firstName",
                    " ",
                    "$reporter.profile.lastName"
                  ]
                },
                avatarUrl: "$reporter.profile.avatarUrl"
              }
            },
            priority: {
              $first: "$priority"
            },
            due: {
              $first: "$due"
            },
            isCompleted: {
              $first: "$isCompleted"
            },
            comments: {
              $push: {
                id: {
                  $toString: "$comments._id"
                },
                name: {
                  $concat: [
                    "$postedBy.profile.firstName",
                    " ",
                    "$postedBy.profile.lastName"
                  ]
                },
                avatar: "$postedBy.profile.avatar",
                messageType: "$comments.messageType",
                message: "$comments.message",
                createdAt: "$comments.createdAt"
              }
            }
          }
        },
        {
          $addFields: {
            assigneeArr: ["$assignee"],
            reporterArr: ["$reporter"]
          }
        },
        {
          $project: {
            _id: 0,
            id: 1,
            name: 1,
            description: 1,
            attachments: 1,
            assignee: {
              $cond: {
                if: { $eq: [{ $arrayElemAt: ["$assigneeArr.id", 0] }, null] },
                then: [],
                else: "$assigneeArr"
              }
            },
            reporter: {
              $cond: {
                if: { $eq: [{ $arrayElemAt: ["$reporterArr.id", 0] }, null] },
                then: [],
                else: "$reporterArr"
              }
            },
            priority: 1,
            due: 1,
            isCompleted: 1,
            comments: {
              $cond: {
                if: { $eq: [{ $arrayElemAt: ["$comments.id", 0] }, null] },
                then: [],
                else: "$comments"
              }
            }
          }
        }
      ]),
      this.kanbanColumns.aggregate([
        {
          $lookup: {
            from: "kanban-cards",
            localField: "_id",
            foreignField: "kanbanColumnId",
            as: "cards"
          }
        },
        {
          $sort: {
            position: 1
          }
        },
        {
          $project: {
            _id: 0,
            id: {
              $toString: "$_id"
            },
            name: "$name",
            cardIds: {
              $map: {
                input: "$cards",
                as: "item",
                in: {
                  $toString: "$$item._id"
                }
              }
            }
          }
        },
        {
          $project: {
            id: "$id",
            name: "$name",
            cardIds: {
              $cond: {
                if: { $eq: [{ $arrayElemAt: ["$cardIds", 0] }, null] },
                then: [],
                else: "$cardIds"
              }
            }
          }
        }
      ]),
      this.kanbanColumns.aggregate([
        {
          $sort: {
            position: 1
          }
        },
        {
          $group: {
            _id: null,
            ids: {
              $push: {
                $toString: "$_id"
              }
            }
          }
        }
      ])
    ]);

    return {
      board: {
        cards: foundCards && foundCards?.length > 0 ? foundCards : ([] as any),
        columns:
          foundColumns && foundColumns?.length > 0 ? foundColumns : ([] as any),
        columnOrder:
          foundOrderIds && foundOrderIds?.length > 0
            ? (foundOrderIds[0]?.ids as any)
            : ([] as any)
      }
    };
  }

  public async updateKanban(
    input: UpdateKanbanReqDto
  ): Promise<UpdateKanbanResDto> {
    for (const item of input.columns) {
      const foundKanbanColumn: KanbanColumn = await this.kanbanColumns.findOne({
        _id: item.id
      });
      if (!foundKanbanColumn)
        throw new HttpException(404, errors.KANBAN_COLUMN_NOT_FOUND);

      await this.kanbanColumns.findOneAndUpdate(
        { _id: item.id },
        {
          $set: {
            name: item.name ? item.name : foundKanbanColumn.name,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      for (const cardItem of item.cardIds) {
        const foundKanbanCard: KanbanCard = await this.kanbanCards.findOne({
          _id: cardItem
        });
        if (!foundKanbanCard)
          throw new HttpException(404, errors.KANBAN_CARD_NOT_FOUND);

        await this.kanbanCards.findOneAndUpdate(
          { _id: cardItem },
          {
            $set: {
              kanbanColumnId: item.id
                ? item.id
                : foundKanbanCard.kanbanColumnId,
              updatedAt: new Date()
            }
          },
          { new: true }
        );
      }
    }

    return {
      success: true
    };
  }

  public async createKanbanColumn(
    userId: string,
    input: CreateKanbanColumnReqDto
  ): Promise<CreateKanbanColumnResDto> {
    let position: number = 1;
    const countKanbanColumns = await this.kanbanColumns.aggregate([
      {
        $project: {
          _id: 0,
          position: 1
        }
      },
      {
        $sort: {
          position: -1
        }
      }
    ]);

    if (countKanbanColumns && countKanbanColumns.length > 0) {
      position = countKanbanColumns[0]?.position + 1;
    }

    const kanbanColumn: KanbanColumn = await this.kanbanColumns.create({
      name: input.name,
      position
    });

    if (kanbanColumn) {
      let socketUser = getUser(userId);

      if (socketUser) {
        io.sockets
          .to(socketUser.socketId)
          .emit("new-kanban-column", kanbanColumn);
      }
    }

    return {
      success: true,
      kanbanColumnId: kanbanColumn._id
    };
  }

  public async updateKanbanColumn(
    kanbanColumnId: string,
    input: UpdateKanbanColumnReqDto
  ): Promise<UpdateKanbanColumnResDto> {
    const foundKanbanColumn: KanbanColumn = await this.kanbanColumns.findOne({
      _id: kanbanColumnId
    });
    if (!foundKanbanColumn)
      throw new HttpException(404, errors.KANBAN_COLUMN_NOT_FOUND);

    const updatedKanbanColumn = await this.kanbanColumns.findOneAndUpdate(
      { _id: kanbanColumnId },
      {
        $set: {
          name: input.name ? input.name : foundKanbanColumn.name,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return {
      success: updatedKanbanColumn != null ? true : false
    };
  }

  public async deleteKanbanColumn(
    kanbanColumnId: string
  ): Promise<DeleteKanbanColumnResDto> {
    const foundKanbanColumn: KanbanColumn = await this.kanbanColumns.findOne({
      _id: kanbanColumnId
    });
    if (!foundKanbanColumn)
      throw new HttpException(404, errors.KANBAN_COLUMN_NOT_FOUND);

    const result = await this.kanbanColumns.findOneAndDelete({
      _id: kanbanColumnId
    });

    if (result !== null) {
      await this.kanbanCards.deleteMany({
        kanbanColumnId
      });
    }

    return {
      success: true
    };
  }

  public async setKanbanColumnsPosition(
    input: SetKanbanColumnsPositionReqDto
  ): Promise<SetKanbanColumnsPositionResDto> {
    let i = 0;
    for (const id of input.ids) {
      await this.kanbanColumns.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            position: i + 1,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      i += 1;
    }

    return {
      success: true
    };
  }

  public async createKanbanCard(
    userId: string,
    input: CreateKanbanCardReqDto
  ): Promise<CreateKanbanCardResDto> {
    const foundKanbanColumn: KanbanColumn = await this.kanbanColumns.findOne({
      _id: input.kanbanColumnId
    });
    if (!foundKanbanColumn)
      throw new HttpException(404, errors.KANBAN_COLUMN_NOT_FOUND);
    const currentUser: GetCurrentUserResDto =
      await this.userServ.getCurrentUser(userId);
    const kanbanCard: KanbanCard = await this.kanbanCards.create({
      kanbanColumnId: input.kanbanColumnId,
      name: input.name,
      description: input.description,
      attachments: input.attachments,
      assignee: [],
      reporter: [currentUser.userId],
      priority: input.priority,
      due: input.due,
      isCompleted: input.isCompleted
    });

    if (kanbanCard) {
      let socketUser = getUser(userId);

      if (socketUser) {
        io.sockets.to(socketUser.socketId).emit("new-kanban-card", kanbanCard);
      }
    }

    return {
      success: true,
      kanbanCardId: kanbanCard._id
    };
  }

  public async updateKanbanCard(
    kanbanCardId: string,
    input: UpdateKanbanCardReqDto
  ): Promise<UpdateKanbanCardResDto> {
    const foundKanbanCard: KanbanCard = await this.kanbanCards.findOne({
      _id: kanbanCardId
    });
    if (!foundKanbanCard)
      throw new HttpException(404, errors.KANBAN_CARD_NOT_FOUND);

    const updatedKanbanCard = await this.kanbanCards.findOneAndUpdate(
      { _id: kanbanCardId },
      {
        $set: {
          name: input.name ? input.name : foundKanbanCard.name,
          description: input.description
            ? input.description
            : foundKanbanCard.description,
          attachments: input.attachments
            ? input.attachments
            : foundKanbanCard.attachments,
          assignee: input.assignee
            ? input.assignee.map((a) => a.id)
            : foundKanbanCard.assignee,
          // reporter: input.reporter ? input.reporter : foundKanbanCard.reporter,
          priority: input.priority ? input.priority : foundKanbanCard.priority,
          due: input.due ? input.due : foundKanbanCard.due,
          isCompleted:
            input.isCompleted !== undefined && input.isCompleted !== null
              ? input.isCompleted
              : foundKanbanCard.isCompleted,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return {
      success: updatedKanbanCard != null ? true : false
    };
  }

  public async addKanbanCardComment(
    userId: string,
    kanbanCardId: string,
    input: AddKanbanCardCommentReqDto
  ): Promise<AddKanbanCardCommentResDto> {
    const foundKanbanCard: KanbanCard = await this.kanbanCards.findOne({
      _id: kanbanCardId
    });

    if (!foundKanbanCard)
      throw new HttpException(404, errors.KANBAN_CARD_NOT_FOUND);
    const currentUser: GetCurrentUserResDto =
      await this.userServ.getCurrentUser(userId);

    const updatedKanbanCard: KanbanCard = await this.kanbanCards
      .findOneAndUpdate(
        { _id: kanbanCardId },
        {
          $push: {
            comments: {
              messageType: input.messageType,
              message: input.message,
              postedBy: userId,
              createdAt: new Date()
            }
          },
          $set: {
            updatedAt: new Date()
          }
        },
        { new: true }
      )
      .lean();

    const result: AddKanbanCardCommentResDto = {
      success: true,
      avatar: currentUser ? currentUser.profile.avatarUrl : null,
      name: currentUser
        ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
        : "",
      createdAt: updatedKanbanCard.updatedAt,
      message: input.message,
      messageType: input.messageType as "image" | "text",
      id: updatedKanbanCard.comments[updatedKanbanCard.comments.length - 1]._id
    };
    return result;
  }

  public async editKanbanCardComment(
    kanbanCardId: string,
    input: EditKanbanCardCommentReqDto
  ): Promise<UpdateKanbanCardResDto> {
    const foundKanbanCard: KanbanCard = await this.kanbanCards.findOne({
      _id: kanbanCardId
    });
    if (!foundKanbanCard)
      throw new HttpException(404, errors.KANBAN_CARD_NOT_FOUND);

    const updatedKanbanCard = await this.kanbanCards.findOneAndUpdate(
      {
        _id: kanbanCardId,
        "comments._id": new mongoose.Types.ObjectId(input.kanbanCardCommentId)
      },
      {
        $set: {
          "comments.$.messageType": input.messageType,
          "comments.$.message": input.message,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return {
      success: updatedKanbanCard != null ? true : false
    };
  }

  public async removeKanbanCardComment(
    kanbanCardId: string,
    input: RemoveKanbanCardCommentReqDto
  ): Promise<UpdateKanbanCardResDto> {
    const foundKanbanCard: KanbanCard = await this.kanbanCards.findOne({
      _id: kanbanCardId
    });
    if (!foundKanbanCard)
      throw new HttpException(404, errors.KANBAN_CARD_NOT_FOUND);

    const updatedKanbanCard = await this.kanbanCards.findOneAndUpdate(
      { _id: kanbanCardId },
      {
        $pull: {
          comments: {
            _id: new mongoose.Types.ObjectId(input.kanbanCardCommentId)
          }
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return {
      success: updatedKanbanCard != null ? true : false
    };
  }

  public async deleteKanbanCard(
    kanbanCardId: string
  ): Promise<DeleteKanbanCardResDto> {
    const foundKanbanCard: KanbanCard = await this.kanbanCards.findOne({
      _id: kanbanCardId
    });
    if (!foundKanbanCard)
      throw new HttpException(404, errors.KANBAN_CARD_NOT_FOUND);

    await this.kanbanCards.findOneAndDelete({ _id: kanbanCardId });

    return {
      success: true
    };
  }
}

export default KanbanService;
