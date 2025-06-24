import { json } from "express";
import { ConversationModel } from "../../Model/converstions.js";
import { MessageModel } from "../../Model/Message.model.js";

export const createConversation = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;

    // Check if conversation already exists
    let conversation = await ConversationModel.findOne({
      members: { $all: [senderId, receiverId] },
      isGroup: false,
    });

    if (conversation) {
      return res.json({ success: true, conversation });
    }

    // Create new one
    conversation = await ConversationModel.create({
      members: [senderId, receiverId],
    });
await conversation.populate("members", "name image");


    res.json({ success: true, conversation });
  } catch (error) {
    console.error("❌ Create Conversation Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await ConversationModel.find({
      members: userId,
    })
      .sort({ updatedAt: -1 })
      .populate("members", "name image");

    res.json({ success: true, conversations });
  } catch (err) {
    console.error("❌ Get Conversations Error:", err);
    res.status(500).json({ message: "فشل في جلب المحادثات" });
  }
};


export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await MessageModel.find({
      $or: [
        { groupId: conversationId },
        {
          $and: [
            { senderId: { $in: req.userId } },
            { receiverId: { $in: req.userId } }
          ],
        },
      ],
    })
      .sort({ createdAt: 1 }) // ترتيب حسب الأقدم فالأحدث
      .populate("senderId", "name image");

    res.json({ success: true, messages });
  } catch (err) {
    console.error("❌ Get Messages Error:", err);
    res.status(500).json({ message: "فشل في جلب الرسائل" });
  }
};

export const getDirectMessages = async (req, res) => {
  try {
    const { userId } = req.params; // الشخص اللي بكلمه
    const myId = req.userId;

    const messages = await MessageModel.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
.populate("senderId", "name image")
.populate("receiverId", "name image")

    res.json({ success: true, messages });
  } catch (err) {
    console.error("❌ Get Messages Error:", err);
    res.status(500).json({ message: "فشل في جلب الرسائل" });
  }
};
export const DeleteMessages = async (req, res) => {
  try {
    await MessageModel.deleteMany({})
    res.status(200).json({message:"AllMessage IS Bye",success:true})
  } catch (error) {
    res.status(404).json({message:"AllMessage Is KosOmk"})
  }
}