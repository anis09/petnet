import { IsDefined, IsIn, IsMongoId, IsOptional } from "class-validator";

export class SendMessageReqDto {
    @IsDefined()
    @IsMongoId()
    public receiverId: string;

    @IsDefined()
    @IsIn(["TEXT", "IMAGE", "FILE"])
    public messageType: string;

    @IsDefined()
    public body: string;
};

export class SendMessageResDto {
    public success: boolean;
    public conversationId: string;
};

export class GetConversationsReqDto {
    @IsDefined()
    public pageNumber: string;

    @IsDefined()
    public pageSize: string;

    @IsOptional()
    public search: string;
};

export class GetConversationsResDto {
    public total: number;
    public conversations: ConversationDto[];
};

export class ConversationDto {
    public conversationId: string;
    public user: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
    public lastMessage: {
        messageType: string;
        body: string;
        sentAt: Date;
    };
    public unseen: number;
};

export class GetConversationUserReqDto {
    @IsDefined()
    @IsMongoId()
    public conversationId: string;
};

export class GetConversationUserResDto {
    public user: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
};

export class GetMessagesReqDto {
    @IsDefined()
    public pageNumber: string;

    @IsDefined()
    public pageSize: string;

    @IsDefined()
    @IsMongoId()
    public conversationId: string;
};

export class GetMessagesResDto {
    public total: number;
    public hasNext: boolean;
    public pageNumber: string;
    public messages: MessageDto[];
};

export class MessageAggDto {
    public user: {
        userId: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
    };
    public messageId: string;
    public senderType: string;
    public messageType: string;
    public body: string;
    public sentAt: Date;
    public seenAt: Date;
};

export class MessageDto {
    public messageId: string;
    public senderType: string;
    public messageType: string;
    public body: string;
    public sentAt: Date;
    public seenAt: Date;
};

export class MessageLimitDto {
    public diff: number;
};

export class ConversationMemberDto {
    public member: string;
};