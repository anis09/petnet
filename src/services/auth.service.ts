import { compareSync, hashSync } from 'bcrypt';
import crypto from 'crypto';
import { verify } from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import { ActivationStatus } from '../constants/enums';
import { errors } from '../constants/errors';
import { vars } from '../constants/vars';
import {
  CheckEmailReqDto,
  CheckEmailResDto,
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
  SignInUserWithAppleResDto,
  SignInUserWithFaceboookReqDto,
  SignInUserWithFaceboookResDto,
  SignInUserWithGoogleReqDto,
  SignInUserWithGoogleResDto,
  SignOutUserResDto,
  SignUpBreederReqDto,
  SignUpBreederResDto,
  SignUpUserReqDto,
  SignUpUserResDto,
  VerifyUserAccountReqDto,
  VerifyUserAccountResDto,
} from '../dtos/auth.dto';
import { Company } from '../interfaces/models/company.model.interface';
import { User } from '../interfaces/models/user.model.interface';
import { HttpException } from '../middlewares/error.middleware';
import { companyModel } from '../models/company.model';
import { userModel } from '../models/user.model';
import { generateAccessToken } from '../utils/auth';
import { Mailer } from '../utils/mailer';

class AuthService {
  private companies = companyModel;
  private users = userModel;

  public async checkEmail(input: CheckEmailReqDto): Promise<CheckEmailResDto> {
    let isExists: boolean = false;
    const foundUser: User = await this.users.findOne({
      'account.email': input.email.toLowerCase(),
      isArchived: false,
    });

    if (foundUser) {
      isExists = true;
    }

    return {
      isExists,
    };
  }

  public async signUpUser(input: SignUpUserReqDto): Promise<SignUpUserResDto> {
    const foundUser: User = await this.users.findOne({
      'account.email': input.email.toLowerCase(),
      isArchived: false,
    });
    if (foundUser) throw new HttpException(409, errors.EMAIL_ALREADY_EXISTS);

    const user: User = await this.users.create({
      account: {
        kind: 'STANDARD',
        activationStatus: 'ACTIVE',
        isVerified: false,
        verificationCode: crypto.randomBytes(32).toString('hex'),
        verificationExpireAt: new Date(
          new Date().setHours(
            new Date().getHours() + vars.verificationCodeExpInHours
          )
        ),
        registrationMethod: 'EMAIL',
        email: input.email.toLowerCase(),
        password: hashSync(input.password, 10),
      },
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
        state: input.state,
        suburb: input.suburb,
        zipCode: input.zipCode,
      },
      preferences: {
        notificationsIsAllowed: true,
        notifications: {
          likesIsEnabled: true,
          followsIsEnabled: true,
          messagesIsEnabled: true,
        },
        emailsIsAllowed: true,
        emails: {
          updatesIsEnabled: true,
          featuredOffersIsEnabled: true,
        },
      },
    });

    new Mailer(user.account.email, {
      name: user.profile.firstName,
      url: `${vars.appLink}/auth/verify-account/${user.account.verificationCode}`,
    }).sendVerifyAccount();

