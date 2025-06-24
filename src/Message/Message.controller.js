// controllers/messageController.js

import { io, onlineUsers } from "../../index.js";
import { MessageModel } from "../../Model/Message.model.js";
import { userModel } from "../../Model/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const userId = req.userId;

    let image = "";
    if (req.file) {
      image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

const message = await MessageModel.create({
  senderId: userId,
  receiverId,
  text,
  image,
});

await message.populate("senderId", "name image"); 
  const sender = await userModel.findById(userId).select("name");
if (receiverId !== userId) {
  const receiverSocketId = onlineUsers.get(receiverId);
  if (receiverSocketId) {
  io.to(receiverSocketId).emit("newMessage", message); // الرسالة كاملة فيها senderId.name & image
}
}
res.json({ success: true, message });

  } catch (err) {
    res.status(500).json({ message: "فشل في إرسال الرسالة" });
  }
};
