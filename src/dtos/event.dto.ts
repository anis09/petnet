import { IsDefined, IsOptional } from "class-validator";

export class CreateEventDto {
  @IsDefined()
  title: string;
  @IsDefined()
  description: string;
  @IsDefined()
  createdBy: string;
  @IsDefined()
  start: Date;
  @IsDefined()
  end: Date;
  @IsDefined()
  isAllDay: boolean;
  @IsDefined()
  color: string;
}
export class UpdateEventDto {
  @IsOptional()
  title?: string;
  @IsOptional()
  description?: string;
  @IsOptional()
  createdBy?: string;
  @IsOptional()
  start?: Date;
  @IsOptional()
  end?: Date;
  @IsOptional()
  isAllDay?: boolean;
  @IsOptional()
  color?: string;
}


export class CreateEventResDto {
  title: string;
  description: string;
  createdBy: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateEventReqDto {
  title?: string;
  description?: string;
  createdBy?: string;
  start?: Date;
  end?: Date;
  isAllDay?: boolean;
}
export class UpdateEventResDto {
  public success: boolean;
}
export class DeleteEventResDto {
  public success: boolean;
}