    return {
      success: true,
      userId: user._id,
    };
  }

  public async signUpBreeder(
    input: SignUpBreederReqDto
  ): Promise<SignUpBreederResDto> {
    const foundUser: User = await this.users.findOne({
      'account.email': input.email.toLowerCase(),
      isArchived: false,
    });
    if (foundUser) throw new HttpException(409, errors.EMAIL_ALREADY_EXISTS);

    const company: Company = await this.companies.create(input.company);

    const user: User = await this.users.create({
      account: {
        kind: 'BREEDER',
        companyId: company._id,
        activationStatus: 'ACTIVE',
        isVerified: false,
        registrationMethod: 'EMAIL',
        email: input.email.toLowerCase(),
        password: hashSync(input.password, 10),
      },
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
      preferences: {
        notificationsIsAllowed: true,
        notifications: {
          likesIsEnabled: true,
          followsIsEnabled: true,
          messagesIsEnabled: true,
        },
        emailsIsAllowed: true,
        emails: {
          updatesIsEnabled: true,
          featuredOffersIsEnabled: true,
        },
      },
    });

    return {
      success: true,
      userId: user._id,
      companyId: company._id,
    };
  }

  public async verifyUserAccount(
    input: VerifyUserAccountReqDto
  ): Promise<VerifyUserAccountResDto> {
    const foundUser: User = await this.users.findOne({
      'account.verificationCode': input.verificationCode,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    if (foundUser.account.isVerified)
      throw new HttpException(409, errors.ACCOUNT_ALREADY_VERIFIED);

    if (
      foundUser.account.verificationCode !== input.verificationCode ||
      foundUser.account.verificationExpireAt <= new Date()
    )
      throw new HttpException(409, errors.INVALID_VERIFICATION_CODE);

    await this.users.findOneAndUpdate(
      { 'account.verificationCode': input.verificationCode },
      {
        $set: {
          'account.isVerified': true,
          updatedAt: new Date(),
        },
        $unset: {
          'account.verificationCode': 1,
          'account.verificationExpireAt': 1,
        },
      }
    );

    return {
      success: true,
    };
  }

  public async resendVerificationCodeEmail(
    input: ResendVerificationCodeEmailReqDto
  ): Promise<ResendVerificationCodeEmailResDto> {
    const foundUser: User = await this.users.findOne({
      'account.email': input.email.toLowerCase(),
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    if (foundUser.account.isVerified)
      throw new HttpException(409, errors.ACCOUNT_ALREADY_VERIFIED);

    const updatedUser: User = await this.users.findOneAndUpdate(
      { 'account.email': input.email.toLowerCase() },
      {
        $set: {
          'account.verificationCode': crypto.randomBytes(32).toString('hex'),
          'account.verificationExpireAt': new Date(
            new Date().setHours(
              new Date().getHours() + vars.verificationCodeExpInHours
            )
          ),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    new Mailer(foundUser.account.email, {
      name: foundUser.profile.firstName,
      url: `${vars.appLink}/auth/verify-account/${updatedUser.account.verificationCode}`,
    }).sendVerifyAccount();

    return {
      success: true,
    };
  }

  public async sendPasswordResetEmail(
    input: SendPasswordResetEmailReqDto
  ): Promise<SendPasswordResetEmailResDto> {
    const foundUser: User = await this.users.findOne({
      'account.email': input.email.toLowerCase(),
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(409, errors.EMAIL_NOT_FOUND);

    const updatedUser: User = await this.users.findOneAndUpdate(
      { _id: foundUser._id },
      {
        $set: {
          'account.passwordRecoveryToken': crypto
            .randomBytes(32)
            .toString('hex'),
          'account.passwordRecoveryExpireAt': new Date(
            new Date().setHours(
              new Date().getHours() + vars.recoveryTokenExpInHours
            )
          ),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    new Mailer(foundUser.account.email, {
      name: foundUser.profile.firstName,
      url: `${vars.appLink}/reset-password/${updatedUser.account.passwordRecoveryToken}`,
    }).sendResetPassword();

    return {
      success: true,
    };
  }

  public async sendAdminPasswordResetEmail(
    input: SendPasswordResetEmailReqDto
  ): Promise<SendPasswordResetEmailResDto> {
    const foundUser: User = await this.users.findOne({
      'account.email': input.email.toLowerCase(),
      'account.kind': 'ADMIN',
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(409, errors.EMAIL_NOT_FOUND);

    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

    const updatedUser: User = await this.users.findOneAndUpdate(
      { _id: foundUser._id },
      {
        $set: {
          'account.passwordRecoveryToken': otp,
          'account.passwordRecoveryExpireAt': new Date(
            new Date().setHours(
              new Date().getHours() + vars.recoveryTokenExpInHours
            )
          ),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    new Mailer(foundUser.account.email, {
      name: foundUser.profile.firstName,
      otp,
    }).sendResetPasswordDash();

    return {
      success: true,
    };
  }

  public async resetPassword(
    input: ResetPasswordReqDto
  ): Promise<ResetPasswordResDto> {
    const foundUser: User = await this.users.findOne({
      'account.passwordRecoveryToken': input.passwordRecoveryToken,
      isArchived: false,
    });
    if (!foundUser || foundUser.account.passwordRecoveryExpireAt <= new Date())
      throw new HttpException(409, errors.INVALID_PASSWORD_RECOVERY_TOKEN);

    await this.users.findOneAndUpdate(
      { _id: foundUser._id },
      {
        $set: {
          'account.password': hashSync(input.newPassword, 10),
          'account.passwordRecoveredAt': new Date(),
          updatedAt: new Date(),
        },
        $unset: {
          'account.passwordRecoveryToken': 1,
          'account.passwordRecoveryExpireAt': 1,
        },
      }
    );

    return {
      success: true,
    };
  }

  public async resetAdminPassword(
    input: ResetPasswordReqDto
  ): Promise<ResetPasswordResDto> {
    const foundUser: User = await this.users.findOne({
      'account.passwordRecoveryToken': input.passwordRecoveryToken,
      'account.kind': 'ADMIN',
      isArchived: false,
    });
    if (!foundUser || foundUser.account.passwordRecoveryExpireAt <= new Date())
      throw new HttpException(409, errors.INVALID_PASSWORD_RECOVERY_TOKEN);

    await this.users.findOneAndUpdate(
      { _id: foundUser._id },
      {
        $set: {
          'account.password': hashSync(input.newPassword, 10),
          'account.passwordRecoveredAt': new Date(),
          updatedAt: new Date(),
        },
        $unset: {
          'account.passwordRecoveryToken': 1,
          'account.passwordRecoveryExpireAt': 1,
        },
      }
    );

    return {
      success: true,
    };
  }

  public async signInUser(input: SignInUserReqDto): Promise<SignInUserResDto> {
    let lastSignIn: string = '';
    const foundUser: User = await this.users.findOne({
      'account.email': input.email.toLowerCase(),
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(401, errors.WRONG_CREDENTIALS);

    if (foundUser.account.activationStatus === ActivationStatus.Blocked)
      throw new HttpException(409, errors.ACCOUNT_HAS_BEEN_BLOCKED);

    if (!compareSync(input.password, foundUser.account.password))
      throw new HttpException(401, errors.WRONG_CREDENTIALS);

    let updateQuery: any = {
      $set: {
        'account.lastSignIn': new Date(),
        updatedAt: new Date(),
      },
    };

    lastSignIn = foundUser.account.lastSignIn
      ? foundUser.account.lastSignIn.toDateString()
      : null;
    if (foundUser.account.activationStatus === ActivationStatus.Inactive) {
      updateQuery = {
        $set: {
          'account.activationStatus': ActivationStatus.Active,
          'account.lastSignIn': new Date(),
          updatedAt: new Date(),
        },
      };
    }

    await this.users.findOneAndUpdate({ _id: foundUser._id }, updateQuery);

    return {
      success: true,
      accessToken: generateAccessToken(foundUser._id),
      lastSignIn: lastSignIn == '' ? null : lastSignIn,
      userId: foundUser._id,
    };
  }

  public async signInAdmin(input: SignInUserReqDto): Promise<SignInAdminResDto> {
    let lastSignIn: string = '';
    const foundUser: User = await this.users.findOne({
      'account.email': input.email.toLowerCase(),
      'account.kind': 'ADMIN',
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(401, errors.WRONG_CREDENTIALS);

    if (foundUser.account.activationStatus === ActivationStatus.Blocked)
      throw new HttpException(409, errors.ACCOUNT_HAS_BEEN_BLOCKED);

    if (!compareSync(input.password, foundUser.account.password))
      throw new HttpException(401, errors.WRONG_CREDENTIALS);

    let updateQuery: any = {
      $set: {
        'account.lastSignIn': new Date(),
        updatedAt: new Date(),
      },
    };

    lastSignIn = foundUser.account.lastSignIn
      ? foundUser.account.lastSignIn.toDateString()
      : null;
    if (foundUser.account.activationStatus === ActivationStatus.Inactive) {
      updateQuery = {
        $set: {
          'account.activationStatus': ActivationStatus.Active,
          'account.lastSignIn': new Date(),
          updatedAt: new Date(),
        },
      };
    }

    await this.users.findOneAndUpdate({ _id: foundUser._id }, updateQuery);

    return {
      success: true,
      accessToken: generateAccessToken(foundUser._id),
      lastSignIn: lastSignIn == '' ? null : lastSignIn,
      data: {
        userId: foundUser._id,
        account: {
          kind: foundUser.account?.kind,
          isVerified: foundUser.account?.isVerified,
          email: foundUser.account?.email
        },
        profile: {
          firstName: foundUser.profile?.firstName,
          lastName: foundUser.profile?.lastName,
          phone: foundUser.profile?.phone,
          avatarUrl: foundUser.profile?.avatarUrl
        },
      }
    };
  }

  public async signOutUser(userId: string): Promise<SignOutUserResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(401, errors.WRONG_CREDENTIALS);

    await this.users.findOneAndUpdate(
      { _id: foundUser._id },
      {
        $set: {
          'account.lastSignOut': new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return {
      success: true,
    };
  }

  public async signOutAdmin(userId: string): Promise<SignOutUserResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      'account.kind': 'ADMIN',
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(401, errors.WRONG_CREDENTIALS);

    await this.users.findOneAndUpdate(
      { _id: foundUser._id },
      {
        $set: {
          'account.lastSignOut': new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return {
      success: true,
    };
  }

  public async refreshAccessToken(refreshToken: string): Promise<any> {
    if (refreshToken) {
      try {
        let decoded = verify(refreshToken, vars.jwtRefreshKey);
      } catch (error) {
        return {
          success: false,
          message: 'Invalid Token',
        };
      }
    } else {
      return {
        success: false,
        message: 'Invalid Token',
      };
    }
  }

  public async signInUserWithGoogle(
    input: SignInUserWithGoogleReqDto
  ): Promise<SignInUserWithGoogleResDto> {
    const foundUser: User = await this.users.findOne({
      $and: [
        {
          $or: [
            {
              'account.email': input.email
            },
            {
              $and: [
                {
                  'account.registrationMethod': 'GOOGLE'
                },
                {
                  'account.providerId': input.id
                }
              ]
            }
          ]
        },
        {
          isArchived: false
        }
      ]
    });

    if (foundUser) {
      let lastSignIn: string = '';
      let updateQuery: any = {
        $set: {
          'account.lastSignIn': new Date(),
          updatedAt: new Date(),
        },
      };
      lastSignIn = foundUser.account.lastSignIn
        ? foundUser.account.lastSignIn.toDateString()
        : null;
      if (foundUser.account.activationStatus === ActivationStatus.Inactive) {
        updateQuery = {
          $set: {
            'account.activationStatus': ActivationStatus.Active,
            'account.lastSignIn': new Date(),
            updatedAt: new Date(),
          },
        };
      }

      await this.users.findOneAndUpdate({ _id: foundUser._id }, updateQuery);

      return {
        success: true,
        accessToken: generateAccessToken(foundUser._id),
        lastSignIn: lastSignIn,
        userId: foundUser._id,
      };
    } else {
      const user: User = await this.users.create({
        account: {
          kind: 'STANDARD',
          activationStatus: 'ACTIVE',
          isVerified: true,
          registrationMethod: 'GOOGLE',
          providerId: input.id,
          email: input.email,
          lastSignIn: new Date(),
        },
        profile: {
          firstName: input.givenName,
          lastName: input.familyName,
          avatarUrl: input.picture,
        },
        preferences: {
          notificationsIsAllowed: true,
          notifications: {
            likesIsEnabled: true,
            followsIsEnabled: true,
            messagesIsEnabled: true,
          },
          emailsIsAllowed: true,
          emails: {
            updatesIsEnabled: true,
            featuredOffersIsEnabled: true,
          },
        },
      });

      return {
        success: true,
        accessToken: generateAccessToken(user._id),
        lastSignIn: null,
        userId: user._id,
      };
    }
  }

  public async signInUserWithFacebook(
    input: SignInUserWithFaceboookReqDto
  ): Promise<SignInUserWithFaceboookResDto> {
    const foundUser: User = await this.users.findOne({
      $and: [
        {
          $or: [
            {
              'account.email': input.email
            },
            {
              $and: [
                {
                  'account.registrationMethod': 'FACEBOOK'
                },
                {
                  'account.providerId': input.id
                }
              ]
            }
          ]
        },
        {
          isArchived: false
        }
      ]
    });

    if (foundUser) {
      let lastSignIn: string = '';
      let updateQuery: any = {
        $set: {
          'account.lastSignIn': new Date(),
          updatedAt: new Date(),
        },
      };

      if (foundUser.account.activationStatus === ActivationStatus.Inactive) {
        lastSignIn = foundUser.account.lastSignIn
          ? foundUser.account.lastSignIn.toDateString()
          : null;
        updateQuery = {
          $set: {
            'account.activationStatus': ActivationStatus.Active,
            'account.lastSignIn': new Date(),
            updatedAt: new Date(),
          },
        };
      }

      await this.users.findOneAndUpdate({ _id: foundUser._id }, updateQuery);

      return {
        success: true,
        accessToken: generateAccessToken(foundUser._id),
        lastSignIn: lastSignIn,
        userId: foundUser._id,
      };
    } else {
      const user: User = await this.users.create({
        account: {
          kind: 'STANDARD',
          activationStatus: 'ACTIVE',
          isVerified: true,
          registrationMethod: 'FACEBOOK',
          providerId: input.id,
          email: input.email,
          lastSignIn: new Date(),
        },
        profile: {
          firstName: input.firstName,
          lastName: input.lastName,
          avatarUrl: input.picture,
        },
        preferences: {
          notificationsIsAllowed: true,
          notifications: {
            likesIsEnabled: true,
            followsIsEnabled: true,
            messagesIsEnabled: true,
          },
          emailsIsAllowed: true,
          emails: {
            updatesIsEnabled: true,
            featuredOffersIsEnabled: true,
          },
        },
      });

      return {
        success: true,
        accessToken: generateAccessToken(user._id),
        lastSignIn: null,
        userId: user._id,
      };
    }
  }

  public async signInUserWithApple(
    input: SignInUserWithAppleReqDto
  ): Promise<SignInUserWithAppleResDto> {
    const foundUser: User = await this.users.findOne({
      $and: [
        {
          $or: [
            {
              'account.email': input.email
            },
            {
              $and: [
                {
                  'account.registrationMethod': 'APPLE'
                },
                {
                  'account.providerId': input.id
                }
              ]
            }
          ]
        },
        {
          isArchived: false
        }
      ]
    });

    if (foundUser) {
      let lastSignIn: string = '';
      let updateQuery: any = {
        $set: {
          'account.lastSignIn': new Date(),
          updatedAt: new Date(),
        },
      };

      if (foundUser.account.activationStatus === ActivationStatus.Inactive) {
        lastSignIn = foundUser.account.lastSignIn
          ? foundUser.account.lastSignIn.toDateString()
          : null;
        updateQuery = {
          $set: {
            'account.activationStatus': ActivationStatus.Active,
            'account.lastSignIn': new Date(),
            updatedAt: new Date(),
          },
        };
      }

      await this.users.findOneAndUpdate({ _id: foundUser._id }, updateQuery);

      return {
        success: true,
        accessToken: generateAccessToken(foundUser._id),
        lastSignIn: lastSignIn,
        userId: foundUser._id,
      };
    } else {
      const user: User = await this.users.create({
        account: {
          kind: 'STANDARD',
          activationStatus: 'ACTIVE',
          isVerified: true,
          registrationMethod: 'APPLE',
          providerId: input.id,
          email: input.email,
          lastSignIn: new Date(),
        },
        profile: {
          firstName: input.name?.firstName,
          lastName: input.name?.lastName
        },
        preferences: {
          notificationsIsAllowed: true,
          notifications: {
            likesIsEnabled: true,
            followsIsEnabled: true,
            messagesIsEnabled: true,
          },
          emailsIsAllowed: true,
          emails: {
            updatesIsEnabled: true,
            featuredOffersIsEnabled: true,
          },
        },
      });

      return {
        success: true,
        accessToken: generateAccessToken(user._id),
        lastSignIn: null,
        userId: user._id,
      };
    }
  }
}

export default AuthService;
