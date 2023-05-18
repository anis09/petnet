import { IsDefined, IsIn } from "class-validator";

export class CreateNotificationDto {
  @IsDefined()
  senderId: string;
  @IsDefined()
  receiverId: string;
  @IsIn(["MESSAGE_REQUEST", "FAVORED_REQUEST", "PHONE_NUMBER_REQUEST"])
  @IsDefined()
  type: string;
  @IsDefined()
  entityId: string;
  @IsDefined()
  text: string;
  @IsDefined()
  createdAt: Date;
}
export class MarkNotificationAsReadenDto {
  @IsDefined()
  postId: string;
}
export class MarkNotificationAsReadenMultipleDto {
  @IsDefined()
  entityList: string[];
}
export class MobileNotificationDto {
  @IsDefined()
  title: string;
  @IsDefined()
  body: string;
  @IsDefined()
  event: string;
  @IsDefined()
  payload: string;
  @IsDefined()
  sender: string;
}
