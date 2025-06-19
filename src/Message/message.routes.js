import express from "express"
import { sendMessage } from "./Message.controller.js"
import { authMiddleware } from "../../MiddleWare/MiddleWare.js"
import upload from "../../MiddleWare/uploadImages.js"

const MessageRouter=express.Router()

MessageRouter.post("/sendMessage",authMiddleware,sendMessage)

export default MessageRouter