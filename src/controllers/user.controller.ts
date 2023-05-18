import { NextFunction, Request, Response } from "express";
import {
  CreateUserReqDto,
  CreateUserResDto,
  DeleteCurrentUserResDto,
  DeleteUserResDto,
  GetCurrentAdminResDto,
  GetCurrentUserResDto,
  GetUserProfileResDto,
  GetUsersReqDto,
  GetUsersResDto,
  UpdateCompanyReqDto,
  UpdateCompanyResDto,
  UpdateCurrentUserReqDto,
  UpdateCurrentUserResDto,
  UpdatePasswordReqDto,
  UpdatePasswordResDto,
  UpdateUserActivationStatusReqDto,
  UpdateUserActivationStatusResDto,
  UpdateUserReqDto,
  UpdateUserResDto,
} from "../dtos/user.dto";
import { RequestWithUser } from "../interfaces/auth.interface";
import UserService from "../services/user.service";

class UserController {
  private userService = new UserService();

  public getCurrentUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetCurrentUserResDto =
        await this.userService.getCurrentUser(req.user);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetCurrentUserResDto =
        await this.userService.getCurrentUser(req.params.userId);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public updateCurrentUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: UpdateCurrentUserReqDto = req.body;
      const outputData: UpdateCurrentUserResDto =
        await this.userService.updateCurrentUser(req.user, inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updateCompany = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: UpdateCompanyReqDto = req.body;
      const outputData: UpdateCompanyResDto =
        await this.userService.updateCompany(req.user, inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updatePassword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: UpdatePasswordReqDto = req.body;
      const outputData: UpdatePasswordResDto =
        await this.userService.updatePassword(req.user, inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updateAdminPassword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: UpdatePasswordReqDto = req.body;
      const outputData: UpdatePasswordResDto =
        await this.userService.updateAdminPassword(req.user, inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public deleteCurrentUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: DeleteCurrentUserResDto =
        await this.userService.deleteCurrentUser(req.user);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getAllUsers = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageNumber, pageSize, userKind, search }: GetUsersReqDto =
        req.query as any;
      const allUsersResp: GetUsersResDto = await this.userService.getAllUsers(
        pageNumber,
        pageSize,
        userKind,
        search
      );

      res.status(200).json(allUsersResp);
    } catch (error) {
      next(error);
    }
  };

  public getCurrentAdmin = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: GetCurrentAdminResDto =
        await this.userService.getCurrentAdmin(req.user);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: CreateUserReqDto = req.body;
      const outputData: CreateUserResDto = await this.userService.createUser(
        inputData
      );

      res.status(201).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getUserProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params as any;
      const { pageNumber, pageSize } = req.query as any;
      const outputData: GetUserProfileResDto =
        await this.userService.getUserProfile(
          pageNumber,
          pageSize,
          userId,
          req.user
        );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params as any;
      const inputData: UpdateUserReqDto = req.body;
      const outputData: UpdateUserResDto = await this.userService.updateUser(
        userId,
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public updateUserActivationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params as any;
      const inputData: UpdateUserActivationStatusReqDto = req.body;
      const outputData: UpdateUserActivationStatusResDto =
        await this.userService.updateUserActivationStatus(userId, inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params as any;
      const outputData: DeleteUserResDto = await this.userService.deleteUser(
        userId
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const outputData: any = await this.userService.getUsers();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public countUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: any = await this.userService.countUser();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public countUsersByDate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: any = await this.userService.countUserByDate();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public countByLastSignIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { year } = req.query as any;
      const outputData: any = await this.userService.lastSignInUserCount(
        Number(year)
      );
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public countUsersByState = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: any = await this.userService.countUsersByState();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
