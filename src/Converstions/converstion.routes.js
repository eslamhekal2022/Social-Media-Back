import express from "express";
import { createConversation, DeleteMessages, getDirectMessages, getMessagesByConversation, getMyConversations } from "./Converstions.controller.js";
import { authMiddleware } from "../../MiddleWare/MiddleWare.js";

const ConverstionsRouter = express.Router();

ConverstionsRouter.post("/conversations", authMiddleware, createConversation);
ConverstionsRouter.get("/Myconversations", authMiddleware, getMyConversations);
ConverstionsRouter.get("/getMessagesByConversation/:conversationId", authMiddleware, getMessagesByConversation);
ConverstionsRouter.get("/getDirectMessages/:userId", authMiddleware, getDirectMessages);
ConverstionsRouter.delete("/DeleteMessages", DeleteMessages);

export default ConverstionsRouter;
