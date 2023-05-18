import { CreateSearchKeywordsDto } from "dtos/search_keywords.dto";
import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "interfaces/auth.interface";
import { SearchKeywords } from "interfaces/models/search_keywords.model.interface";
import { SearchKeywordsService } from "../services/search_keywords.service";

class SearchKeywordsController {
  private searchKeyWordsService = new SearchKeywordsService();
  public getAllKeywords = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const keywords: SearchKeywords[] =
        await this.searchKeyWordsService.getAllKeyWords();
      res.status(200).json(keywords);
    } catch (error) {
      next(error);
    }
    
  };
  
  public createSearchKeyword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqInputData: CreateSearchKeywordsDto = req.body as any;
      const { user } = req;
      reqInputData.createdBy = user;
      const keyword: SearchKeywords =
        await this.searchKeyWordsService.createSearchKeyword(reqInputData);
      res.status(200).json(keyword);
    } catch (error) {
      next(error);
    }
  };
  public countKeywords = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const keywordCounts = await this.searchKeyWordsService.countKeywords();
      res.status(200).json(keywordCounts);
    } catch (error) {
      next(error);
    }
  };
}
export default SearchKeywordsController;
