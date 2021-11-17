import { Request, Response, NextFunction } from "express";
import { ValidationError } from "yup";
import Post from "../model/posts";
import User from "../model/user";
import { HttpError } from "../util/Error";
import { createPostValidator } from "./validators/postValidator";

export const getUserPostsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.params.userId);

  const currentUserId = req.session.userId;
  if (!currentUserId) {
    return next(new HttpError(405, "you are not logged in!"));
  }
  try {
    const foundUser = await User.findById(req.params.userId);
    if (!foundUser) {
      return next(
        new HttpError(
          500,
          "Something went wrong please contact customer support!"
        )
      );
    }
    const foundPosts = await Post.find({ author: foundUser.id })
      .populate("author")
      .sort({
        createdAt: "desc",
      });

    res.json({ posts: foundPosts });
  } catch (err) {
    return next(
      new HttpError(500, "Something went wrong please try again later!")
    );
  }
};
export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUserId = req.session.userId;
  if (!currentUserId) {
    return next(new HttpError(405, "you are not logged in!"));
  }
  const foundUser = await User.findById(currentUserId);
  if (!foundUser) {
    return next(
      new HttpError(
        500,
        "Something went wrong please contact customer support!"
      )
    );
  }
  console.log("this line: " + foundUser.friends[0]);

  const foundPosts = await Post.find({
    author: { $in: foundUser.friends },
  })
    .sort({ createdAt: "desc" })
    .populate(["author"]);

  res.json({ posts: foundPosts });
};
export const addPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: { field: string; message: string }[] = [];
  if (!req.session.userId) {
    return next(new HttpError(405, "user is not logged in!"));
  }
  try {
    await createPostValidator
      .validate({ ...req.body }, { abortEarly: false })
      .catch(function (err: ValidationError) {
        err.inner.forEach((e: any) => {
          error.push({ field: e.path, message: e!.message });
        });
      });
    if (error.length > 0) {
      return next(new HttpError(400, JSON.stringify(error)));
    }
    const createdPost = await Post.create({
      author: req.session.userId,
      content: req.body.content,
    });
    await createdPost.save();
    res.send("post saved successfully!");
  } catch (err) {
    return next(
      new HttpError(
        500,
        "Something went wrong please contact customer support!"
      )
    );
  }
};
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.userId) {
    return next(new HttpError(405, "user is not logged in!"));
  }
  try {
    const foundPost = await Post.findById(req.params.postId);
    if (foundPost.author !== req.session.userId) {
      return next(new HttpError(405, "forbidden from deleting post!"));
    }
    await foundPost.delete();
    res.send("post deleted successfully");
  } catch (err) {
    return next(
      new HttpError(
        500,
        "Something went wrong please contact customer support!"
      )
    );
  }
};
export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.userId) {
    return next(new HttpError(405, "user is not logged in!"));
  }
  try {
    await Post.findOneAndUpdate(
      { id: req.body.postId },
      { $push: { likes: req.session.userId } }
    );
    res.send("like successful!");
  } catch (err) {
    return next(
      new HttpError(
        500,
        "Something went wrong please contact customer support!"
      )
    );
  }
};
export const unlikePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.userId) {
    return next(new HttpError(405, "user is not logged in!"));
  }
  try {
    await Post.findOneAndUpdate(
      { id: req.body.postId },
      { $pull: { likes: req.session.userId } }
    );
    res.send("unliked successful!");
  } catch (err) {
    return next(
      new HttpError(
        500,
        "Something went wrong please contact customer support!"
      )
    );
  }
};
