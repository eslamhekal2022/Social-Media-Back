import express from "express"
import { authMiddleware } from "../../MiddleWare/MiddleWare.js"
import { sendMessage } from "./Message.controller.js"
import upload from "../../MiddleWare/uploadImages.js"

 const MessageRouter=express.Router()



 MessageRouter.post("/sendMessage",authMiddleware,upload.array("imageMessage",5),sendMessage)

 export default MessageRouter