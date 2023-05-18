import { IsDefined, IsMongoId } from "class-validator";

export class GetKanbanResDto {
  board: {
    cards: [
      {
        id: string;
        name: string;
        description: string;
        attachments: string[];
        assignee: [
          {
            id: string;
            name: string;
            avatar: string;
          }
        ];
        reporter: [
          {
            id: string;
            name: string;
            avatar: string;
          }
        ];
        priority: string;
        due: number[];
        isCompleted: boolean;
        comments: [
          {
            id: string;
            name: string;
            avatar: string;
            messageType: string;
            message: string;
            createdAt: Date;
          }
        ];
      }
    ];
    columns: [
      {
        id: string;
        name: string;
        cardIds: string[];
      }
    ];
    columnOrder: string[];
  };
}

export class UpdateKanbanReqDto {
  columns: [
    {
      id: string;
      name: string;
      cardIds: string[];
    }
  ];
}

export class UpdateKanbanResDto {
  public success: boolean;
}

export class CreateKanbanColumnReqDto {
  @IsDefined()
  public name: string;
}

export class CreateKanbanColumnResDto {
  public success: boolean;
  public kanbanColumnId: string;
}

export class UpdateKanbanColumnReqDto {
  public name: string;
}

export class UpdateKanbanColumnResDto {
  public success: boolean;
}

export class DeleteKanbanColumnResDto {
  public success: boolean;
}

export class SetKanbanColumnsPositionReqDto {
  public ids: string[];
}

export class SetKanbanColumnsPositionResDto {
  public success: boolean;
}

export class CreateKanbanCardReqDto {
  @IsDefined()
  @IsMongoId()
  public kanbanColumnId: string;

  @IsDefined()
  public name: string;

  public description: string;
  public attachments: string[];
  public assignee: string;
  public reporter: string;
  public priority: string;
  public due: number[];
  public isCompleted: boolean;
}

export class CreateKanbanCardResDto {
  public success: boolean;
  public kanbanCardId: string;
}

export class UpdateKanbanCardReqDto {
  public name: string;
  public description: string;
  public attachments: string[];
  public assignee: { id: string, name: string, avatar: string }[];
  // public reporter: string;
  public priority: string;
  public due: number[];
  public isCompleted: boolean;
}

export class UpdateKanbanCardResDto {
  public success: boolean;
}

export class AddKanbanCardCommentReqDto {
  public messageType: string;
  public message: string;
}

export class AddKanbanCardCommentResDto {
  public success: boolean;
  public id:string;
  avatar: string;
  name: string;
  createdAt: Date | string | number;
  messageType: "image" | "text";
  message: string;
}

export class EditKanbanCardCommentReqDto {
  public kanbanCardCommentId: string;
  public messageType: string;
  public message: string;
}

export class EditKanbanCardCommentResDto {
  public success: boolean;
}

export class RemoveKanbanCardCommentReqDto {
  public kanbanCardCommentId: string;
}

export class RemoveKanbanCardCommentResDto {
  public success: boolean;
}

export class DeleteKanbanCardResDto {
  public success: boolean;
}
