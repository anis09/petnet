import TaskController from "../../controllers/task.controller";
import {
  AddTaskCommentReqDto,
  CreateTaskReqDto,
  EditTaskCommentReqDto,
  RemoveTaskCommentReqDto,
  UpdateTaskReqDto,
} from "../../dtos/task.dto";
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { Routes } from "../../interfaces/routes.interface";
import validationMiddleware from "../../middlewares/validation.middleware";

class TaskRouteV1 implements Routes {
  public adminTasksPath = "/api/v1/admin/tasks";
  public router = Router();
  public taskController = new TaskController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.adminTasksPath}`,
      authMiddleware,
      this.taskController.getAllTasks
    );

    this.router.post(
      `${this.adminTasksPath}`,
      authMiddleware,
      //validationMiddleware(CreateTaskReqDto, "body"),
      this.taskController.createTask
    );

    this.router.get(
      `${this.adminTasksPath}/:taskId`,
      authMiddleware,
      this.taskController.getTask
    );

    this.router.put(
      `${this.adminTasksPath}/:taskId`,
      authMiddleware,
      // validationMiddleware(UpdateTaskReqDto, "body"),
      this.taskController.updateTask
    );

    this.router.post(
      `${this.adminTasksPath}/:taskId/comments`,
      authMiddleware,
      // validationMiddleware(AddTaskCommentReqDto, "body"),
      this.taskController.addTaskComment
    );

    this.router.put(
      `${this.adminTasksPath}/:taskId/comments`,
      authMiddleware,
      // validationMiddleware(EditTaskCommentReqDto, "body"),
      this.taskController.editTaskComment
    );

    this.router.delete(
      `${this.adminTasksPath}/:taskId/comments`,
      authMiddleware,
      // validationMiddleware(RemoveTaskCommentReqDto, "body"),
      this.taskController.removeTaskComment
    );

    this.router.delete(
      `${this.adminTasksPath}/:taskId`,
      authMiddleware,
      this.taskController.deleteTask
    );
  }
}

export default TaskRouteV1;
