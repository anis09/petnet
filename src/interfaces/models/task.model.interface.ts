export interface Task {
    _id: string;
    status: string;
    name: string;
    description: string;
    attachments: [
        {
            url: string;
        }
    ];
    assignee: string;
    reporter: string;
    priority: string;
    dueDate: Date;
    comments: [
        {
            commentType: string;
            body: string;
            postedBy: string;
            postedAt: Date;
        }
    ];
    createdAt?: Date;
    updatedAt?: Date;
};