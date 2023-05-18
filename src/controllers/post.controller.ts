import { NextFunction, Request, Response } from "express";
import {
  CountPostByDate,
  CountPostByUserResDto,
  CreatePostReqDto,
  CreatePostResDto,
  DeletePostReqDto,
  DeletePostResDto,
  FavoritePostReqDto,
  FavoritePostResDto,
  GetFavPostsByUserResDto,
  GetPetInfoByIdResDto,
  GetPostByIdReqDto,
  GetPostByIdResDto,
  GetPostImgByIdResDto,
  GetPostOwnerResDto,
  GetPostsReqDto,
  GetPostsResDto,
  GetPostsV2ResDto,
  UpdatePostReqDto,
  UpdatePostResDto,
} from "../dtos/post.dto";
import { GetCurrentUserResDto } from "../dtos/user.dto";
import { RequestWithUser } from "../interfaces/auth.interface";
import { Post } from "../interfaces/models/post.model.interface";
import { PostService } from "../services/post.service";
import UserService from "../services/user.service";

class PostController {
  private postService = new PostService();
  private userService = new UserService();

  public createPost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqInputData: CreatePostReqDto = req.body as any;
      //console.log("Req Input", reqInputData);

      const outputData: any = await this.postService.createPost(
        reqInputData,
        req.user
      );
      let resp: CreatePostResDto;
      outputData
        ? (resp = {
            success: true,
            createdPostId: outputData._id.toString(),
          })
        : (resp = {
            success: false,
            createdPostId: null,
          });

