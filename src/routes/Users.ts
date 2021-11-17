import { Router } from "express";
import {
  addFriendController,
  currentUserController,
  deleteFriendController,
  findUserController,
  getUserController,
  loginController,
  logoutController,
  signupController,
} from "../controller/Users";

const userRouter = Router();

userRouter.get("/current", currentUserController);
userRouter.post("/signup", signupController);
userRouter.post("/login", loginController);
userRouter.post("/logout", logoutController);
userRouter.post("/friend", addFriendController);
userRouter.get("/search", findUserController);
userRouter.get("/:userId", getUserController);
userRouter.delete("/friend/:friendId", deleteFriendController);
export default userRouter;
