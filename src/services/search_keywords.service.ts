import { searchKeywordsModel } from "../models/search_keywords.model";
import { SearchKeywords } from "../interfaces/models/search_keywords.model.interface";
import { CreateSearchKeywordsDto } from "../dtos/search_keywords.dto";

export class SearchKeywordsService {
  private keywords = searchKeywordsModel;

  public async createSearchKeyword(
    keyword: CreateSearchKeywordsDto
  ): Promise<SearchKeywords> {
    let newKeyword: SearchKeywords = await this.keywords.create(keyword);
    return newKeyword;
  }
  public async getAllKeyWords(): Promise<SearchKeywords[]> {
    let keywords: SearchKeywords[] = await this.keywords.find();
    return keywords;
  }
  public async countKeywords(): Promise<any> {
    const keywordCounts = await searchKeywordsModel.aggregate([
      {
        $group: {
          _id: "$keyword",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          keyword: "$_id",
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 12
      }
    ]);
  
    return keywordCounts;
  }

}
