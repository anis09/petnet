import { IsDefined, IsOptional } from "class-validator";

export class CreateSearchKeywordsDto {
  @IsDefined()
  keyword: string;
  
}
export class CountKeywordsByUserResDto {
  success: boolean;
  count: number;
}