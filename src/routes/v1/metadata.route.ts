import { Router } from "express";
import MetadataController from "../../controllers/metadata.controller";
import { GetSuburbsReqDto } from "../../dtos/metadata.dto";
import { Routes } from "../../interfaces/routes.interface";
import validationMiddleware from "../../middlewares/validation.middleware";

class MetadataRouteV1 implements Routes {
  public path = "/api/v1/metadata";
  public adminPath="/api/v1/admin/metadata";
  public router = Router();
  public matadataController = new MetadataController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/suburbs`, this.matadataController.getSuburbs);
    this.router.get(`${this.adminPath}/suburbs`, this.matadataController.getSuburbs);
    this.router.get(
      `${this.path}/states`,
      this.matadataController.getStateList
    );
    this.router.get(
      `${this.adminPath}/states`,
      this.matadataController.getStateList
    );
    this.router.post(
      `${this.path}/suburbs`,
      this.matadataController.getSuburbsByState
    );
    this.router.post(
      `${this.adminPath}/suburbs`,
      this.matadataController.getSuburbsByState
    );
  }
}

export default MetadataRouteV1;
