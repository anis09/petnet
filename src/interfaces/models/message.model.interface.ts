export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    messageType: string;
    body: string;
    sentAt: Date;
    seenAt: Date;
};