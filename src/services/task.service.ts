import {
  AddTaskCommentReqDto,
  CreateTaskReqDto,
  CreateTaskResDto,
  DeleteTaskResDto,
  EditTaskCommentReqDto,
  GetTaskResDto,
  GetTasksResDto,
  RemoveTaskCommentReqDto,
  TaskDto,
  UpdateTaskReqDto,
  UpdateTaskResDto,
} from "../dtos/task.dto";
import { errors } from "../constants/errors";
import { Task } from "../interfaces/models/task.model.interface";
import { HttpException } from "../middlewares/error.middleware";
import { taskModel } from "../models/task.model";
import mongoose from "mongoose";
import io, { getUser } from "../utils/socket";

class TaskService {
  private tasks = taskModel;

  public async getAllTasks(
    pageNumber: string,
    pageSize: string,
    status?: string
  ): Promise<GetTasksResDto> {
    const statusFilter =
      status && status !== ""
        ? { $match: { status } }
        : { $match: { _id: { $exists: true } } };

    const countTasks = await this.tasks.aggregate([
      {
        $match: {
          status: statusFilter,
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

    const foundTasks: TaskDto[] = await this.tasks.aggregate([
      {
        $match: {
          status: statusFilter,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignee",
          foreignField: "_id",
          as: "assignee",
        },
      },
      {
        $unwind: {
          path: "$assignee",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reporter",
          foreignField: "_id",
          as: "reporter",
        },
      },
      {
        $unwind: {
          path: "$reporter",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          taskId: {
            $toString: "$_id",
          },
          status: "$status",
          name: "$name",
          description: "$description",
          attachments: "$attachments",
          assignee: {
            userId: {
              $toString: "$assignee._id",
            },
            firstName: "$assignee.profile.firstName",
            lastName: "$assignee.profile.lastName",
            avatarUrl: "$assignee.profile.avatarUrl",
          },
          reporter: {
            userId: {
              $toString: "$reporter._id",
            },
            firstName: "$reporter.profile.firstName",
            lastName: "$reporter.profile.lastName",
            avatarUrl: "$reporter.profile.avatarUrl",
          },
          priority: "$priority",
          dueDate: "$dueDate",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
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
      total: countTasks && countTasks.length > 0 ? countTasks[0].count : 0,
      tasks: foundTasks,
    };
  }

  public async createTask(userId: string, input: CreateTaskReqDto): Promise<CreateTaskResDto> {
    const task: Task = await this.tasks.create({
      status: input.status,
      name: input.name,
      description: input.description,
      attachments: input.attachments,
      assignee: input.assignee,
      reporter: input.reporter,
      priority: input.priority,
      dueDate: input.dueDate,
    });

    if (task) {
      let socketUser = getUser(userId);

      if (socketUser) {
        io.sockets
          .to(socketUser.socketId)
          .emit("new-task", task);
      }
    }

    return {
      success: true,
      taskId: task._id,
    };
  }

  public async getTask(
    taskId: string,
  ): Promise<GetTaskResDto> {
    const foundTasks: GetTaskResDto[] = await this.tasks.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(taskId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignee",
          foreignField: "_id",
          as: "assignee",
        },
      },
      {
        $unwind: {
          path: "$assignee",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reporter",
          foreignField: "_id",
          as: "reporter",
        },
      },
      {
        $unwind: {
          path: "$reporter",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$comments",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.postedBy",
          foreignField: "_id",
          as: "postedBy",
        },
      },
      {
        $unwind: {
          path: "$postedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          "comments.postedAt": -1
        }
      },
      {
        $group: {
          _id: "$_id",
          taskId: {
            $first: {
              $toString: "$_id",
            }
          },
          status: {
            $first: "$status"
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
              userId: {
                $toString: "$assignee._id",
              },
              firstName: "$assignee.profile.firstName",
              lastName: "$assignee.profile.lastName",
              avatarUrl: "$assignee.profile.avatarUrl",
            }
          },
          reporter: {
            $first: {
              userId: {
                $toString: "$reporter._id",
              },
              firstName: "$reporter.profile.firstName",
              lastName: "$reporter.profile.lastName",
              avatarUrl: "$reporter.profile.avatarUrl",
            }
          },
          priority: {
            $first: "$priority"
          },
          dueDate: {
            $first: "$dueDate"
          },
          comments: {
            $push: {
              commentType: "$comments.commentType",
              body: "$comments.body",
              postedBy: {
                userId: {
                  $toString: "$postedBy._id",
                },
                firstName: "$postedBy.profile.firstName",
                lastName: "$postedBy.profile.lastName",
                avatarUrl: "$postedBy.profile.avatarUrl",
              },
              postedAt: "$comments.postedAt",
            }
          },
          createdAt: {
            $first: "$createdAt"
          },
          updatedAt: {
            $first: "$updatedAt"
          },
        }
      },
      {
        $project: {
          _id: 0,
          taskId: 1,
          status: 1,
          name: 1,
          description: 1,
          attachments: 1,
          assignee: 1,
          reporter: 1,
          priority: 1,
          dueDate: 1,
          comments: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (foundTasks.length === 0) throw new HttpException(404, errors.TASK_NOT_FOUND);

    return {
      taskId: foundTasks[0]?.taskId,
      status: foundTasks[0]?.status,
      name: foundTasks[0]?.name,
      description: foundTasks[0]?.description,
      attachments: foundTasks[0]?.attachments,
      assignee: foundTasks[0]?.assignee,
      reporter: foundTasks[0]?.reporter,
      priority: foundTasks[0]?.priority,
      dueDate: foundTasks[0]?.dueDate,
      comments: foundTasks[0]?.comments,
      createdAt: foundTasks[0]?.createdAt,
      updatedAt: foundTasks[0]?.updatedAt,
    };
  }

  public async updateTask(
    taskId: string,
    input: UpdateTaskReqDto
  ): Promise<UpdateTaskResDto> {
    const foundTask: Task = await this.tasks.findOne({
      _id: taskId,
    });
    if (!foundTask) throw new HttpException(404, errors.TASK_NOT_FOUND);

    const updatedTask = await this.tasks.findOneAndUpdate(
      { _id: taskId },
      {
        $set: {
          status: input.status ? input.status : foundTask.status,
          name: input.name ? input.name : foundTask.name,
          description: input.description ? input.description : foundTask.description,
          attachments: input.attachments ? input.attachments : foundTask.attachments,
          assignee: input.assignee ? input.assignee : foundTask.assignee,
          reporter: input.reporter ? input.reporter : foundTask.reporter,
          priority: input.priority ? input.priority : foundTask.priority,
          dueDate: input.dueDate ? input.dueDate : foundTask.dueDate,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return {
      success: updatedTask != null ? true : false,
    };
  }

  public async addTaskComment(
    userId: string,
    taskId: string,
    input: AddTaskCommentReqDto
  ): Promise<UpdateTaskResDto> {
    const foundTask: Task = await this.tasks.findOne({
      _id: taskId,
    });
    if (!foundTask) throw new HttpException(404, errors.TASK_NOT_FOUND);

    const updatedTask = await this.tasks.findOneAndUpdate(
      { _id: taskId },
      {
        $push: {
          comments: {
            commentType: input.commentType,
            body: input.body,
            postedBy: userId,
            postedAt: new Date(),
          }
        },
        $set: {
          updatedAt: new Date()
        }

      },
      { new: true }
    );

    return {
      success: updatedTask != null ? true : false,
    };
  }

  public async editTaskComment(
    taskId: string,
    input: EditTaskCommentReqDto
  ): Promise<UpdateTaskResDto> {
    const foundTask: Task = await this.tasks.findOne({
      _id: taskId,
    });
    if (!foundTask) throw new HttpException(404, errors.TASK_NOT_FOUND);

    const updatedTask = await this.tasks.findOneAndUpdate(
      { _id: taskId, 'comments._id': new mongoose.Types.ObjectId(input.taskCommentId) },
      {
        $set: {
          'comments.$.commentType': input.commentType,
          'comments.$.body': input.body,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return {
      success: updatedTask != null ? true : false,
    };
  }

  public async removeTaskComment(
    taskId: string,
    input: RemoveTaskCommentReqDto
  ): Promise<UpdateTaskResDto> {
    const foundTask: Task = await this.tasks.findOne({
      _id: taskId,
    });
    if (!foundTask) throw new HttpException(404, errors.TASK_NOT_FOUND);

    const updatedTask = await this.tasks.findOneAndUpdate(
      { _id: taskId },
      {
        $pull: {
          comments: {
            _id: new mongoose.Types.ObjectId(input.taskCommentId)
          }
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    return {
      success: updatedTask != null ? true : false,
    };
  }

  public async deleteTask(taskId: string): Promise<DeleteTaskResDto> {
    const foundTask: Task = await this.tasks.findOne({
      _id: taskId,
    });
    if (!foundTask) throw new HttpException(404, errors.TASK_NOT_FOUND);

    await this.tasks.findOneAndDelete(
      { _id: taskId },
    );

    return {
      success: true,
    };
  }
}

export default TaskService;
