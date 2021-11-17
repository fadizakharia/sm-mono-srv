import { Request, Response, NextFunction } from "express";
import { ValidationError } from "yup";
import User from "../model/user";
import { HttpError } from "../util/Error";
import { loginValidator, signupValidator } from "./validators/userValidator";
import Argon from "argon2";

export const currentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("here");

  const currentUserId = req.session!.userId;

  console.log(currentUserId);
  if (!currentUserId) {
    return next(new HttpError(405, "user is not logged in!"));
  }
  try {
    const currentUser = await (
      await User.findById(currentUserId)
    ).populate("friends");
    console.log(currentUser);

    if (!currentUser) {
      return next(new HttpError(500, "Something went wrong!"));
    }
    res.json({ user: currentUser });
  } catch (err) {
    console.log(err);

    return next(new HttpError(500, "Something went wrong!"));
  }
};
export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: { field: string; message: string }[] = [];
  if (req.session!.userId) {
    return next(new HttpError(405, "user is already logged in!"));
  }
  try {
    await signupValidator
      .validate({ ...req.body }, { abortEarly: false })
      .catch(function (err: ValidationError) {
        err.inner.forEach((e: any) => {
          error.push({ field: e.path, message: e!.message });
        });
      });
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) {
      error.push({ field: "email", message: "user already exists!" });
    }
    if (error.length > 0) {
      return next(new HttpError(400, JSON.stringify(error)));
    }
    const hashedPassword = await Argon.hash(req.body.password, {
      version: Argon.argon2id,
    });
    const createdUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    const savedUser = await createdUser.save();

    res.json({ user: savedUser });
  } catch (err) {
    return next(
      new HttpError(500, "Something went wrong, please try again later!")
    );
  }
};
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: { field: string; message: string }[] = [];
  if (req.session.userId) {
    return next(new HttpError(405, "user is already logged in!"));
  }
  try {
    await loginValidator
      .validate({ ...req.body }, { abortEarly: false })
      .catch(function (err: ValidationError) {
        err.inner.forEach((e: any) => {
          error.push({ field: e.path, message: e!.message });
        });
      });
    const foundUser = await User.findOne({ email: req.body.email }).populate(
      "friends"
    );
    if (!foundUser) {
      error.push({ field: "email", message: "email is incorrect!" });
    }

    if (error.length > 0) {
      return next(new HttpError(400, JSON.stringify(error)));
    }
    const passwordValidity = await Argon.verify(
      foundUser.password,
      req.body.password,
      {
        version: Argon.argon2id,
      }
    );
    if (foundUser && passwordValidity) {
      error.push({ field: "password", message: "incorrect password" });
    }

    if (error.length > 0) {
      return next(new HttpError(400, JSON.stringify(error)));
    }
    req.session.userId = foundUser.id;
    res.json({ user: foundUser });
  } catch (err) {
    return next(
      new HttpError(500, "Something went wrong, please try again later!")
    );
  }
};
export const logoutController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session.userId) {
      req.session.destroy((err: Error) => {
        if (err) {
          return next(
            new HttpError(500, "Something went wrong, please try again later!")
          );
        }
        res.send("user logged out successfuly");
      });
      req.session = undefined;
    } else {
      return next(new HttpError(405, "user is not logged in!"));
    }
  } catch (err) {
    return next(new HttpError(500, "something went wrong!"));
  }
};
export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  try {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return next(new HttpError(404, "user not found!"));
    }
    res.json({ user: foundUser });
  } catch (err) {
    return next(new HttpError(500, "something went wrong!"));
  }
};
export const findUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const searchString = req.query.search ? req.query.search : "";

  try {
    const foundUsers = await User.find({
      $text: { $search: searchString.toString() },
    });

    if (!foundUsers) {
      return next(new HttpError(404, "no users found!"));
    }

    res.json({ users: foundUsers });
  } catch (err) {
    return next(new HttpError(500, "something went wrong!"));
  }
};
export const addFriendController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body.friendId);

    const currentUserId = req.session.userId;
    if (!currentUserId) {
      return next(new HttpError(405, "you are not logged in!"));
    }
    const currentUser = await User.findById(currentUserId);
    const foundUser = await User.findById(req.body.friendId);
    if (!foundUser) {
      return next(new HttpError(404, "user not found!"));
    }
    if (currentUser.friends.includes(req.body.friendId)) {
      return next(new HttpError(400, "user is already a friend!"));
    }
    await currentUser.update({
      $push: { friends: req.body.friendId },
    });
    await foundUser.update({
      $push: { friends: currentUser.id },
    });
    res.status(200).send("user added successfully!");
  } catch (err) {
    return next(new HttpError(500, "Something went wrong!"));
  }
};
export const deleteFriendController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.session.userId;
    if (!currentUserId) {
      return next(new HttpError(405, "you are not logged in!"));
    }
    const currentUser = await User.findById(currentUserId);
    const foundUser = await User.findById(req.params.friendId);

    if (!foundUser) {
      return next(new HttpError(404, "user not found!"));
    }
    let isInArray = false;
    for (let friend of currentUser.friends) {
      if (friend.toString() === foundUser._id.toString()) {
        isInArray = true;
      }
    }
    if (!isInArray) {
      return next(new HttpError(400, "user is not a friend!"));
    }
    await currentUser.update({
      $pull: { friends: foundUser._id },
    });
    await foundUser.update({
      $pull: { friends: currentUser._id },
    });
    res.send("user removed successfully!");
  } catch (err) {
    console.log(err);

    return next(new HttpError(500, "Something went wrong!"));
  }
};
