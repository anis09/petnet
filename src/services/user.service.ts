import { compareSync, hashSync } from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import generator from 'generate-password';
import {
  CreateUserReqDto,
  CreateUserResDto,
  DeleteCurrentUserResDto,
  DeleteUserResDto,
  GetCurrentAdminResDto,
  GetCurrentUserResDto,
  GetUserProfileResDto,
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
  UserDto,
  UserOnlineByMonthDto,
  UserPostDto,
  UserProfileDetailResDto,
  UsersOnlineByMonthResDto,
} from "../dtos/user.dto";
import { errors } from "../constants/errors";
import { vars } from "../constants/vars";
import { Company } from "../interfaces/models/company.model.interface";
import { User } from "../interfaces/models/user.model.interface";
import { HttpException } from "../middlewares/error.middleware";
import { companyModel } from "../models/company.model";
import { postModel } from "../models/post.model";
import { userModel } from "../models/user.model";
import { Mailer } from "../utils/mailer";
import moment from "moment";
class UserService {
  private companies = companyModel;
  private users = userModel;
  private posts = postModel;
  public async getUsers(): Promise<any> {
   
    const users = await this.users.aggregate([
      {
        $match: {
          isArchived: false,
        },
      },
      {
        $project: {
          _id: 1,
          "account.kind": 1,
          "profile.firstName": 1,
          "profile.lastName": 1,
          "profile.avatarUrl": 1,
        },
      },
    ]);

    return users;
  }
  public async getCurrentUser(userId: string): Promise<GetCurrentUserResDto> {
    const foundUsers: GetCurrentUserResDto[] = await this.users.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
          isArchived: false,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "account.companyId",
          foreignField: "_id",
          as: "companies",
        },
      },
      {
        $unwind: {
          path: "$companies",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: {
            $toString: "$_id",
          },
          account: {
            kind: "$account.kind",
            isVerified: "$account.isVerified",
            email: "$account.email",
          },
          profile: "$profile",
          company: {
            companyId: {
              $toString: "$companies._id",
            },
            name: "$companies.name",
            breederPrefix: "$companies.breederPrefix",
            email: "$companies.email",
            phone: "$companies.phone",
            state: "$companies.state",
            suburb: "$companies.suburb",
            address: "$companies.address",
            zipCode: "$companies.zipCode",
            bio: "$companies.bio",
            website: "$companies.website",
            logo: "$companies.logo",
            cover: "$companies.cover",
          },
          preferences: "$preferences",
        },
      },
    ]);

    if (!foundUsers || foundUsers.length === 0) return null;

    return foundUsers[0];
  }

  public async updateCurrentUser(
    userId: string,
    input: UpdateCurrentUserReqDto
  ): Promise<UpdateCurrentUserResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    const updatedCurrentUser = await this.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "account.email": input.email
            ? input.email.toLowerCase()
            : foundUser.account.email,
          "profile.firstName": input.firstName
            ? input.firstName
            : foundUser.profile.firstName,
          "profile.lastName": input.lastName
            ? input.lastName
            : foundUser.profile.lastName,
          "profile.phone": input.phone ? input.phone : foundUser.profile.phone,
          "profile.state": input.state ? input.state : foundUser.profile.state,
          "profile.suburb": input.suburb
            ? input.suburb
            : foundUser.profile.suburb,
          "profile.address": input.address
            ? input.address
            : foundUser.profile.address,
          "profile.zipCode": input.zipCode
            ? input.zipCode
            : foundUser.profile.zipCode,
          "profile.bio": input.bio ? input.bio : foundUser.profile.bio,
          "profile.avatarUrl": input.avatarUrl
            ? input.avatarUrl
            : foundUser.profile.avatarUrl,
          deviceId: input.deviceId ? input.deviceId : foundUser.deviceId,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return {
      success: updatedCurrentUser != null ? true : false,
    };
  }

  public async updateCompany(
    userId: string,
    input: UpdateCompanyReqDto
  ): Promise<UpdateCompanyResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    const foundCompany: Company = await this.companies.findOne({
      _id: foundUser.account.companyId,
    });
    if (!foundCompany) throw new HttpException(404, errors.COMPANY_NOT_FOUND);

    const updatedCompany = await this.companies.findOneAndUpdate(
      { _id: foundUser.account.companyId },
      {
        $set: {
          name: input.name ? input.name : foundCompany.name,
          breederPrefix: input.breederPrefix
            ? input.breederPrefix
            : foundCompany.breederPrefix,
          email: input.email ? input.email : foundCompany.email,
          phone: input.phone ? input.phone : foundCompany.phone,
          state: input.state ? input.state : foundCompany.state,
          suburb: input.suburb ? input.suburb : foundCompany.suburb,
          address: input.address ? input.address : foundCompany.address,
          zipCode: input.zipCode ? input.zipCode : foundCompany.zipCode,
          bio: input.bio ? input.bio : foundCompany.bio,
          website: input.website ? input.website : foundCompany.website,
          logo: input.logo ? input.logo : foundCompany.logo,
          cover: input.cover ? input.cover : foundCompany.cover,
        },
      },
      { new: true }
    );

    return {
      success: updatedCompany != null ? true : false,
    };
  }

  public async updatePassword(
    userId: string,
    input: UpdatePasswordReqDto
  ): Promise<UpdatePasswordResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    if (!compareSync(input.oldPassword, foundUser.account.password))
      throw new HttpException(409, errors.WRONG_PASSWORD);

    const updatedPassword = await this.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "account.password": hashSync(input.newPassword, 10),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return {
      success: updatedPassword != null ? true : false,
    };
  }

  public async updateAdminPassword(
    userId: string,
    input: UpdatePasswordReqDto
  ): Promise<UpdatePasswordResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      "account.kind": "ADMIN",
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    if (!compareSync(input.oldPassword, foundUser.account.password))
      throw new HttpException(409, errors.WRONG_PASSWORD);

    const updatedPassword = await this.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "account.password": hashSync(input.newPassword, 10),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return {
      success: updatedPassword != null ? true : false,
    };
  }

  public async deleteCurrentUser(
    userId: string
  ): Promise<DeleteCurrentUserResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    const deletedCurrentUser = await this.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          isArchived: true,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (deletedCurrentUser != null) {
      await this.posts.updateMany(
        { postedBy: userId },
        {
          $set: {
            isArchived: true,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
    }

    return {
      success: deletedCurrentUser != null ? true : false,
    };
  }
   
  public async getAllUsers(
    pageNumber: string,
    pageSize: string,
    userKind?: string,
    search?: string
  ): Promise<GetUsersResDto> {
    const userKindFilter =
      userKind && userKind !== ""
        ? { $match: { "account.kind": userKind } }
        : { $match: { _id: { $exists: true } } };

    const searchFilter =
      search && search !== ""
        ? { $regex: search, $options: "i" }
        : { $exists: true };

    const countUsers = await this.users.aggregate([
      {
        $addFields: {
          fullName: {
            $concat: ["$profile.firstName", " ", "$profile.lastName"],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              "profile.firstName": searchFilter,
            },
            {
              "profile.lastName": searchFilter,
            },
            {
              fullName: searchFilter,
            },
          ],
          isArchived: false,
        },
      },
      userKindFilter,
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const foundUsers: UserDto[] = await this.users.aggregate([
      {
        $addFields: {
          fullName: {
            $concat: ["$profile.firstName", " ", "$profile.lastName"],
          },
        },
      },
      {
        $match: {
          $or: [
            {
              "profile.firstName": searchFilter,
            },
            {
              "profile.lastName": searchFilter,
            },
            {
              fullName: searchFilter,
            },
          ],
          isArchived: false,
        },
      },
      userKindFilter,
      {
        $addFields: {
          lowerFirstName: {
            $toLower: "$profile.firstName",
          },
          lowerLastName: {
            $toLower: "$profile.lastName",
          },
        },
      },
      {
        $sort: {
          lowerFirstName: 1,
          lowerLastName: 1,
        },
      },
      {
        $project: {
          _id: 0,
          userId: {
            $toString: "$_id",
          },
          firstName: "$profile.firstName",
          lastName: "$profile.lastName",
          avatarUrl: "$profile.avatarUrl",
          kind: "$account.kind",
          activationStatus: "$account.activationStatus",
          isVerified: "$account.isVerified",
          registrationMethod: "$account.registrationMethod",
          email: "$account.email",
          phone: "$profile.phone",
        },
      },
      {
        $skip: (parseInt(pageNumber) - 1) * parseInt(pageSize),
      },
      {
        $limit: parseInt(pageSize),
      },
    ]);

    return {
      total: countUsers && countUsers.length > 0 ? countUsers[0].count : 0,
      users: foundUsers,
    };
  }

  public async getCurrentAdmin(userId: string): Promise<GetCurrentAdminResDto> {
    const foundUsers: GetCurrentAdminResDto[] = await this.users.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
          isArchived: false,
        },
      },
      {
        $project: {
          _id: 0,
          userId: {
            $toString: "$_id",
          },
          account: {
            kind: "$account.kind",
            isVerified: "$account.isVerified",
            email: "$account.email",
          },
          profile: {
            firstName: "$profile.firstName",
            lastName: "$profile.lastName",
            phone: "$profile.phone",
            avatarUrl: "$profile.avatarUrl",
            state:"$profile.state",
            suburb:"$profile.suburb",
            address:"$profile.address",
            zipCode:"$profile.zipCode",
          },
        },
      },
    ]);

    if (!foundUsers || foundUsers.length === 0) return null;

    return foundUsers[0];
  }

  public async createUser(input: CreateUserReqDto): Promise<CreateUserResDto> {
    const foundUser: User = await this.users.findOne({
      "account.email": input.email.toLowerCase(),
      isArchived: false,
    });
    if (foundUser) throw new HttpException(409, errors.EMAIL_ALREADY_EXISTS);

    const password = generator.generate({
      length: 10,
      numbers: true
    })

    const user: User = await this.users.create({
      account: {
        kind: input.kind,
        activationStatus: "ACTIVE",
        isVerified: input.isVerified,
        verificationCode: input.isVerified
          ? undefined
          : crypto.randomBytes(32).toString("hex"),
        verificationExpireAt: input.isVerified
          ? undefined
          : new Date(
              new Date().setHours(
                new Date().getHours() + vars.verificationCodeExpInHours
              )
            ),
        registrationMethod: "CREATED",
        email: input.email,
        password: hashSync(password, 10),
      },
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        state: input.state,
        suburb: input.suburb,
        address: input.address,
        zipCode: input.zipCode,
        avatarUrl: input.avatarUrl,
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

    if (!input.isVerified) {
      new Mailer(user.account.email, {
        name: user.profile.firstName,
        url: `${vars.appLink}/auth/verify-account/${user.account.verificationCode}`,
      }).sendVerifyAccount();
    }

    new Mailer(user.account.email, {
      name: user.profile.firstName,
      pwd: password,
    }).sendGetPasswordDash();

    return {
      success: true,
      userId: user._id,
    };
  }

  public async getUserProfile(
    pageNumber: string,
    pageSize: string,
    userId: string,
    currentUser?: string
  ): Promise<GetUserProfileResDto> {
    const foundUsers: UserProfileDetailResDto[] = await this.users.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
          isArchived: false,
        },
      },
      {
        $project: {
          _id: 0,
          userId: {
            $toString: "$_id",
          },
          account: {
            kind: "$account.kind",
            activationStatus: "$account.activationStatus",
            isVerified: "$account.isVerified",
            registrationMethod: "$account.registrationMethod",
            email: "$account.email",
            lastSignIn: "$account.lastSignIn",
          },
          profile: {
            firstName: "$profile.firstName",
            lastName: "$profile.lastName",
            phone: "$profile.phone",
            state: "$profile.state",
            suburb: "$profile.suburb",
            address: "$profile.address",
            zipCode: "$profile.zipCode",
            bio: "$profile.bio",
            avatarUrl: "$profile.avatarUrl",
          },
        },
      },
    ]);

    let isLikedPipeline: any = {
      $addFields: {
        isLiked: false,
      },
    };

    if (currentUser && currentUser !== "") {
      isLikedPipeline = {
        $addFields: {
          isLiked: {
            $cond: [
              {
                $in: [new mongoose.Types.ObjectId(currentUser), "$likes"],
              },
              true,
              false,
            ],
          },
        },
      };
    }

    const countPosts = await this.posts.aggregate([
      {
        $match: {
          postedBy: new mongoose.Types.ObjectId(userId),
          isArchived: false,
        },
      },
      isLikedPipeline,
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const foundPosts: UserPostDto[] = await this.posts.aggregate([
      {
        $match: {
          postedBy: new mongoose.Types.ObjectId(userId),
          isArchived: false,
        },
      },
      isLikedPipeline,
      {
        $project: {
          _id: 0,
          postId: {
            $toString: "$_id",
          },
          kind: "$kind",
          title: "$title",
          adoptionFee: "$adoptionFee",
          breed: "$pet.breed",
          dadBreed: "$pet.dadBreed",
          momBreed: "$pet.momBreed",
          location: {
            state: "$location.state",
            suburb: "$location.suburb",
          },
          images: "$images",
          childImages: "$childImages",
          isLiked: "$isLiked",
          likesCount: {
            $size: "$likes",
          },
          createdAt: "$createdAt",
        },
      },
      {
        $sort: {
          postId: -1,
          createdAt: -1,
        },
      },
      {
        $skip: (parseInt(pageNumber) - 1) * parseInt(pageSize),
      },
      {
        $limit: parseInt(pageSize),
      },
    ]);

    return {
      user: foundUsers && foundUsers.length > 0 ? foundUsers[0] : null,
      posts: {
        total: countPosts && countPosts.length > 0 ? countPosts[0].count : 0,
        items: foundPosts,
      },
    };
  }

  public async updateUser(
    userId: string,
    input: UpdateUserReqDto
  ): Promise<UpdateUserResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    if (input.email) {
      const foundUser: User = await this.users.findOne({
        $and: [
          {
            _id: {
              $ne: userId,
            },
          },
          {
            "account.email": input.email.toLowerCase(),
            isArchived: false,
          },
        ],
      });

      if (foundUser) {
        throw new HttpException(409, errors.EMAIL_ALREADY_EXISTS);
      }
    }

    const updatedUser = await this.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "account.kind": input.kind ? input.kind : foundUser.account?.kind,
          "account.activationStatus": input.activationStatus
            ? input.activationStatus
            : foundUser.account?.activationStatus,
          "account.email": input.email ? input.email : foundUser.account?.email,
          "profile.firstName": input.firstName
            ? input.firstName
            : foundUser.profile?.firstName,
          "profile.lastName": input.lastName
            ? input.lastName
            : foundUser.profile?.lastName,
          "profile.phone": input.phone ? input.phone : foundUser.profile?.phone,
          "profile.state": input.state ? input.state : foundUser.profile?.state,
          "profile.suburb": input.suburb
            ? input.suburb
            : foundUser.profile?.suburb,
          "profile.address": input.address
            ? input.address
            : foundUser.profile?.address,
          "profile.zipCode": input.zipCode
            ? input.zipCode
            : foundUser.profile?.zipCode,
          "profile.avatarUrl": input.avatarUrl
            ? input.avatarUrl
            : foundUser.profile?.avatarUrl,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return {
      success: updatedUser != null ? true : false,
    };
  }

  public async updateUserActivationStatus(
    userId: string,
    input: UpdateUserActivationStatusReqDto
  ): Promise<UpdateUserActivationStatusResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    const updatedUser = await this.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "account.activationStatus": input.activationStatus,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return {
      success: updatedUser != null ? true : false,
    };
  }

  public async deleteUser(userId: string): Promise<DeleteUserResDto> {
    const foundUser: User = await this.users.findOne({
      _id: userId,
      isArchived: false,
    });
    if (!foundUser) throw new HttpException(404, errors.USER_NOT_FOUND);

    const deletedUser = await this.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          isArchived: true,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (deletedUser != null) {
      await this.posts.updateMany(
        { postedBy: userId },
        {
          $set: {
            isArchived: true,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
    }

    return {
      success: deletedUser != null ? true : false,
    };
  }
  public async countUser(): Promise<any> {
    const result = await this.users.aggregate([
      {
        $group: {
          _id: "$account.kind",
          count: { $sum: 1 },
          lastDayCount: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", { $subtract: [new Date(), 86400000] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          kind: "$_id",
          count: 1,
          lastDayCount: 1,
          dailyPercentageChange: {
            $concat: [
              {
                $toString: {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: ["$lastDayCount", "$count"] },
                        "$count",
                      ],
                    },
                    100,
                  ],
                },
              },
              "%",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$count" },
          counts: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          totalCount: 1,
          counts: 1,
        },
      },
    ]);
    return result[0];
  }
  public async countUserByDate(): Promise<any> {
    const result = await this.users.aggregate([
      {
        $group: {
          _id: null,
          count_last_week: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: [
                        "$createdAt",
                        { $subtract: [new Date(), 604800000] },
                      ],
                    },
                    { $lte: ["$createdAt", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          count_last_month: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: [
                        "$createdAt",
                        { $subtract: [new Date(), 2592000000] },
                      ],
                    },
                    { $lte: ["$createdAt", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          count_last_year: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: [
                        "$createdAt",
                        { $subtract: [new Date(), 31536000000] },
                      ],
                    },
                    { $lte: ["$createdAt", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          lastWeek: {
            created: "$count_last_week",
            percentageChange: {
              $concat: [
                {
                  $toString: {
                    $round: [
                      {
                        $multiply: [
                          {
                            $divide: [
                              {
                                $subtract: [
                                  "$count_last_week",
                                  "$count_last_month",
                                ],
                              },
                              "$count_last_month",
                            ],
                          },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                },
                "%",
              ],
            },
          },
          lastMonth: {
            created: "$count_last_month",
            percentageChange: {
              $concat: [
                {
                  $toString: {
                    $round: [
                      {
                        $multiply: [
                          {
                            $divide: [
                              {
                                $subtract: [
                                  "$count_last_month",
                                  "$count_last_year",
                                ],
                              },
                              "$count_last_year",
                            ],
                          },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                },
                "%",
              ],
            },
          },
          lastYear: {
            created: "$count_last_year",
            percentageChange: "N/A",
          },
        },
      },
    ]);

    return result[0];
  }

  public async lastSignInUserCount(year: number): Promise<any> {
    const result: any = await this.users.aggregate([
      {
        $match: {
          "account.lastSignIn": {
            $exists: true,
            $ne: null,
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $project: {
          kind: "$account.kind",
          month: {
            $dateToString: { format: "%m", date: "$account.lastSignIn" },
          },
        },
      },
      {
        $group: {
          _id: { kind: "$kind", month: "$month" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.kind",
          counts: { $push: { month: "$_id.month", count: "$count" } },
        },
      },
      {
        $project: {
          _id: "$_id",
          counts: 1,
          kind: "$_id",
        },
      },
    ]);
    const formattedResult = {
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      series: {
        year: year,
        data: [],
      },
    };

    const distinctTypes = [...new Set(result.map((item) => item.kind))];
    distinctTypes.forEach((type) => {
      const typeData = {
        type: type,
        data: [],
      };
      formattedResult.series.data.push(typeData);
    });

    formattedResult.months.forEach((month, index) => {
      distinctTypes.forEach((type, typeIndex) => {
        const typeData = formattedResult.series.data[typeIndex];
        const count =
          result
            .find(
              (item) =>
                item.kind === type &&
                item.counts.some(
                  (countItem) =>
                    countItem.month === (index + 1).toString().padStart(2, "0")
                )
            )
            ?.counts.find(
              (countItem) =>
                countItem.month === (index + 1).toString().padStart(2, "0")
            )?.count || 0;
        typeData.data.push(count);
      });
    });

    return {
      success: true,
      result: formattedResult,
    };
  }
  public async countUsersByState(): Promise<any> {
    const result: any = await this.users.aggregate([
      {
        $match: {
          "profile.state": {
            $in: ["Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"]
          }
        }
      },
      {
        $group: {
          _id: "$profile.state",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          label: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
    return {
      success: true,
      output: result,
    };
  }
}

export default UserService;