      res.status(201).json(resp);
    } catch (error) {
      next(error);
    }
  };
  public likePost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let { postId }: FavoritePostReqDto = req.params as any;
      let { user } = req;
      let outputData: FavoritePostResDto = await this.postService.likePost(
        user,
        postId
      );
      res.status(201).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public removeLikePost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let { postId }: FavoritePostReqDto = req.params as any;
      let { user } = req;
      let outputData: FavoritePostResDto =
        await this.postService.removeLikePost(user, postId);
      res.status(201).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public favoritePostsByUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let { user } = req;

      let isVerified: boolean = false;
      if (user) {
        const currentUser: GetCurrentUserResDto =
          await this.userService.getCurrentUser(user);

        isVerified = currentUser.account.isVerified;
      }

      let outputData: GetFavPostsByUserResDto =
        await this.postService.getFavPostsByUser(user, isVerified);
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getPostsByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let { userId } = req.params as any;

      let outputData: GetFavPostsByUserResDto =
        await this.postService.getFavPostsByUser(userId, true);
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getAllPosts = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        pageNumber,
        pageSize,
        postedBy,
        petType,
        petAge,
        petSize,
        petExpectedAdultSize,
        petVeterinaryChecked,
        petSex,
        petGoodWith,
        petCoatLength,
        petCare,
        petIsInShelter,
        search,
        state,
      }: GetPostsReqDto = req.query as any;

      let isVerified: boolean = false;
      if (req.user) {
        const currentUser: GetCurrentUserResDto =
          await this.userService.getCurrentUser(req.user);

        isVerified = currentUser.account.isVerified;
      }

      const allPostsResp: GetPostsResDto = await this.postService.getAllPosts(
        pageNumber,
        pageSize,
        postedBy,
        petType,
        petAge,
        petSize,
        petExpectedAdultSize,
        petVeterinaryChecked,
        petSex,
        petGoodWith,
        petCoatLength,
        petCare,
        petIsInShelter,
        search,
        state,
        isVerified
      );

      res.status(200).json(allPostsResp);
    } catch (error) {
      next(error);
    }
  };

  public getAllPostsV2 = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        pageNumber,
        pageSize,
        postedBy,
        petType,
        petAge,
        petSize,
        petExpectedAdultSize,
        petVeterinaryChecked,
        petSex,
        petGoodWith,
        petCoatLength,
        petCare,
        petIsInShelter,
        search,
        state,
      }: GetPostsReqDto = req.query as any;

      const allPostsResp: GetPostsV2ResDto =
        await this.postService.getAllPostsV2(
          pageNumber,
          pageSize,
          postedBy,
          petType,
          petAge,
          petSize,
          petExpectedAdultSize,
          petVeterinaryChecked,
          petSex,
          petGoodWith,
          petCoatLength,
          petCare,
          petIsInShelter,
          search,
          state,
          req.user
        );

      res.status(200).json(allPostsResp);
    } catch (error) {
      next(error);
    }
  };
  public getAllPostsV2Admin = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        pageNumber,
        pageSize,
        postedBy,
        petType,
        petAge,
        petSize,
        petExpectedAdultSize,
        petVeterinaryChecked,
        petSex,
        petGoodWith,
        petCoatLength,
        petCare,
        petIsInShelter,
        search,
        state,
      }: GetPostsReqDto = req.query as any;

      const allPostsResp: GetPostsV2ResDto =
        await this.postService.getAllPostsV2(
          pageNumber,
          pageSize,
          postedBy,
          petType,
          petAge,
          petSize,
          petExpectedAdultSize,
          petVeterinaryChecked,
          petSex,
          petGoodWith,
          petCoatLength,
          petCare,
          petIsInShelter,
          search,
          state,
          req.user
        );

      res.status(200).json(allPostsResp);
    } catch (error) {
      next(error);
    }
  };
  public getAllPostsAdmin = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        pageNumber,
        pageSize,
        postedBy,
        petType,
        petAge,
        petSize,
        petExpectedAdultSize,
        petVeterinaryChecked,
        petSex,
        petGoodWith,
        petCoatLength,
        petCare,
        petIsInShelter,
        search,
        state,
      }: GetPostsReqDto = req.query as any;

      let isVerified: boolean = false;
      if (req.user) {
        const currentUser: GetCurrentUserResDto =
          await this.userService.getCurrentUser(req.user);

        isVerified = currentUser.account.isVerified;
      }

      const allPostsResp: GetPostsResDto = await this.postService.getAllPosts(
        pageNumber,
        pageSize,
        postedBy,
        petType,
        petAge,
        petSize,
        petExpectedAdultSize,
        petVeterinaryChecked,
        petSex,
        petGoodWith,
        petCoatLength,
        petCare,
        petIsInShelter,
        search,
        state,
        isVerified
      );

      res.status(200).json(allPostsResp);
    } catch (error) {
      next(error);
    }
  };
  public deletePost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { postId }: DeletePostReqDto = req.params as any;
      let deletedPost: Post = await this.postService.deletePost(
        postId,
        req.user
      );
      let resp: DeletePostResDto;
      deletedPost
        ? (resp = {
            success: true,
          })
        : (resp = { success: false });

      res.status(200).json(resp);
    } catch (error) {
      next(error);
    }
  };
  public updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const inputData: UpdatePostReqDto = req.body as any;
      const { postId } = req.params as any;
      const outputData: Post = await this.postService.updatePost(
        inputData,
        postId
      );
      let resp: UpdatePostResDto;
      outputData
        ? (resp = {
            success: true,
          })
        : (resp = {
            success: false,
          });

      res.status(200).json(resp);
    } catch (error) {
      next(error);
    }
  };
  public getPostById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let isVerified: boolean = false;
      if (req.user) {
        const currentUser: GetCurrentUserResDto =
          await this.userService.getCurrentUser(req.user);

        isVerified = currentUser.account.isVerified;
      }

      let inputData: GetPostByIdReqDto = req.params as any;
      let { postId } = inputData;
      let outputData: GetPostByIdResDto = await this.postService.getPostById(
        postId,
        isVerified
      );
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getPetInfoByPostId = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let isVerified: boolean = false;
      if (req.user) {
        const currentUser: GetCurrentUserResDto =
          await this.userService.getCurrentUser(req.user);

        isVerified = currentUser.account.isVerified;
      }

      let inputData: GetPostByIdReqDto = req.params as any;
      let { postId } = inputData;
      let outputData: GetPetInfoByIdResDto =
        await this.postService.getPetInfoByPostId(postId, isVerified);
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getPostImgsById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let isVerified: boolean = false;
      if (req.user) {
        const currentUser: GetCurrentUserResDto =
          await this.userService.getCurrentUser(req.user);

        isVerified = currentUser.account.isVerified;
      }

      let inputData: GetPostByIdReqDto = req.params as any;
      let { postId } = inputData;
      let outputData: GetPostImgByIdResDto =
        await this.postService.getPostImageById(postId, isVerified);
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public countPostsByState = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let outputData: any = await this.postService.getAllPostsByState();
      res.status(200).json(outputData);
    } catch (error) {
      console.log("Error", error);
      next(error);
    }
  };
  public countPostsByUserType = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    let { userType } = req.query as any;
    try {
      let outputData: any = await this.postService.CountAllPostByFilter(
        userType
      );
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public countPostsAnGroupByUserType = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let outputData: any = await this.postService.CountAllPostAndGroupByUser();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getPostByOwner = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { postId } = req.params as any;
    try {
      let outputData: GetPostOwnerResDto = await this.postService.getPostOwner(
        postId
      );
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public countPostByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { userId } = req.params as any;
    try {
      let outputData: CountPostByUserResDto =
        await this.postService.countPostsByUser(userId);
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public deletePostByAdmin = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { postId }: DeletePostReqDto = req.params as any;
      let deletedPost: Post = await this.postService.deletePostByAdmin(postId);
      let resp: DeletePostResDto;
      if (deletedPost) {
        resp = { success: true };
      } else {
        resp = { success: false };
      }
      res.status(200).json(resp);
    } catch (error) {
      next(error);
    }
  };
  public getCountByDate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let { type } = req.query as any;
      let outputData: CountPostByDate = await this.postService.countPostByDate(
        type
      );
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getCountByBreeder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let outputData: any = await this.postService.countPostByBreeder();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
  public getCountByPetType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let outputData: any = await this.postService.countPostByPetType();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getCountByBreederKind = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let outputData: any = await this.postService.countPostByBreederKind();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getCountByKind = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let outputData: any = await this.postService.countPostByKind();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };

  public getMostFavPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let outputData: any = await this.postService.getMostFavPost();
      res.status(200).json(outputData);
    } catch (error) {
      next(error);
    }
  };
}

export default PostController;
