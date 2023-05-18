import axios from "axios";
import fetch from 'cross-fetch';
import { NextFunction, Request, Response } from "express";
import FormData from "form-data";
import { vars } from "../constants/vars";
import { errors } from '../constants/errors';
import {
  CheckEmailReqDto,
  CheckEmailResDto,
  RefreshTokenReqDto,
  ResendVerificationCodeEmailReqDto,
  ResendVerificationCodeEmailResDto,
  ResetPasswordReqDto,
  ResetPasswordResDto,
  SendPasswordResetEmailReqDto,
  SendPasswordResetEmailResDto,
  SignInAdminResDto,
  SignInUserReqDto,
  SignInUserResDto,
  SignInUserWithAppleReqDto,
  SignInUserWithFaceboookReqDto,
  SignInUserWithFaceboookResDto,
  SignInUserWithGoogleReqDto,
  SignInUserWithGoogleResDto,
  SignInUserWithReqDto,
  SignInWithAppleReqDto,
  SignOutUserResDto,
  SignUpBreederReqDto,
  SignUpBreederResDto,
  SignUpUserReqDto,
  SignUpUserResDto,
  VerifyUserAccountReqDto,
  VerifyUserAccountResDto,
} from "../dtos/auth.dto";
import { RequestWithUser } from "../interfaces/auth.interface";
import { HttpException } from '../middlewares/error.middleware';
import AuthService from "../services/auth.service";

class AuthController {
  private authService = new AuthService();

  public checkEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: CheckEmailReqDto = req.query as any;
      const outputData: CheckEmailResDto = await this.authService.checkEmail(
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signUpUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SignUpUserReqDto = req.body;
      const outputData: SignUpUserResDto = await this.authService.signUpUser(
        inputData
      );

      res.status(201).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signUpBreeder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SignUpBreederReqDto = req.body;
      const outputData: SignUpBreederResDto = await this.authService.signUpBreeder(
        inputData
      );

      res.status(201).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public verifyUserAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: VerifyUserAccountReqDto = req.body;
      const outputData: VerifyUserAccountResDto =
        await this.authService.verifyUserAccount(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public resendVerificationCodeEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: ResendVerificationCodeEmailReqDto = req.body;
      const outputData: ResendVerificationCodeEmailResDto =
        await this.authService.resendVerificationCodeEmail(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: ResetPasswordReqDto = req.body;
      const outputData: ResetPasswordResDto =
        await this.authService.resetPassword(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public resetAdminPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: ResetPasswordReqDto = req.body;
      const outputData: ResetPasswordResDto =
        await this.authService.resetAdminPassword(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public sendPasswordResetEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SendPasswordResetEmailReqDto = req.body;
      const outputData: SendPasswordResetEmailResDto =
        await this.authService.sendPasswordResetEmail(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public sendAdminPasswordResetEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SendPasswordResetEmailReqDto = req.body;
      const outputData: SendPasswordResetEmailResDto =
        await this.authService.sendAdminPasswordResetEmail(inputData);

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signInUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SignInUserReqDto = req.body;
      const outputData: SignInUserResDto = await this.authService.signInUser(
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signInAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SignInUserReqDto = req.body;
      const outputData: SignInAdminResDto = await this.authService.signInAdmin(
        inputData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signInWithGoogle = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SignInUserWithReqDto = req.body;

      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${inputData.accessToken}`
        }
      });

      if (response.status !== 200) {
        throw new HttpException(401, errors.WRONG_CREDENTIALS);
      }

      const successResponse = await response.json();

      let picture;
      if (successResponse.picture) {
        const { data: stream } = await axios.get(successResponse.picture, {
          responseType: 'stream',
        });

        const formData = new FormData();
        formData.append('file', stream);

        const { data } = await axios.post(`${vars.host}/api/v1/upload/s3`, formData);
        if (data?.files?.length > 0) {
          picture = data?.files[0]?.url;
        }
      }

      const googleData: SignInUserWithGoogleReqDto = {
        id: successResponse.sub,
        email: successResponse.email,
        givenName: successResponse.given_name,
        familyName: successResponse.family_name,
        picture
      };
      const outputData: SignInUserWithGoogleResDto = await this.authService.signInUserWithGoogle(
        googleData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signInWithFacebook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SignInUserWithReqDto = req.body;

      const response = await fetch(`https://graph.facebook.com/v2.10/me?access_token=${inputData.accessToken}&fields=id,email,first_name,last_name,picture.width(512).height(512)`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new HttpException(401, errors.WRONG_CREDENTIALS);
      }

      const successResponse = await response.json();

      let picture;
      if (successResponse.picture?.data?.url) {
        const { data: stream } = await axios.get(successResponse.picture?.data?.url, {
          responseType: 'stream',
        });

        const formData = new FormData();
        formData.append('file', stream);

        const { data } = await axios.post(`${vars.host}/api/v1/upload/s3`, formData);
        if (data?.files?.length > 0) {
          picture = data?.files[0]?.url;
        }
      }

      const facebookData: SignInUserWithFaceboookReqDto = {
        id: successResponse.id,
        email: successResponse.email,
        firstName: successResponse.first_name,
        lastName: successResponse.last_name,
        picture
      };
      const outputData: SignInUserWithFaceboookResDto = await this.authService.signInUserWithFacebook(
        facebookData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signInWithApple = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: SignInWithAppleReqDto = req.body;

      const appleData: SignInUserWithAppleReqDto = {
        id: inputData.userIdentifier,
        email: inputData.email,
        name: {
          firstName: inputData.givenName,
          lastName: inputData.familyName
        }
      };

      const outputData: SignInUserResDto = await this.authService.signInUserWithApple(
        appleData
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signOutUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: SignOutUserResDto = await this.authService.signOutUser(
        req.user
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public signOutAdmin = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const outputData: SignOutUserResDto = await this.authService.signOutAdmin(
        req.user
      );

      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let { refreshToken }: RefreshTokenReqDto = req.cookies as any;
      let outputData: any = await this.authService.refreshAccessToken(
        refreshToken
      );
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
