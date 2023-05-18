import "reflect-metadata";
import { Type } from "class-transformer";
import {
  IsDefined,
  IsEmail,
  IsInt,
  IsMongoId,
  IsObject,
  IsOptional,
  ValidateNested,
} from "class-validator";

export class CheckEmailReqDto {
  @IsDefined()
  @IsEmail()
  public email: string;
}

export class CheckEmailResDto {
  public isExists: boolean;
}

export class SignUpUserReqDto {
  @IsDefined()
  @IsEmail()
  public email: string;

  @IsDefined()
  public password: string;

  @IsDefined()
  public firstName: string;

  @IsDefined()
  public lastName: string;

  @IsDefined()
  public state: string;

  @IsDefined()
  public suburb: string;

  @IsDefined()
  @IsInt()
  public zipCode: number;
}

export class SignUpUserResDto {
  public success: boolean;
  public userId: string;
}

export class CompanyDto {
  @IsDefined()
  public name: string;

  @IsDefined()
  public breederPrefix: string;

  @IsDefined()
  @IsEmail()
  public email: string;

  @IsDefined()
  public phone: string;

  @IsDefined()
  public state: string;

  @IsDefined()
  public suburb: string;

  @IsDefined()
  public address: string;

  @IsDefined()
  @IsInt()
  public zipCode: number;

  @IsDefined()
  public bio: string;
}

export class SignUpBreederReqDto {
  @IsDefined()
  @IsEmail()
  public email: string;

  @IsDefined()
  public password: string;

  @IsDefined()
  public firstName: string;

  @IsDefined()
  public lastName: string;

  @IsDefined()
  public phone: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CompanyDto)
  public company: string;
}

export class SignUpBreederResDto {
  public success: boolean;
  public userId: string;
  public companyId: string;
}

export class VerifyUserAccountReqDto {
  @IsDefined()
  public verificationCode: string;
}

export class VerifyUserAccountResDto {
  public success: boolean;
}

export class ResendVerificationCodeEmailReqDto {
  @IsDefined()
  @IsEmail()
  public email: string;
}

export class ResendVerificationCodeEmailResDto {
  public success: boolean;
}

export class SendPasswordResetEmailReqDto {
  @IsDefined()
  @IsEmail()
  public email: string;
}

export class SendPasswordResetEmailResDto {
  public success: boolean;
}

export class ResetPasswordReqDto {
  @IsDefined()
  public passwordRecoveryToken: string;

  @IsDefined()
  public newPassword: string;
}

export class ResetPasswordResDto {
  public success: boolean;
}

export class SignInUserReqDto {
  @IsDefined()
  @IsEmail()
  public email: string;

  @IsDefined()
  public password: string;
}

export class SignInUserWithReqDto {
  @IsDefined()
  public accessToken: string;
}

export class SignInWithAppleReqDto {
  @IsDefined()
  public userIdentifier: string;

  @IsOptional()
  public email: string;

  @IsOptional()
  public familyName: string;

  @IsOptional()
  public givenName: string;
}

export class SignInUserResDto {
  public success: boolean;
  public accessToken: string;
  public lastSignIn?: string;
  userId: string;
}

export class SignInUserWithGoogleReqDto {
  public id: string;
  public email: string;
  public givenName: string;
  public familyName: string;
  public picture: string;
}

export class SignInUserWithGoogleResDto {
  public success: boolean;
  public accessToken: string;
  public lastSignIn?: string;
  public userId: string;
}

export class SignInUserWithFaceboookReqDto {
  public id: string;
  public email: string;
  public firstName: string;
  public lastName: string;
  public picture: string;
}

export class SignInUserWithFaceboookResDto {
  public success: boolean;
  public accessToken: string;
  public lastSignIn?: string;
  public userId: string;
}

export class SignInUserWithAppleReqDto {
  public id: string;
  public email: string;
  public name: {
    firstName: string;
    lastName: string;
  };
}

export class SignInUserWithAppleResDto {
  public success: boolean;
  public accessToken: string;
  public lastSignIn?: string;
  public userId: string;
}

export class SignOutUserResDto {
  public success: boolean;
}

export class RefreshTokenReqDto {
  refreshToken: string;
}

export class SignInAdminResDto {
  public success: boolean;
  public accessToken: string;
  public lastSignIn?: string;
  public data: {
    userId: string;
    account: {
      kind: string;
      isVerified: boolean;
      email: string;
    };
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      avatarUrl?: string;
    };
  }
}
