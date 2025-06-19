import express from "express"
import { addPost,getUserPost,deletePost,likedPost, commentPost, deleteAllPosts, getPosts, deleteComment, updateComment } from "./posts.controller.js"
import { authMiddleware } from "../../MiddleWare/MiddleWare.js"
import upload from "../../MiddleWare/uploadImages.js"

const postRouter=express.Router()
postRouter.post("/addPost",authMiddleware,upload.array("imagePost",5),addPost)
postRouter.post("/CommentPost/:id",authMiddleware,commentPost)
postRouter.get("/getUserposts",authMiddleware,getUserPost)
postRouter.get("/posts",authMiddleware,getUserPost)
postRouter.get("/getPosts",getPosts)
postRouter.delete("/deleteAllPosts",deleteAllPosts)
postRouter.delete("/deleteComment/:postId/:commentId",authMiddleware,deleteComment)
postRouter.delete("/deletePost/:id",deletePost)
postRouter.put("/likePost/:id",authMiddleware,likedPost)
postRouter.put("/edit-comment/:postId/:commentId", authMiddleware, updateComment);

export default postRouter