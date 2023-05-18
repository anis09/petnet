import ChatController from '../../controllers/chat.controller';
import { SendMessageReqDto } from '../../dtos/chat.dto';
import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware';
import { Routes } from '../../interfaces/routes.interface';
import validationMiddleware from '../../middlewares/validation.middleware';

class ChatRouteV1 implements Routes {
  public path = '/api/v1/chat';
  public adminPath = "/api/v1/admin/chat";
  public router = Router();
  public chatController = new ChatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/messages`,
      authMiddleware,
      validationMiddleware(SendMessageReqDto, 'body'),
      this.chatController.sendMessage
    );

    this.router.post(
      `${this.adminPath}/messages`,
      authMiddleware,
      validationMiddleware(SendMessageReqDto, 'body'),
      this.chatController.sendMessage
    );

    this.router.get(
      `${this.path}/conversations`,
      authMiddleware,
      this.chatController.getConversations
    );

    this.router.get(
      `${this.adminPath}/conversations`,
      authMiddleware,
      this.chatController.getConversations
    );

    this.router.get(
      `${this.path}/conversations/user`,
      authMiddleware,
      this.chatController.getConversationUser
    );

    this.router.get(
      `${this.adminPath}/conversations/user`,
      authMiddleware,
      this.chatController.getConversationUser
    );

    this.router.get(
      `${this.path}/messages`,
      authMiddleware,
      this.chatController.getMessages
    );

    this.router.get(
      `${this.adminPath}/messages`,
      authMiddleware,
      this.chatController.getMessages
    );
  }
}

export default ChatRouteV1;
