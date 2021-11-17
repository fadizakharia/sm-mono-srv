import { Router } from "express";
import {
  addPost,
  deletePost,
  getPosts,
  getUserPostsController,
  likePost,
  unlikePost,
} from "../controller/Posts";

const postRouter = Router();
postRouter.post("/", addPost);
postRouter.delete("/:postId", deletePost);
postRouter.get("/", getPosts);
postRouter.get("/user/:userId", getUserPostsController);
postRouter.post("/like", likePost);
postRouter.post("/like", unlikePost);

export default postRouter;
