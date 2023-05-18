import { IsDefined, IsEmail, IsIn, IsInt, IsOptional } from "class-validator";

export class GetTasksReqDto {
  @IsDefined()
  public pageNumber: string;

  @IsDefined()
  public pageSize: string;

  @IsDefined()
  @IsIn(["TO_DO", "IN_PROGRESS", "DONE"])
  public status: string;
}

export class GetTasksResDto {
  public total: number;
  public tasks: TaskDto[];
}

export class TaskDto {
  public taskId: string;
  public status: string;
  public name: string;
  public description: string;
  public attachments: [
    {
      url: string;
    }
  ];
  public assignee: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  public reporter: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  public priority: string;
  public dueDate: Date;
  public createdAt: Date;
  public updatedAt: Date;
}

export class CreateTaskReqDto {
  @IsDefined()
  @IsIn(["TO_DO", "IN_PROGRESS", "DONE"])
  public status: string;

  @IsDefined()
  public name: string;

  public description: string;
  public attachments: [
    {
      url: string;
    }
  ];
  public assignee: string;
  public reporter: string;
  public priority: string;
  public dueDate: Date;
}

export class CreateTaskResDto {
  public success: boolean;
  public taskId: string;
}

export class GetTaskResDto {
  public taskId: string;
  public status: string;
  public name: string;
  public description: string;
  public attachments: [
    {
      url: string;
    }
  ];
  public assignee: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  public reporter: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  public priority: string;
  public dueDate: Date;
  public comments: [
    {
      commentType: string;
      body: string;
      postedBy: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
      };
      postedAt: Date;
    }
  ];
  public createdAt: Date;
  public updatedAt: Date;
}

export class UpdateTaskReqDto {
  @IsOptional()
  @IsIn(["TO_DO", "IN_PROGRESS", "DONE"])
  public status: string;

  public name: string;
  public description: string;
  public attachments: [
    {
      url: string;
    }
  ];
  public assignee: string;
  public reporter: string;
  public priority: string;
  public dueDate: Date;
}

export class UpdateTaskResDto {
  public success: boolean;
}

export class AddTaskCommentReqDto {
  public commentType: string;
  public body: string;
}

export class AddTaskCommentResDto {
  public success: boolean;
}

export class EditTaskCommentReqDto {
  public taskCommentId: string;
  public commentType: string;
  public body: string;
}

export class EditTaskCommentResDto {
  public success: boolean;
}

export class RemoveTaskCommentReqDto {
  public taskCommentId: string;
}

export class RemoveTaskCommentResDto {
  public success: boolean;
}

export class DeleteTaskResDto {
  public success: boolean;
}