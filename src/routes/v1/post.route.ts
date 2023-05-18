import { Router } from "express";
import PostController from "../../controllers/post.controller";
import { CreatePostReqDto, UpdatePostReqDto } from "../../dtos/post.dto";
import { Routes } from "../../interfaces/routes.interface";
import authMiddleware from "../../middlewares/auth.middleware";
import validationMiddleware from "../../middlewares/validation.middleware";

class PostRouteV1 implements Routes {
  public path = "/api/v1/posts";
  public adminPath = "/api/v1/admin/posts";
  public router = Router();
  public postController = new PostController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(CreatePostReqDto, "body"),
      this.postController.createPost
    );

    //this.router.get(this.path, authMiddleware, this.postController.getAllPosts);
    //this.router.get(this.path, this.postController.getAllPosts);
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.postController.getAllPosts
    );
    this.router.get(
      `${this.path}-v2`,
      authMiddleware,
      this.postController.getAllPostsV2
    );
    this.router.get(
      `${this.path}/:postId`,
      authMiddleware,
      this.postController.getPostById
    );
    this.router.put(
      `${this.path}/:postId`,
      authMiddleware,
      validationMiddleware(UpdatePostReqDto),
      this.postController.updatePost
    );

    this.router.delete(
      `${this.path}/:postId`,
      authMiddleware,

      this.postController.deletePost
    );
    this.router.post(
      `${this.path}/:postId`,
      authMiddleware,

      this.postController.likePost
    );
    this.router.post(
      `${this.path}-unfav/:postId`,
      authMiddleware,

      this.postController.removeLikePost
    );
    this.router.post(
      `${this.path}-fav`,
      authMiddleware,
      this.postController.favoritePostsByUser
    );
    this.router.get(
      `${this.adminPath}-count`,

      this.postController.countPostsByState
    );
    this.router.get(
      `${this.adminPath}/:postId`,
      this.postController.getPostById
    );
    this.router.get(
      `${this.adminPath}-count-posts-type`,
      authMiddleware,
      this.postController.countPostsByUserType
    );
    this.router.get(
      `${this.adminPath}-count-posts-group`,
      authMiddleware,
      this.postController.countPostsAnGroupByUserType
    );

    this.router.get(
      `${this.adminPath}`,
      authMiddleware,
      this.postController.getAllPostsV2Admin
    );
    // this.router.get(
    //   `${this.adminPath}-pets`,
    //   authMiddleware,
    //   this.postController.getAllPostsV2Admin
    // );
    this.router.get(
      `${this.adminPath}-imgs/:postId`,
      authMiddleware,
      this.postController.getPostImgsById
    );
    this.router.get(
      `${this.adminPath}-pet/:postId`,
      authMiddleware,
      this.postController.getPetInfoByPostId
    );
    this.router.get(
      `${this.adminPath}-owner/:postId`,
      authMiddleware,
      this.postController.getPostByOwner
    );
    this.router.get(
      `${this.adminPath}-user/:userId`,
      authMiddleware,
      this.postController.getPostsByUser
    );
    this.router.get(
      `${this.adminPath}-count-user/:userId`,
      authMiddleware,
      this.postController.countPostByUser
    );
    this.router.get(
      `${this.adminPath}-count-date`,
      this.postController.getCountByDate
    );
    this.router.get(
      `${this.adminPath}-count-breeder`,
      this.postController.getCountByBreeder
    );
    this.router.get(
      `${this.adminPath}-count-pet`,
      this.postController.getCountByPetType
    );
    this.router.get(
      `${this.adminPath}-count-pet-breeder`,
      this.postController.getCountByBreederKind
    );
    this.router.get(
      `${this.adminPath}-count-kind`,
      this.postController.getCountByKind
    );
    this.router.delete(
      `${this.adminPath}/:postId`,
      authMiddleware,
      this.postController.deletePostByAdmin
    );
    this.router.get(
      `${this.adminPath}-most-fav`,

      this.postController.getMostFavPosts
    );
  }
}

export default PostRouteV1;
