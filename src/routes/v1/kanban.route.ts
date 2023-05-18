import KanbanController from "../../controllers/kanban.controller";
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { Routes } from "../../interfaces/routes.interface";
import validationMiddleware from "../../middlewares/validation.middleware";

class KanbanRouteV1 implements Routes {
  public adminKanbanPath = "/api/v1/admin/kanban";
  public router = Router();
  public kanbanController = new KanbanController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.adminKanbanPath}`,
      authMiddleware,
      this.kanbanController.getKanban
    );

    this.router.put(
      `${this.adminKanbanPath}`,
      authMiddleware,
      this.kanbanController.updateKanban
    );

    this.router.post(
      `${this.adminKanbanPath}/columns`,
      authMiddleware,
      this.kanbanController.createKanbanColumn
    );

    this.router.put(
      `${this.adminKanbanPath}/columns/:kanbanColumnId`,
      authMiddleware,
      this.kanbanController.updateKanbanColumn
    );

    this.router.delete(
      `${this.adminKanbanPath}/columns/:kanbanColumnId`,
      authMiddleware,
      this.kanbanController.deleteKanbanColumn
    );

    this.router.post(
      `${this.adminKanbanPath}/columns/position`,
      authMiddleware,
      this.kanbanController.setKanbanColumnsPosition
    );

    this.router.post(
      `${this.adminKanbanPath}/cards`,
      authMiddleware,
      this.kanbanController.createKanbanCard
    );

    this.router.put(
      `${this.adminKanbanPath}/cards/:kanbanCardId`,
      authMiddleware,
      this.kanbanController.updateKanbanCard
    );

    this.router.post(
      `${this.adminKanbanPath}/cards/:kanbanCardId/comments`,
      authMiddleware,
      this.kanbanController.addKanbanCardComment
    );

    this.router.put(
      `${this.adminKanbanPath}/cards/:kanbanCardId/comments`,
      authMiddleware,
      this.kanbanController.editKanbanCardComment
    );

    this.router.delete(
      `${this.adminKanbanPath}/cards/:kanbanCardId/comments`,
      authMiddleware,
      this.kanbanController.removeKanbanCardComment
    );

    this.router.delete(
      `${this.adminKanbanPath}/cards/:kanbanCardId`,
      authMiddleware,
      this.kanbanController.deleteKanbanCard
    );
  }
}

export default KanbanRouteV1;
