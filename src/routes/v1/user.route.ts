import UserController from "../../controllers/user.controller";
import {
  CreateUserReqDto,
  UpdateCompanyReqDto,
  UpdateCurrentUserReqDto,
  UpdateUserActivationStatusReqDto,
  UpdateUserReqDto,
} from "../../dtos/user.dto";
import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { Routes } from "../../interfaces/routes.interface";
import validationMiddleware from "../../middlewares/validation.middleware";

class UserRouteV1 implements Routes {
  public path = "/api/v1/users";
  public adminUsersPath = "/api/v1/admin/users";
  public adminUserPath = "/api/v1/admin/user";
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/:userId`,
      authMiddleware,
      this.userController.getUserById
    );
    this.router.get(
      this.path,
      authMiddleware,
      this.userController.getCurrentUser
    );
    this.router.get(
      this.adminUserPath,
      authMiddleware,
      this.userController.getCurrentAdmin
    );
    this.router.put(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(UpdateCurrentUserReqDto, "body"),
      this.userController.updateCurrentUser
    );
    this.router.put(
      `${this.adminUserPath}-update`,
      authMiddleware,
      validationMiddleware(UpdateCurrentUserReqDto, "body"),
      this.userController.updateCurrentUser
    );

    this.router.put(
      `${this.path}/company`,
      authMiddleware,
      validationMiddleware(UpdateCompanyReqDto, "body"),
      this.userController.updateCompany
    );

    this.router.post(
      `${this.path}/password`,
      authMiddleware,
      this.userController.updatePassword
    );

    this.router.post(
      `${this.adminUserPath}/password`,
      authMiddleware,
      this.userController.updatePassword
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware,
      this.userController.deleteCurrentUser
    );

    this.router.get(
      `${this.adminUsersPath}`,
      authMiddleware,
      this.userController.getAllUsers
    );
    this.router.get(
      `${this.adminUsersPath}-all`,
      authMiddleware,
      this.userController.getUsers
    );

    this.router.post(
      `${this.adminUsersPath}`,
      authMiddleware,
      //validationMiddleware(CreateUserReqDto, "body"),
      this.userController.createUser
    );
    this.router.get(
      `${this.adminUsersPath}-count`,
      this.userController.countUsers
    );
    this.router.get(
      `${this.adminUsersPath}-date`,
      this.userController.countUsersByDate
    );
    this.router.get(
      `${this.adminUsersPath}-online`,
      this.userController.countByLastSignIn
    );
    this.router.get(
      `${this.adminUsersPath}-state`,
      this.userController.countUsersByState
    );
    this.router.get(
      `${this.adminUsersPath}/:userId`,
      authMiddleware,
      this.userController.getUserProfile
    );

    this.router.put(
      `${this.adminUsersPath}/:userId`,
      authMiddleware,
      // validationMiddleware(UpdateUserReqDto, "body"),
      this.userController.updateUser
    );

    this.router.patch(
      `${this.adminUsersPath}/:userId`,
      authMiddleware,
      validationMiddleware(UpdateUserActivationStatusReqDto, "body"),
      this.userController.updateUserActivationStatus
    );

    this.router.delete(
      `${this.adminUsersPath}/:userId`,
      authMiddleware,
      this.userController.deleteUser
    );
  }
}

export default UserRouteV1;
