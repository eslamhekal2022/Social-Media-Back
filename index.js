import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";

import userRouter from "./src/user/user.routes.js";
import postRouter from "./src/posts/post.routes.js";
import { connectDB } from "./dbConnection/dbConnection.js";
import NotificationRouter from "./src/Notifications/Notifications.routes.js";
import MessageRouter from "./src/Message/message.routes.js";
import ConverstionsRouter from "./src/Converstions/converstion.routes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

export const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);
socket.on("addUser", (userId) => {
  onlineUsers.set(userId, socket.id);
  console.log("🟢 User online:", userId);
});
  socket.on("disconnect",() => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log("❌ User disconnected:", userId);
        break;
      }
    }
  });
});

// 🔗 MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(morgan("dev"));

// 📁 ROUTES
app.use(userRouter);
app.use(postRouter);
app.use(NotificationRouter);
app.use(MessageRouter);
app.use(ConverstionsRouter);

app.get("/", (req, res) => {
  res.send("🚀 Welcome to the Ecommerce API!");
});

// ✅ Start Server
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
