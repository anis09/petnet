import { NextFunction, Request, Response } from "express";
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
  EditKanbanCardCommentResDto,
  GetKanbanResDto,
  RemoveKanbanCardCommentReqDto,
  RemoveKanbanCardCommentResDto,
  SetKanbanColumnsPositionReqDto,
  SetKanbanColumnsPositionResDto,
  UpdateKanbanCardReqDto,
  UpdateKanbanCardResDto,
  UpdateKanbanColumnReqDto,
  UpdateKanbanColumnResDto,
  UpdateKanbanReqDto,
  UpdateKanbanResDto,
} from "../dtos/kanban.dto";
import { RequestWithUser } from "../interfaces/auth.interface";
import KanbanService from "../services/kanban.service";

class KanbanController {
  private kanbanService = new KanbanService();

  public getKanban = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetKanbanResDto = await this.kanbanService.getKanban();

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updateKanban = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: UpdateKanbanReqDto = req.body;
      const outputData: UpdateKanbanResDto =
        await this.kanbanService.updateKanban(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public createKanbanColumn = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: CreateKanbanColumnReqDto = req.body;
      const outputData: CreateKanbanColumnResDto =
        await this.kanbanService.createKanbanColumn(req.user, inputData);

      res.status(201).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updateKanbanColumn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { kanbanColumnId } = req.params as any;
      const inputData: UpdateKanbanColumnReqDto = req.body;
      const outputData: UpdateKanbanColumnResDto =
        await this.kanbanService.updateKanbanColumn(kanbanColumnId, inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public deleteKanbanColumn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { kanbanColumnId } = req.params as any;
      const outputData: DeleteKanbanColumnResDto =
        await this.kanbanService.deleteKanbanColumn(kanbanColumnId);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public setKanbanColumnsPosition = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SetKanbanColumnsPositionReqDto = req.body;
      const outputData: SetKanbanColumnsPositionResDto =
        await this.kanbanService.setKanbanColumnsPosition(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public createKanbanCard = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: CreateKanbanCardReqDto = req.body;
      const outputData: CreateKanbanCardResDto =
        await this.kanbanService.createKanbanCard(req.user, inputData);

      res.status(201).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updateKanbanCard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { kanbanCardId } = req.params as any;
      const inputData: UpdateKanbanCardReqDto = req.body;
      const outputData: UpdateKanbanCardResDto =
        await this.kanbanService.updateKanbanCard(kanbanCardId, inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public addKanbanCardComment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
     
      const { kanbanCardId } = req.params as any;
      const inputData: AddKanbanCardCommentReqDto = req.body;
      const outputData: AddKanbanCardCommentResDto =
        await this.kanbanService.addKanbanCardComment(
          req.user,
          kanbanCardId,
          inputData
        );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public editKanbanCardComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { kanbanCardId } = req.params as any;
      const inputData: EditKanbanCardCommentReqDto = req.body;
      const outputData: EditKanbanCardCommentResDto =
        await this.kanbanService.editKanbanCardComment(kanbanCardId, inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public removeKanbanCardComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { kanbanCardId } = req.params as any;
      const inputData: RemoveKanbanCardCommentReqDto = req.body;
      const outputData: RemoveKanbanCardCommentResDto =
        await this.kanbanService.removeKanbanCardComment(
          kanbanCardId,
          inputData
        );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public deleteKanbanCard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { kanbanCardId } = req.params as any;
      const outputData: DeleteKanbanCardResDto =
        await this.kanbanService.deleteKanbanCard(kanbanCardId);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
}

export default KanbanController;
