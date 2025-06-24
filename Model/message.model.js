// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  text: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export const MessageModel = mongoose.model("Message", messageSchema);
