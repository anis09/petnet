import {
  GetConversationsReqDto,
  GetConversationsResDto,
  GetConversationUserReqDto,
  GetConversationUserResDto,
  GetMessagesReqDto,
  GetMessagesResDto,
  SendMessageReqDto,
  SendMessageResDto,
} from "../dtos/chat.dto";
import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../interfaces/auth.interface";
import ChatService from "../services/chat.service";

class ChatController {
  private chatService = new ChatService();

  public sendMessage = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SendMessageReqDto = req.body;
     
      const outputData: SendMessageResDto = await this.chatService.sendMessage(
        req.user,
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getConversations = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: GetConversationsReqDto = req.query as any;

      const outputData: GetConversationsResDto =
        await this.chatService.getConversations(
          req.user,
          inputData.pageNumber,
          inputData.pageSize,
          inputData.search
        );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getConversationUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: GetConversationUserReqDto= req.query as any;

      const outputData: GetConversationUserResDto = await this.chatService.getConversationUser(
        req.user,
        inputData.conversationId
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: GetMessagesReqDto = req.query as any;

      const outputData: GetMessagesResDto = await this.chatService.getMessages(
        req.user,
        inputData.pageNumber,
        inputData.pageSize,
        inputData.conversationId
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
}

export default ChatController;
