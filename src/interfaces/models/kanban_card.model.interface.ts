export interface KanbanCard {
  _id: string;
  kanbanColumnId: string;
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
      _id: string;
      avatar: string;
      name: string;
      messageType: string;
      message: string;
      postedBy: string;
      createdAt: Date;
    }
  ];
  createdAt?: Date;
  updatedAt?: Date;
}
