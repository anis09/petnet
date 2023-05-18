import mongoose from "mongoose";
import { NotificationType, PostStatsType } from "../constants/enums";
import { errors } from "../constants/errors";
import {
  CreateNotificationDto,
  MobileNotificationDto,
} from "../dtos/notification.dto";
import {
  CountByYearDto,
  CountPostByDate,
  CountPostByUserResDto,
  CreatePostReqDto,
  FavoritePostResDto,
  GetFavPostsByUserResDto,
  GetPetInfoByIdResDto,
  GetPostByIdResDto,
  GetPostImgByIdResDto,
  GetPostOwnerResDto,
  GetPostsResDto,
  GetPostsV2ResDto,
  PostDto,
  PostV2Dto,
  UpdatePostReqDto,
} from "../dtos/post.dto";
import { Post } from "../interfaces/models/post.model.interface";
import { User } from "../interfaces/models/user.model.interface";
import { HttpException } from "../middlewares/error.middleware";
import { postModel } from "../models/post.model";
import { userModel } from "../models/user.model";
import io, { getUser } from "../utils/socket";
import FirebaseService from "./firebase.service";
import { NotificationService } from "./notification.service";
import UserService from "./user.service";
import moment from "moment";
import { searchKeywordsModel } from "../models/search_keywords.model";
import { SearchKeywordsService } from "./search_keywords.service";
import { logger } from "utils/logger";
import { CreateSearchKeywordsDto } from "../dtos/search_keywords.dto";
export class PostService {
  private post = postModel;
  private users = userModel;
  private keywords = searchKeywordsModel;
  private notification: NotificationService;
  private user: UserService;
  private firebase: FirebaseService;
  private searchKeywordsService: SearchKeywordsService;
  constructor() {
    this.notification = new NotificationService();
    this.user = new UserService();
    this.firebase = new FirebaseService();
    this.searchKeywordsService = new SearchKeywordsService();
  }

  public async createPost(
    postInput: CreatePostReqDto,
    userId: string
  ): Promise<Post> {
    const foundUser: User = await this.users.findOne({ _id: userId });
    if (foundUser && !foundUser.account.isVerified)
      throw new HttpException(409, errors.ACCOUNT_NOT_YET_VERIFIED);

    let result: Post;
    if (postInput.kind === "BREEDER") {
      let newPet = new this.post({
        kind: postInput.kind,
        title: postInput.title,
        description: postInput.description,
        adoptionFee: postInput.adoptionFee,
        price: postInput.price,
        pet: {
          petType: postInput.pet.petType,
          dadBreed: postInput.pet.dadBreed,
          momBreed: postInput.pet.momBreed,
          microshipId: postInput.pet.microshipId,
          name: postInput.pet.name,
          breed: postInput.pet.breed,
          sex: postInput.pet.sex,
          isDesexed: postInput.pet.isDesexed,
          age: postInput.pet.age,
          size: postInput.pet.size,
          veterinaryChecked: postInput.pet.veterinaryChecked,
          isVaccinated: postInput.pet.isVaccinated,
          coatLength: postInput.pet.coatLength,
          color: postInput.pet.color,
          isInShelter: postInput.pet.isInShelter,
          care: postInput.pet.care,
          expectedAdultSize: postInput.pet.expectedAdultSize,
          goodWith: postInput.pet.goodWith,
        },
        childImages: postInput.childImages,
        parentImages: postInput.parentImages,
        postedBy: userId,
        location: postInput.location,
      });
      result = await newPet.save();
    } else {
      let newPet = new this.post({
        kind: postInput.kind,
        title: postInput.title,
        description: postInput.description,
        price: postInput.price,
        adoptionFee: postInput.adoptionFee,
        pet: {
          petType: postInput.pet.petType,
          microshipId: postInput.pet.microshipId,
          name: postInput.pet.name,
          breed: postInput.pet.breed,
          sex: postInput.pet.sex,
          isDesexed: postInput.pet.isDesexed,
          age: postInput.pet.age,
          size: postInput.pet.size,
          veterinaryChecked: postInput.pet.veterinaryChecked,
          isVaccinated: postInput.pet.isVaccinated,
          coatLength: postInput.pet.coatLength,
          color: postInput.pet.color,
          isInShelter: postInput.pet.isInShelter,
          care: postInput.pet.care,
          expectedAdultSize: postInput.pet.expectedAdultSize,
          goodWith: postInput.pet.goodWith,
        },
        location: postInput.location,
        images: postInput.images,
        postedBy: userId,
      });
      result = await newPet.save();
    }

    if (result) {
      return result;
    }
  }

