import { Router } from "express";
import { Routes } from "../../interfaces/routes.interface";
import authMiddleware from "../../middlewares/auth.middleware";
import SearchKeywordsController from "../../controllers/search_keywords.controller";

class SearchKeyWordsRouteV1 implements Routes {
  public path = "/api/v1/admin/search";
  public appPath="/api/v1/search";
  public router = Router();
  public searchKeyWordsController = new SearchKeywordsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.searchKeyWordsController.getAllKeywords
    );
    this.router.post(
      `${this.appPath}-keywords`,
      authMiddleware,
      this.searchKeyWordsController.createSearchKeyword
    );
    this.router.get(
      `${this.path}-count`,
      authMiddleware,
      this.searchKeyWordsController.countKeywords
    );
    
  }
}
export default SearchKeyWordsRouteV1;