import express from "express";
import { EditUserInfo,signUp ,signIn, getUsers, deleteUser, updateUserRole, getUser, updateUserImage,  toggleFollow, getFollowers, getFollowing, verifyEmail, searchUsers, deleteAllUser} from "./user.controller.js";
import { authMiddleware, isAdmin } from "../../MiddleWare/MiddleWare.js";
import upload from "../../MiddleWare/uploadImages.js";


const userRouter = express.Router();

userRouter.get("/getUsers", getUsers);
userRouter.post("/register",upload.single("image"),signUp);
userRouter.post("/verify-email/:token",verifyEmail);

userRouter.post("/login", signIn);
userRouter.post("/deleteUser/:id", deleteUser);
userRouter.delete("/deleteAllUser", deleteAllUser);

userRouter.put('/update-role/:userId', updateUserRole);
userRouter.get("/getuser/:id", getUser);
userRouter.get("/searchUsers", searchUsers);
userRouter.post("/updateUserImage/:id",upload.single("image"),authMiddleware, updateUserImage);

userRouter.put("/follow/:id", authMiddleware, toggleFollow);
userRouter.get("/followers/:id", authMiddleware, getFollowers);
userRouter.get("/following/:id", authMiddleware, getFollowing);
// Edit User
userRouter.put("/editUser", authMiddleware, EditUserInfo);

export default userRouter;