  public async getAllPosts(
    pageNumber: string,
    pageSize: string,
    postedBy: string,
    petType: string,
    petAge: string,
    petSize: string,
    petExpectedAdultSize: string,
    petVeterinaryChecked: number,
    petSex: string,
    petGoodWith: string,
    petCoatLength: string,
    petCare: string,
    petIsInShelter: number,
    search?: string,
    state?: string,
    accountVerified?: boolean
  ): Promise<GetPostsResDto> {
    if (search) {
      const searchKeyword = new CreateSearchKeywordsDto();
      searchKeyword.keyword = search;
      await this.searchKeywordsService.createSearchKeyword({ keyword: search });
    }

    const postedByFilter =
      postedBy && postedBy !== ""
        ? new mongoose.Types.ObjectId(postedBy)
        : { $exists: true };

    const petTypeFilter =
      petType && petType !== ""
        ? { $match: { "pet.petType": petType } }
        : { $match: { _id: { $exists: true } } };

    const stateFilter =
      state && state !== ""
        ? { $match: { "location.state": state } }
        : { $match: { _id: { $exists: true } } };

    const petAgeFilter =
      petAge && petAge !== ""
        ? { $match: { "pet.age": { $in: Array.from(petAge.split(",")) } } }
        : { $match: { _id: { $exists: true } } };
    const petSizeFilter =
      petSize && petSize !== ""
        ? { $match: { "pet.size": { $in: Array.from(petSize.split(",")) } } }
        : { $match: { _id: { $exists: true } } };
    const petExpectedAdultSizeFilter =
      petExpectedAdultSize && petExpectedAdultSize !== ""
        ? {
          $match: {
            "pet.expectedAdultSize": {
              $in: Array.from(petExpectedAdultSize.split(",")),
            },
          },
        }
        : { $match: { _id: { $exists: true } } };
    const petVeterinaryCheckedFilter =
      petVeterinaryChecked && petVeterinaryChecked === 1
        ? { $match: { "pet.veterinaryChecked": true } }
        : petVeterinaryChecked && petVeterinaryChecked === 0
          ? { $match: { "pet.veterinaryChecked": false } }
          : { $match: { _id: { $exists: true } } };
    const petSexFilter =
      petSex && petSex !== ""
        ? { $match: { "pet.sex": { $in: Array.from(petSex.split(",")) } } }
        : { $match: { _id: { $exists: true } } };
    const petGoodWithFilter =
      petGoodWith && petGoodWith !== ""
        ? {
          $match: {
            "pet.goodWith": { $in: Array.from(petGoodWith.split(",")) },
          },
        }
        : { $match: { _id: { $exists: true } } };
    const petCoatLengthFilter =
      petCoatLength && petCoatLength !== ""
        ? {
          $match: {
            "pet.coatLength": { $in: Array.from(petCoatLength.split(",")) },
          },
        }
        : { $match: { _id: { $exists: true } } };
    const petCareFilter =
      petCare && petCare !== ""
        ? { $match: { "pet.care": { $in: Array.from(petCare.split(",")) } } }
        : { $match: { _id: { $exists: true } } };
    const petIsInShelterFilter =
      petIsInShelter && petIsInShelter === 1
        ? { $match: { "pet.isInShelter": true } }
        : petIsInShelter && petIsInShelter === 0
          ? { $match: { "pet.isInShelter": false } }
          : { $match: { _id: { $exists: true } } };

    const searchFilter =
      search && search !== ""
        ? { $regex: search, $options: "i" }
        : { $exists: true };

    let searchFilterV2: any = { $match: { _id: { $exists: true } } };
    if (search && search !== "") {
      let pipelines: any = [];
      const arr = search.split(" ");
      for (const item of arr) {
        pipelines.push({
          $or: [
            {
              title: { $regex: item, $options: "i" },
            },
            // {
            //   description: { $regex: item, $options: "i" }
            // },
            {
              "pet.petType": { $regex: item, $options: "i" },
            },
            {
              "pet.microshipId": { $regex: item, $options: "i" },
            },
            {
              "pet.name": { $regex: item, $options: "i" },
            },
            {
              "pet.breed": { $regex: item, $options: "i" },
            },
            {
              "pet.sex": { $regex: item, $options: "i" },
            },
            {
              "pet.age": { $regex: item, $options: "i" },
            },
            {
              "pet.size": { $regex: item, $options: "i" },
            },
            {
              "pet.coatLength": { $regex: item, $options: "i" },
            },
            {
              "pet.color": { $regex: item, $options: "i" },
            },
            {
              "pet.care": { $regex: item, $options: "i" },
            },
            {
              "pet.expectedAdultSize": { $regex: item, $options: "i" },
            },
            // {
            //   "pet.goodWith": { $regex: item, $options: "i" }
            // },
            {
              "location.state": { $regex: item, $options: "i" },
            },
            {
              "location.suburb": { $regex: item, $options: "i" },
            },
          ],
        });
      }

      if (pipelines.length > 0) {
        searchFilterV2 = {
          $match: {
            $and: pipelines,
          },
        };
      }
    }

    const countPosts = await this.post.aggregate([
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "postedBy",
      //     foreignField: "_id",
      //     as: "users",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$users",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $match: {
          // "users.isArchived": false,
          // $or: [
          //   {
          //     title: searchFilter,
          //   },
          //   {
          //     "pet.name": searchFilter,
          //   },
          //   {
          //     "pet.breed": searchFilter,
          //   },
          //   {
          //     "pet.dadBreed": searchFilter,
          //   },
          //   {
          //     "pet.momBreed": searchFilter,
          //   },
          // ],
          postedBy: postedByFilter,
          isArchived: false,
        },
      },
      petTypeFilter,
      stateFilter,
      petAgeFilter,
      petSizeFilter,
      petExpectedAdultSizeFilter,
      petVeterinaryCheckedFilter,
      petSexFilter,
      petGoodWithFilter,
      petCoatLengthFilter,
      petCareFilter,
      petIsInShelterFilter,
      searchFilterV2,
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const foundPosts: PostDto[] = await this.post.aggregate([
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "postedBy",
      //     foreignField: "_id",
      //     as: "users",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$users",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $match: {
          // "users.isArchived": false,
          // $or: [
          //   {
          //     title: searchFilter,
          //   },
          //   {
          //     "pet.name": searchFilter,
          //   },
          //   {
          //     "pet.breed": searchFilter,
          //   },
          //   {
          //     "pet.dadBreed": searchFilter,
          //   },
          //   {
          //     "pet.momBreed": searchFilter,
          //   },
          // ],
          postedBy: postedByFilter,
          isArchived: false,
        },
      },
      petTypeFilter,
      stateFilter,
      petAgeFilter,
      petSizeFilter,
      petExpectedAdultSizeFilter,
      petVeterinaryCheckedFilter,
      petSexFilter,
      petGoodWithFilter,
      petCoatLengthFilter,
      petCareFilter,
      petIsInShelterFilter,
      searchFilterV2,
      // {
      //   $lookup: {
      //     from: "suburbs",
      //     localField: "location.suburb",
      //     foreignField: "name",
      //     as: "suburbs",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$suburbs",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "companies",
          localField: "users.account.companyId",
          foreignField: "_id",
          as: "companies",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
        },
      },
      // {
      //   $unwind: {
      //     path: "$likes",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $unwind: {
          path: "$companies",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          accountVerified,
        },
      },
      {
        $project: {
          _id: 0,
          postId: {
            $toString: "$_id",
          },
          kind: "$kind",
          title: "$title",
          description: "$description",
          price: "$price",
          adoptionFee: "$adoptionFee",
          pet: "$pet",
          location: {
            state: "$location.state",
            suburb: "$location.suburb",
            latitude: { $arrayElemAt: ["$suburbs.location.coordinates", 1] },
            longitude: { $arrayElemAt: ["$suburbs.location.coordinates", 0] },
          },
          images: "$images",
          childImages: "$childImages",
          parentImages: "$parentImages",
          postedBy: {
            userId: {
              $toString: "$users._id",
            },
            kind: "$users.account.kind",
            email: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.account.email",
                null,
              ],
            },
            firstName: "$users.profile.firstName",
            lastName: "$users.profile.lastName",
            phone: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.profile.phone",
                null,
              ],
            },
            state: "$users.profile.state",
            suburb: "$users.profile.suburb",
            zipCode: "$users.profile.zipCode",
            avatarUrl: "$users.profile.avatarUrl",
            breederPrefix: "$companies.breederPrefix",
            breederBio: "$companies.bio",
          },
          likes: {
            $map: {
              input: "$likes",
              as: "like",
              in: {
                firstName: "$$like.profile.firstName",
                lastName: "$$like.profile.lastName",
                userId: {
                  $toString: "$$like._id",
                },
              },
            },
          },
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
      // {
      //   $group: {
      //     _id: "$postId",
      //     postId: {
      //       $first: "$postId",
      //     },
      //     kind: {
      //       $first: "$kind",
      //     },
      //     title: {
      //       $first: "$title",
      //     },
      //     description: {
      //       $first: "$description",
      //     },
      //     price: {
      //       $first: "$price",
      //     },
      //     adoptionFee: {
      //       $first: "$adoptionFee",
      //     },
      //     pet: {
      //       $first: "$pet",
      //     },
      //     location: {
      //       $first: "$location",
      //     },
      //     images: {
      //       $first: "$images",
      //     },
      //     childImages: {
      //       $first: "$childImages",
      //     },
      //     parentImages: {
      //       $first: "$parentImages",
      //     },
      //     postedBy: {
      //       $first: "$postedBy",
      //     },
      //     likes: {
      //       $first: "$likes",
      //     },
      //     createdAt: {
      //       $first: "$createdAt",
      //     },
      //     updatedAt: {
      //       $first: "$updatedAt",
      //     },
      //   },
      // },
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
      total: countPosts && countPosts.length > 0 ? countPosts[0].count : 0,
      posts: foundPosts,
    };
  }
  public async getAllPostsByState(): Promise<any[]> {
    let result: any[] = await this.post.aggregate([
      {
        $group: {
          _id: "$location.state",
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          name: "$_id",
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$count" },
          states: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          states: {
            $map: {
              input: "$states",
              as: "state",
              in: {
                label: "$$state.name",
                count: "$$state.count",
                percentage: {
                  $multiply: [
                    { $divide: ["$$state.count", "$totalCount"] },
                    100,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          totalCount: 1,
          states: 1,
        },
      },
    ]);
    let res: any = {
      totalCount: result[0].totalCount,
      states: result[0].states,
    };
    return res;
  }
  public async CountAllPostByFilter(userType: string) {
    let result = await this.post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "users.account.kind": userType,
        },
      },
      {
        $count: "count",
      },
    ]);
    if (result.length === 0) {
      return {
        count: 0,
      };
    } else {
      return result[0];
    }
  }
  public async CountAllPostAndGroupByUser() {
    let result = await this.post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$users.account.kind",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
        },
      },
    ]);
    if (result.length === 0) {
      return {
        count: 0,
      };
    } else {
      return result;
    }
  }
  public async getAllPostsV2(
    pageNumber: string,
    pageSize: string,
    postedBy: string,
    petType: string,
    petAge: string,
    petSize: string,
    petExpectedAdultSize: string,
    petVeterinaryChecked: number,
    petSex: string,
    petGoodWith: string,
    petCoatLength: string,
    petCare: string,
    petIsInShelter: number,
    search?: string,
    state?: string,
    currentUser?: string
  ): Promise<GetPostsV2ResDto> {
    if (search) {
      const searchKeyword = new CreateSearchKeywordsDto();
      searchKeyword.keyword = search;
      await this.searchKeywordsService.createSearchKeyword({ keyword: search });
    }
    const postedByFilter =
      postedBy && postedBy !== ""
        ? new mongoose.Types.ObjectId(postedBy)
        : { $exists: true };

    const petTypeFilter =
      petType && petType !== ""
        ? { $match: { "pet.petType": petType } }
        : { $match: { _id: { $exists: true } } };

    const stateFilter =
      state && state !== ""
        ? { $match: { "location.state": state } }
        : { $match: { _id: { $exists: true } } };

    const petAgeFilter =
      petAge && petAge !== ""
        ? { $match: { "pet.age": { $in: Array.from(petAge.split(",")) } } }
        : { $match: { _id: { $exists: true } } };
    const petSizeFilter =
      petSize && petSize !== ""
        ? { $match: { "pet.size": { $in: Array.from(petSize.split(",")) } } }
        : { $match: { _id: { $exists: true } } };
    const petExpectedAdultSizeFilter =
      petExpectedAdultSize && petExpectedAdultSize !== ""
        ? {
          $match: {
            "pet.expectedAdultSize": {
              $in: Array.from(petExpectedAdultSize.split(",")),
            },
          },
        }
        : { $match: { _id: { $exists: true } } };
    const petVeterinaryCheckedFilter =
      petVeterinaryChecked && petVeterinaryChecked === 1
        ? { $match: { "pet.veterinaryChecked": true } }
        : petVeterinaryChecked && petVeterinaryChecked === 0
          ? { $match: { "pet.veterinaryChecked": false } }
          : { $match: { _id: { $exists: true } } };
    const petSexFilter =
      petSex && petSex !== ""
        ? { $match: { "pet.sex": { $in: Array.from(petSex.split(",")) } } }
        : { $match: { _id: { $exists: true } } };
    const petGoodWithFilter =
      petGoodWith && petGoodWith !== ""
        ? {
          $match: {
            "pet.goodWith": { $in: Array.from(petGoodWith.split(",")) },
          },
        }
        : { $match: { _id: { $exists: true } } };
    const petCoatLengthFilter =
      petCoatLength && petCoatLength !== ""
        ? {
          $match: {
            "pet.coatLength": { $in: Array.from(petCoatLength.split(",")) },
          },
        }
        : { $match: { _id: { $exists: true } } };
    const petCareFilter =
      petCare && petCare !== ""
        ? { $match: { "pet.care": { $in: Array.from(petCare.split(",")) } } }
        : { $match: { _id: { $exists: true } } };
    const petIsInShelterFilter =
      petIsInShelter && petIsInShelter === 1
        ? { $match: { "pet.isInShelter": true } }
        : petIsInShelter && petIsInShelter === 0
          ? { $match: { "pet.isInShelter": false } }
          : { $match: { _id: { $exists: true } } };

    const searchFilter =
      search && search !== ""
        ? { $regex: search, $options: "i" }
        : { $exists: true };

    let searchFilterV2: any = { $match: { _id: { $exists: true } } };
    if (search && search !== "") {
      let pipelines: any = [];
      const arr = search.split(" ");
      for (const item of arr) {
        pipelines.push({
          $or: [
            {
              title: { $regex: item, $options: "i" },
            },
            // {
            //   description: { $regex: item, $options: "i" }
            // },
            {
              "pet.petType": { $regex: item, $options: "i" },
            },
            {
              "pet.microshipId": { $regex: item, $options: "i" },
            },
            {
              "pet.name": { $regex: item, $options: "i" },
            },
            {
              "pet.breed": { $regex: item, $options: "i" },
            },
            {
              "pet.sex": { $regex: item, $options: "i" },
            },
            {
              "pet.age": { $regex: item, $options: "i" },
            },
            {
              "pet.size": { $regex: item, $options: "i" },
            },
            {
              "pet.coatLength": { $regex: item, $options: "i" },
            },
            {
              "pet.color": { $regex: item, $options: "i" },
            },
            {
              "pet.care": { $regex: item, $options: "i" },
            },
            {
              "pet.expectedAdultSize": { $regex: item, $options: "i" },
            },
            // {
            //   "pet.goodWith": { $regex: item, $options: "i" }
            // },
            {
              "location.state": { $regex: item, $options: "i" },
            },
            {
              "location.suburb": { $regex: item, $options: "i" },
            },
          ],
        });
      }

      if (pipelines.length > 0) {
        searchFilterV2 = {
          $match: {
            $and: pipelines,
          },
        };
      }
    }

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

    const countPosts = await this.post.aggregate([
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "postedBy",
      //     foreignField: "_id",
      //     as: "users",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$users",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $match: {
          //"users.isArchived": false,
          postedBy: postedByFilter,
          isArchived: false,
        },
      },
      petTypeFilter,
      stateFilter,
      petAgeFilter,
      petSizeFilter,
      petExpectedAdultSizeFilter,
      petVeterinaryCheckedFilter,
      petSexFilter,
      petGoodWithFilter,
      petCoatLengthFilter,
      petCareFilter,
      petIsInShelterFilter,
      searchFilterV2,
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const foundPosts: PostV2Dto[] = await this.post.aggregate([
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "postedBy",
      //     foreignField: "_id",
      //     as: "users",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$users",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $match: {
          //"users.isArchived": false,
          postedBy: postedByFilter,
          isArchived: false,
        },
      },
      petTypeFilter,
      stateFilter,
      petAgeFilter,
      petSizeFilter,
      petExpectedAdultSizeFilter,
      petVeterinaryCheckedFilter,
      petSexFilter,
      petGoodWithFilter,
      petCoatLengthFilter,
      petCareFilter,
      petIsInShelterFilter,
      searchFilterV2,
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
      total: countPosts && countPosts.length > 0 ? countPosts[0].count : 0,
      posts: foundPosts,
    };
  }
  public async getPostOwner(postId: string): Promise<GetPostOwnerResDto> {
    let selectedPost = await this.post.findById(postId);
    let owner: User = await this.users.findById(selectedPost.postedBy);
    if (owner) {
      return { success: true, owner: owner };
    } else {
      return { success: false, owner: null };
    }
  }
  public async updatePost(
    inputData: UpdatePostReqDto,
    postId: string
  ): Promise<Post> {
    let updatedPost: Post = await this.post.findByIdAndUpdate(postId, {
      ...inputData,
    });
    return updatedPost;
  }

  public async likePost(
    likeId: string,
    postId: string
  ): Promise<FavoritePostResDto> {
    try {
      const selectedPost: Post = await this.post.findById(postId);
      const sender: any = await this.user.getCurrentUser(likeId);
      const receiverUser: any = await this.user.getCurrentUser(
        selectedPost.postedBy
      );
      let updatedPost: Post = await this.post.findByIdAndUpdate(postId, {
        likes: selectedPost.likes ? [...selectedPost.likes, likeId] : [likeId],
      });

      if (selectedPost.postedBy.toString() !== likeId.toString()) {
        const countLikes = updatedPost.likes.filter(
          (elm) => elm.toString() !== selectedPost.postedBy.toString()
        ).length;
        let notificationToSend: CreateNotificationDto = {
          senderId: likeId,
          receiverId: selectedPost.postedBy,
          type: NotificationType.favoredRequest,
          entityId: postId,
          text:
            countLikes == 0
              ? `${sender.profile.firstName} ${sender.profile.lastName}  liked your post`
              : countLikes == 1
                ? `${sender.profile.firstName} ${sender.profile.lastName} and ${countLikes} other liked your post`
                : `${sender.profile.firstName} ${sender.profile.lastName} and ${countLikes} others liked your post`,
          createdAt: new Date(Date.now()),
        };
        let notification = await this.notification.createNotification(
          notificationToSend
        );
        let mobileNotification: MobileNotificationDto = {
          title: `${sender.profile.firstName} ${sender.profile.lastName}`,
          body: `liked your post`,
          event: NotificationType.favoredRequest,
          payload: `${sender.profile.firstName} ${sender.profile.lastName}`,
          sender: sender._id,
        };
        this.firebase.sendNotifcation(
          receiverUser.deviceId,
          `${sender.profile.firstName} ${sender.profile.lastName}`,
          `liked your post`
        );
        let socketUser = getUser(selectedPost.postedBy);

        if (socketUser) {
          io.sockets
            .to(socketUser.socketId)
            .emit("new-notification", notification);
          io.sockets
            .to(socketUser.socketId)
            .emit("new-mobile-notification", mobileNotification);
        }
      }

      return {
        success: true,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  public async removeLikePost(
    likeId: string,
    postId: string
  ): Promise<FavoritePostResDto> {
    try {
      const selectedPost: Post = await this.post.findById(postId);
      let filtredLikes = selectedPost.likes
        .filter((elm) => elm !== null)
        .filter((elm) => {
          if (elm.toString() !== likeId.toString()) {
            return true;
          } else {
            return false;
          }
        });

      let updatedPost: Post = await this.post.findByIdAndUpdate(postId, {
        likes: filtredLikes,
      });
      await this.notification.removeNotificationBySender(
        likeId,
        selectedPost.postedBy.toString()
      );
      return {
        success: true,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async deletePost(postId: string, userId: string): Promise<Post> {
    let deletedPost = await this.post.findOneAndRemove({
      _id: postId,
      postedBy: userId,
    });
    await this.notification.removeNotificationByReceiverAndPost(userId, postId);
    return deletedPost;
  }
  public async deletePostByAdmin(postId: string): Promise<Post> {
    let deletedPost = await this.post.findOneAndRemove({
      _id: postId,
    });

    return deletedPost;
  }
  public async getPostById(
    postId: string,
    accountVerified?: boolean
  ): Promise<GetPostByIdResDto> {
    const foundPosts: PostDto[] = await this.post.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(postId), isArchived: false },
      },
      // {
      //   $lookup: {
      //     from: "suburbs",
      //     localField: "location.suburb",
      //     foreignField: "name",
      //     as: "suburbs",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$suburbs",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "users.account.companyId",
          foreignField: "_id",
          as: "companies",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
        },
      },
      {
        $unwind: {
          path: "$companies",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          accountVerified,
        },
      },
      {
        $project: {
          _id: 0,
          postId: {
            $toString: "$_id",
          },
          kind: "$kind",
          title: "$title",
          description: "$description",
          price: "$price",
          adoptionFee: "$adoptionFee",
          pet: "$pet",
          location: {
            state: "$location.state",
            suburb: "$location.suburb",
            latitude: { $arrayElemAt: ["$suburbs.location.coordinates", 1] },
            longitude: { $arrayElemAt: ["$suburbs.location.coordinates", 0] },
          },
          images: "$images",
          childImages: "$childImages",
          parentImages: "$parentImages",
          postedBy: {
            userId: {
              $toString: "$users._id",
            },
            kind: "$users.account.kind",
            email: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.account.email",
                null,
              ],
            },
            firstName: "$users.profile.firstName",
            lastName: "$users.profile.lastName",
            phone: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.profile.phone",
                null,
              ],
            },
            state: "$users.profile.state",
            suburb: "$users.profile.suburb",
            zipCode: "$users.profile.zipCode",
            avatarUrl: "$users.profile.avatarUrl",
            breederPrefix: "$companies.breederPrefix",
            breederBio: "$companies.bio",
          },
          likes: {
            $map: {
              input: "$likes",
              as: "like",
              in: {
                firstName: "$$like.profile.firstName",
                lastName: "$$like.profile.lastName",
                userId: {
                  $toString: "$$like._id",
                },
              },
            },
          },
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
    ]);
    return {
      success: true,
      post: foundPosts[0],
    };
  }
  public async getPetInfoByPostId(
    postId: string,
    accountVerified?: boolean
  ): Promise<GetPetInfoByIdResDto> {
    const foundPosts: PostDto[] = await this.post.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(postId), isArchived: false },
      },
      // {
      //   $lookup: {
      //     from: "suburbs",
      //     localField: "location.suburb",
      //     foreignField: "name",
      //     as: "suburbs",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$suburbs",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "users.account.companyId",
          foreignField: "_id",
          as: "companies",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
        },
      },
      {
        $unwind: {
          path: "$companies",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          accountVerified,
        },
      },
      {
        $project: {
          _id: 0,
          postId: {
            $toString: "$_id",
          },
          kind: "$kind",
          title: "$title",
          description: "$description",
          price: "$price",
          adoptionFee: "$adoptionFee",
          pet: "$pet",
          location: {
            state: "$location.state",
            suburb: "$location.suburb",
            latitude: { $arrayElemAt: ["$suburbs.location.coordinates", 1] },
            longitude: { $arrayElemAt: ["$suburbs.location.coordinates", 0] },
          },
          images: "$images",
          childImages: "$childImages",
          parentImages: "$parentImages",
          postedBy: {
            userId: {
              $toString: "$users._id",
            },
            kind: "$users.account.kind",
            email: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.account.email",
                null,
              ],
            },
            firstName: "$users.profile.firstName",
            lastName: "$users.profile.lastName",
            phone: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.profile.phone",
                null,
              ],
            },
            state: "$users.profile.state",
            suburb: "$users.profile.suburb",
            zipCode: "$users.profile.zipCode",
            avatarUrl: "$users.profile.avatarUrl",
            breederPrefix: "$companies.breederPrefix",
            breederBio: "$companies.bio",
          },
          likes: {
            $map: {
              input: "$likes",
              as: "like",
              in: {
                firstName: "$$like.profile.firstName",
                lastName: "$$like.profile.lastName",
                userId: {
                  $toString: "$$like._id",
                },
              },
            },
          },
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
    ]);
    return {
      success: true,
      pet: foundPosts[0].pet,
    };
  }
  public async getPostImageById(
    postId: string,
    accountVerified?: boolean
  ): Promise<GetPostImgByIdResDto> {
    const foundPosts: PostDto[] = await this.post.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(postId), isArchived: false },
      },
      // {
      //   $lookup: {
      //     from: "suburbs",
      //     localField: "location.suburb",
      //     foreignField: "name",
      //     as: "suburbs",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$suburbs",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "users.account.companyId",
          foreignField: "_id",
          as: "companies",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
        },
      },
      {
        $unwind: {
          path: "$companies",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          accountVerified,
        },
      },
      {
        $project: {
          _id: 0,
          postId: {
            $toString: "$_id",
          },
          kind: "$kind",
          title: "$title",
          description: "$description",
          price: "$price",
          adoptionFee: "$adoptionFee",
          pet: "$pet",
          location: {
            state: "$location.state",
            suburb: "$location.suburb",
            latitude: { $arrayElemAt: ["$suburbs.location.coordinates", 1] },
            longitude: { $arrayElemAt: ["$suburbs.location.coordinates", 0] },
          },
          images: "$images",
          childImages: "$childImages",
          parentImages: "$parentImages",
          postedBy: {
            userId: {
              $toString: "$users._id",
            },
            kind: "$users.account.kind",
            email: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.account.email",
                null,
              ],
            },
            firstName: "$users.profile.firstName",
            lastName: "$users.profile.lastName",
            phone: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.profile.phone",
                null,
              ],
            },
            state: "$users.profile.state",
            suburb: "$users.profile.suburb",
            zipCode: "$users.profile.zipCode",
            avatarUrl: "$users.profile.avatarUrl",
            breederPrefix: "$companies.breederPrefix",
            breederBio: "$companies.bio",
          },
          likes: {
            $map: {
              input: "$likes",
              as: "like",
              in: {
                firstName: "$$like.profile.firstName",
                lastName: "$$like.profile.lastName",
                userId: {
                  $toString: "$$like._id",
                },
              },
            },
          },
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
    ]);
    return {
      success: true,
      imgs: foundPosts[0].images,
    };
  }
  public async getFavPostsByUser(
    userId: string,
    accountVerified?: boolean
  ): Promise<GetFavPostsByUserResDto> {
    const foundPosts: Post[] = await this.post.aggregate([
      {
        $match: {
          likes: new mongoose.Types.ObjectId(userId),
          isArchived: false,
        },
      },
      {
        $addFields: {
          accountVerified,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
        },
      },
      {
        $project: {
          _id: 0,
          postId: {
            $toString: "$_id",
          },
          kind: "$kind",
          title: "$title",
          description: "$description",
          price: "$price",
          adoptionFee: "$adoptionFee",
          pet: "$pet",
          location: {
            state: "$location.state",
            suburb: "$location.suburb",
            latitude: { $arrayElemAt: ["$suburbs.location.coordinates", 1] },
            longitude: { $arrayElemAt: ["$suburbs.location.coordinates", 0] },
          },
          images: "$images",
          childImages: "$childImages",
          parentImages: "$parentImages",
          postedBy: {
            userId: {
              $toString: "$users._id",
            },
            kind: "$users.account.kind",
            email: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.account.email",
                null,
              ],
            },
            firstName: "$users.profile.firstName",
            lastName: "$users.profile.lastName",
            phone: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.profile.phone",
                null,
              ],
            },
            state: "$users.profile.state",
            suburb: "$users.profile.suburb",
            zipCode: "$users.profile.zipCode",
            avatarUrl: "$users.profile.avatarUrl",
            breederPrefix: "$companies.breederPrefix",
            breederBio: "$companies.bio",
          },
          likes: {
            $map: {
              input: "$likes",
              as: "like",
              in: {
                firstName: "$$like.profile.firstName",
                lastName: "$$like.profile.lastName",
                userId: {
                  $toString: "$$like._id",
                },
              },
            },
          },
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
      {
        $sort: {
          _id: -1,
          createdAt: -1,
        },
      },
    ]);

    return {
      success: true,
      posts: foundPosts,
    };
  }
  public async getPostsByUser(
    userId: string,
    accountVerified?: boolean
  ): Promise<GetFavPostsByUserResDto> {
    const foundPosts: Post[] = await this.post.aggregate([
      {
        $match: {
          postedBy: new mongoose.Types.ObjectId(userId),
          isArchived: false,
        },
      },
      {
        $addFields: {
          accountVerified,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likes",
        },
      },
      {
        $project: {
          _id: 0,
          postId: {
            $toString: "$_id",
          },
          kind: "$kind",
          title: "$title",
          description: "$description",
          price: "$price",
          adoptionFee: "$adoptionFee",
          pet: "$pet",
          location: {
            state: "$location.state",
            suburb: "$location.suburb",
            latitude: { $arrayElemAt: ["$suburbs.location.coordinates", 1] },
            longitude: { $arrayElemAt: ["$suburbs.location.coordinates", 0] },
          },
          images: "$images",
          childImages: "$childImages",
          parentImages: "$parentImages",
          postedBy: {
            userId: {
              $toString: "$users._id",
            },
            kind: "$users.account.kind",
            email: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.account.email",
                null,
              ],
            },
            firstName: "$users.profile.firstName",
            lastName: "$users.profile.lastName",
            phone: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.profile.phone",
                null,
              ],
            },
            state: "$users.profile.state",
            suburb: "$users.profile.suburb",
            zipCode: "$users.profile.zipCode",
            avatarUrl: "$users.profile.avatarUrl",
            breederPrefix: "$companies.breederPrefix",
            breederBio: "$companies.bio",
          },
          likes: {
            $map: {
              input: "$likes",
              as: "like",
              in: {
                firstName: "$$like.profile.firstName",
                lastName: "$$like.profile.lastName",
                userId: {
                  $toString: "$$like._id",
                },
              },
            },
          },
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
      {
        $sort: {
          _id: -1,
          createdAt: -1,
        },
      },
    ]);

    return {
      success: true,
      posts: foundPosts,
    };
  }

  public async countPostsByUser(
    userId: string
  ): Promise<CountPostByUserResDto> {
    const foundPosts: any[] = await this.post.aggregate([
      {
        $match: {
          postedBy: new mongoose.Types.ObjectId(userId),
          isArchived: false,
        },
      },
      {
        $count: "count",
      },
    ]);

    return {
      success: true,
      count: foundPosts[0].count,
    };
  }
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
  public async countPostByDate(filterType: string): Promise<any> {
    switch (filterType) {
      case PostStatsType.month:
        const countByMonth: { month: number; count: number }[] =
          await this.post.aggregate([
            {
              $match: {
                isArchived: false,
              },
            },
            {
              $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                _id: 1,
              },
            },
            {
              $project: {
                _id: 0,
                month: "$_id",
                count: "$count",
              },
            },
          ]);
        const categories = moment.months();
        const series = [
          {
            type: "Year",
            data: [
              {
                name: "Total Posts",
                data: categories.map(
                  (_, index) =>
                    countByMonth.find((c) => c.month === index + 1)?.count ?? 0
                ),
              },
            ],
          },
        ];
        return {
          success: true,
          chartData: {
            categories,
            series,
          },
        };
      case PostStatsType.week:
        const countByWeek: { week: number; count: number }[] =
          await this.post.aggregate([
            {
              $match: {
                isArchived: false,
              },
            },
            {
              $group: {
                _id: { $week: "$createdAt" },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                week: "$_id",
                count: "$count",
              },
            },
          ]);

        const weekCategories = [];
        const weekSeries = [
          {
            type: "Week",
            data: [
              {
                name: "Total Posts",
                data: [],
              },
            ],
          },
        ];

        const now = new Date();
        for (let i = 0; i < 52; i++) {
          const date = new Date(now.getFullYear(), 0, i * 7);
          const week = this.getWeekNumber(date);
          weekCategories.push(`Week ${week}`);
          const count =
            countByWeek.find((item) => item.week === week)?.count || 0;
          weekSeries[0].data[0].data.push(count);
        }

        return {
          success: true,
          countOutput: {
            categories: weekCategories,
            series: weekSeries,
          },
        };

      case PostStatsType.year:
        const countByYear: { year: number; count: number }[] =
          await this.post.aggregate([
            {
              $match: {
                isArchived: false,
              },
            },
            {
              $group: {
                _id: { $year: "$createdAt" },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                _id: 1,
              },
            },
            {
              $project: {
                _id: 0,
                year: "$_id",
                count: "$count",
              },
            },
          ]);

        const yearCategories = [
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
        ];

        const yearSeries = [
          {
            type: "Year",
            data: [
              {
                name: "Total Posts",
                data: yearCategories.map((_, monthIndex) => {
                  const count =
                    countByYear.find(
                      (item) => item.year === new Date().getFullYear() - 1
                    )[monthIndex]?.count || 0;
                  return count;
                }),
              },
            ],
          },
        ];

        return {
          success: true,
          countOutput: {
            categories: yearCategories,
            series: yearSeries,
          },
        };

      default:
        throw new Error("Input query should be YEAR|MONTH|WEEK");
    }
  }
  public async countPostByBreeder(): Promise<any> {
    const result: any = await this.post.aggregate([
      {
        $match: {
          isArchived: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
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
          postedBy: {
            userId: {
              $toString: "$users._id",
            },
            kind: "$users.account.kind",
            email: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.account.email",
                null,
              ],
            },
            firstName: "$users.profile.firstName",
            lastName: "$users.profile.lastName",
            phone: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.profile.phone",
                null,
              ],
            },
            state: "$users.profile.state",
            suburb: "$users.profile.suburb",
            zipCode: "$users.profile.zipCode",
            avatarUrl: "$users.profile.avatarUrl",
            breederPrefix: "$companies.breederPrefix",
            breederBio: "$companies.bio",
          },
        },
      },
      {
        $group: {
          _id: "$postedBy.kind", // group by pet breed
          count: { $sum: 1 }, // count the number of posts per breed
        },
      },
      {
        $project: {
          _id: 0,
          breed: "$_id", // rename _id field to breed
          count: "$count",
        },
      },
    ]);
    return {
      success: true,
      result: result,
    };
  }

  public async countPostByPetType(): Promise<any> {
    const result: any = await this.post.aggregate([
      {
        $match: {
          isArchived: false,
        },
      },
      {
        $group: {
          _id: "$pet.petType", // group by pet breed
          count: { $sum: 1 }, // count the number of posts per breed
        },
      },
      {
        $project: {
          _id: 0,
          breed: "$_id", // rename _id field to breed
          count: "$count",
          percentage: {
            $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100],
          },
        },
      },
    ]);

    const total = result.reduce((acc: any, breed: any) => acc + breed.count, 0);

    result.forEach((breed: any) => {
      breed.percentage = Math.round((breed.count / total) * 10000) / 100; // calculate percentage of each breed from total count
    });

    return {
      success: true,
      total,
      result,
    };
  }

  public async countPostByBreederKind(): Promise<any> {
    const result: any = await this.post.aggregate([
      {
        $match: {
          kind: "STANDARD",
          isArchived: false,
        },
      },
      {
        $group: {
          _id: "$pet.petType", // group by pet breed
          count: { $sum: 1 }, // count the number of posts per breed
        },
      },
      {
        $project: {
          _id: 0,
          breed: "$_id", // rename _id field to breed
          count: "$count",
          percentage: {
            $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100],
          },
        },
      },
    ]);

    const total = result.reduce((acc: any, breed: any) => acc + breed.count, 0);

    result.forEach((breed: any) => {
      breed.percentage = Math.round((breed.count / total) * 10000) / 100; // calculate percentage of each breed from total count
    });

    return {
      success: true,
      total,
      result,
    };
  }

  public async countPostByKind(): Promise<any> {
    const result: any = await this.post.aggregate([
      {
        $match: {
          isArchived: false,
        },
      },
      {
        $group: {
          _id: "$kind",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: "$count",
          percentage: {
            $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100],
          },
        },
      },
    ]);

    const total = result.reduce((acc: any, posts: any) => acc + posts.count, 0);

    result.forEach((posts: any) => {
      posts.percentage = Math.round((posts.count / total) * 10000) / 100;
    });

    return {
      success: true,
      total,
      result,
    };
  }

  public async getMostFavPost(): Promise<any> {
    const result: any = await this.post.aggregate([
      {
        $match: {
          isArchived: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",
          preserveNullAndEmptyArrays: true,
        },
      },
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
          postedBy: {
            userId: {
              $toString: "$users._id",
            },
            kind: "$users.account.kind",
            email: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.account.email",
                null,
              ],
            },
            firstName: "$users.profile.firstName",
            lastName: "$users.profile.lastName",
            phone: {
              $cond: [
                { $eq: ["$accountVerified", true] },
                "$users.profile.phone",
                null,
              ],
            },
            state: "$users.profile.state",
            suburb: "$users.profile.suburb",
            zipCode: "$users.profile.zipCode",
            avatarUrl: "$users.profile.avatarUrl",
            breederPrefix: "$companies.breederPrefix",
            breederBio: "$companies.bio",
          },
          location: {
            state: "$location.state",
            suburb: "$location.suburb",
          },
          images: "$images",
          childImages: "$childImages",
          isLiked: "$isLiked",
          createdAt: "$createdAt",
          likes_count: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      {
        $match: {
          likes_count: { $ne: 0 }, // filter out documents with likes_count equal to 0
        },
      },
      {
        $sort: {
          likes_count: -1,
        },
      },
    ]);
    return {
      success: true,
      result: result.slice(0, 4),
    };
  }
}
