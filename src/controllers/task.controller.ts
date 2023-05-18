import { NextFunction, Request, Response } from "express";
import { AddTaskCommentReqDto, AddTaskCommentResDto, CreateTaskReqDto, CreateTaskResDto, DeleteTaskResDto, EditTaskCommentReqDto, EditTaskCommentResDto, GetTaskResDto, GetTasksReqDto, GetTasksResDto, RemoveTaskCommentReqDto, RemoveTaskCommentResDto, UpdateTaskReqDto, UpdateTaskResDto } from "../dtos/task.dto";
import { RequestWithUser } from "../interfaces/auth.interface";
import TaskService from "../services/task.service";

class TaskController {
  private taskService = new TaskService();

  public getAllTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageNumber, pageSize, status }: GetTasksReqDto =
        req.query as any;
      const allTasksResp: GetTasksResDto = await this.taskService.getAllTasks(
        pageNumber,
        pageSize,
        status,
      );

      res.status(200).json(allTasksResp);
    } catch (error) {
      next(error);
    }
  };

  public createTask = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: CreateTaskReqDto = req.body;
      const outputData: CreateTaskResDto = await this.taskService.createTask(
        req.user,
        inputData
      );

      res.status(201).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { taskId } = req.params as any;
      const outputData: GetTaskResDto =
        await this.taskService.getTask(
          taskId,
        );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { taskId } = req.params as any;
      const inputData: UpdateTaskReqDto = req.body;
      const outputData: UpdateTaskResDto = await this.taskService.updateTask(
        taskId,
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public addTaskComment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { taskId } = req.params as any;
      const inputData: AddTaskCommentReqDto = req.body;
      const outputData: AddTaskCommentResDto = await this.taskService.addTaskComment(
        req.user,
        taskId,
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public editTaskComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { taskId } = req.params as any;
      const inputData: EditTaskCommentReqDto = req.body;
      const outputData: EditTaskCommentResDto = await this.taskService.editTaskComment(
        taskId,
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public removeTaskComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { taskId } = req.params as any;
      const inputData: RemoveTaskCommentReqDto = req.body;
      const outputData: RemoveTaskCommentResDto = await this.taskService.removeTaskComment(
        taskId,
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { taskId } = req.params as any;
      const outputData: DeleteTaskResDto = await this.taskService.deleteTask(
        taskId
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
}

export default TaskController;
