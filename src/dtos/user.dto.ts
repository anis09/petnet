import { IsDefined, IsEmail, IsIn, IsInt, IsOptional } from "class-validator";

export class GetCurrentUserResDto {
  public userId: string;
  public deviceId?: string;
  public account: {
    kind: string;
    isVerified: boolean;
    email: string;
  };
  public profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    state: string;
    suburb: string;
    address?: string;
    zipCode?: number;
    bio?: string;
    avatarUrl?: string;
  };
  public company: {
    companyId: string;
    name: string;
    breederPrefix: string;
    email: string;
    phone: string;
    state: string;
    suburb: string;
    address: string;
    zipCode: number;
    bio: string;
    website: string;
    logo: string;
    cover: string;
  };
  public preferences: {
    notificationsIsAllowed?: boolean;
    notifications?: {
      likesIsEnabled?: boolean;
      followsIsEnabled?: boolean;
      messagesIsEnabled?: boolean;
    };
    emailsIsAllowed?: boolean;
    emails?: {
      updatesIsEnabled?: boolean;
      featuredOffersIsEnabled?: boolean;
    };
  };
}

export class UpdateCurrentUserReqDto {
  @IsOptional()
  @IsEmail()
  public email: string;

  @IsOptional()
  public firstName: string;

  @IsOptional()
  public lastName: string;

  @IsOptional()
  public phone: string;

  @IsOptional()
  public state: string;

  @IsOptional()
  public suburb: string;

  @IsOptional()
  public address: string;

  @IsOptional()
  @IsInt()
  public zipCode: number;

  @IsOptional()
  public bio: string;

  @IsOptional()
  public avatarUrl: string;

  @IsOptional()
  public deviceId: string;
}

export class UpdateCurrentUserResDto {
  public success: boolean;
}

export class UpdateCompanyReqDto {
  @IsOptional()
  public name: string;

  @IsOptional()
  public breederPrefix: string;

  @IsOptional()
  @IsEmail()
  public email: string;

  @IsOptional()
  public phone: string;

  @IsOptional()
  public state: string;

  @IsOptional()
  public suburb: string;

  @IsOptional()
  public address: string;

  @IsOptional()
  @IsInt()
  public zipCode: number;

  @IsOptional()
  public bio: string;

  @IsOptional()
  public website: string;

  @IsOptional()
  public logo: string;

  @IsOptional()
  public cover: string;
}

export class UpdateCompanyResDto {
  public success: boolean;
}

export class UpdatePasswordReqDto {
  @IsDefined()
  public oldPassword: string;

  @IsDefined()
  public newPassword: string;
}

export class UpdatePasswordResDto {
  public success: boolean;
}

export class DeleteCurrentUserResDto {
  public success: boolean;
}

export class GetUsersReqDto {
  @IsDefined()
  public pageNumber: string;

  @IsDefined()
  public pageSize: string;

  @IsOptional()
  @IsIn(["STANDARD", "BREEDER", "ADMIN"])
  public userKind: string;

  @IsOptional()
  public search: string;
}

export class GetUsersResDto {
  public total: number;
  public users: UserDto[];
}

export class UserOnlineByMonthDto {
  public _id: string;
  public count: number;
}
export class UsersOnlineByMonthResDto {
  public success: boolean;
  public result: UserOnlineByMonthDto[];
}
export class UserDto {
  public userId: string;
  public firstName: string;
  public lastName: string;
  public avatarUrl: string;
  public kind: string;
  public activationStatus: string;
  public isVerified: boolean;
  public registrationMethod: string;
  public email: string;
  public phone: string;
}

export class GetCurrentAdminResDto {
  public userId: string;
  public account: {
    kind: string;
    isVerified: boolean;
    email: string;
  };
  public profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    state: string;
    suburb: string;
    address?: string;
    zipCode?: number;
  };
}

export class CreateUserReqDto {
  @IsDefined()
  @IsIn(["STANDARD", "BREEDER", "ADMIN"])
  public kind: string;

  @IsDefined()
  public isVerified: boolean;

  @IsDefined()
  @IsEmail()
  public email: string;

  @IsDefined()
  public firstName: string;

  @IsDefined()
  public lastName: string;

  public phone: string;
  public state: string;
  public suburb: string;
  public address: string;

  @IsOptional()
  @IsInt()
  public zipCode: number;

  public avatarUrl: string;
}

export class CreateUserResDto {
  public success: boolean;
  public userId: string;
}

export class UpdateUserReqDto {
  @IsOptional()
  @IsIn(["STANDARD", "BREEDER", "ADMIN"])
  public kind: string;

  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"])
  public activationStatus: string;

  @IsOptional()
  @IsEmail()
  public email: string;

  public firstName: string;
  public lastName: string;
  public phone: string;
  public state: string;
  public suburb: string;
  public address: string;

  @IsOptional()
  @IsInt()
  public zipCode: number;

  public avatarUrl: string;
}

export class UpdateUserResDto {
  public success: boolean;
}

export class DeleteUserResDto {
  public success: boolean;
}

export class UpdateUserActivationStatusReqDto {
  @IsDefined()
  @IsIn(["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"])
  public activationStatus: string;
}

export class UpdateUserActivationStatusResDto {
  public success: boolean;
}

export class GetUserProfileResDto {
  public user: UserProfileDetailResDto;
  public posts: {
    total: number;
    items: UserPostDto[];
  };
}

export class UserProfileDetailResDto {
  userId: string;
  account: {
    kind: string;
    activationStatus: string;
    isVerified: boolean;
    registrationMethod: string;
    email: string;
    lastSignIn: Date;
  };
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
    suburb: string;
    address: string;
    zipCode: number;
    bio: string;
    avatarUrl: string;
  };
}

export class UserPostDto {
  public postId: string;
  public kind: string;
  public title: string;
  public adoptionFee: number;
  public breed: string;
  public dadBreed: string;
  public momBreed: string;
  public location: {
    state: string;
    suburb: string;
  };
  public images: [
    {
      url: string;
    }
  ];
  public childImages: [
    {
      url: string;
    }
  ];
  public isLiked: boolean;
  public likesCount: number;
  public createdAt: Date;
}
