import express from "express"
import { authMiddleware } from "../../MiddleWare/MiddleWare.js"
import { DelNotifications, getUserNotifications, updateRead } from "./Notifications.controller.js"

 const NotificationRouter=express.Router()



 NotificationRouter.get("/notifications",authMiddleware,getUserNotifications)
 NotificationRouter.put("/updateRead/:NotificationId",updateRead)
 NotificationRouter.delete("/DelNotifications",DelNotifications)
 
 export default NotificationRouter