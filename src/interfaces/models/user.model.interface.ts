export interface User {
  _id: string;
  account: {
    kind: string;
    companyId: string;
    activationStatus: string;
    isVerified: boolean;
    verificationCode?: string;
    verificationExpireAt?: Date;
    registrationMethod: string;
    providerId: string;
    email: string;
    password: string;
    passwordRecoveryToken?: string;
    passwordRecoveryExpireAt?: Date;
    passwordRecoveredAt?: Date;
    lastSignIn?: Date;
    lastSignOut?: Date;
  };
  profile: {
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
  preferences: {
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
  deviceId?: string;
  isArchived?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
