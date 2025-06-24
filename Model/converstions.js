import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String,default:"" },
  groupImage: { type: String,default:"" },
}, { timestamps: true });

export const ConversationModel = mongoose.model("Conversation", conversationSchema);
