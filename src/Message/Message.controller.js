import { Message } from "../../Model/message.model.js";
import { userModel } from "../../Model/user.model.js";
import { io, onlineUsers } from "../../index.js";


export const sendMessage = async (req, res) => {
  try {
    const { receiverId, groupId, text } = req.body;
    const userId = req.userId;
    let image = "";

    if (!receiverId && !groupId) {
      return res.status(400).json({ message: "يجب تحديد مستخدم أو مجموعة" });
    }

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const message = await Message.create({
      senderId: userId,
      receiverId: receiverId || undefined,
      groupId: groupId || undefined,
      text,
      image,
    });

    if (receiverId) {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", {
          ...message._doc,
          senderName: (await userModel.findById(userId)).name,
        });
      }
    }

    // 📡 إشعار Socket - لو شات جماعي (هنطوره لاحقًا)
    if (groupId) {
      // ممكن تجيب أعضاء الجروب من مجموعة Group وتبعت لكل عضو أونلاين
      // مثال: loop على أعضاء الجروب
      // for (const member of group.members) {
      //   const socketId = onlineUsers.get(member._id);
      //   if (socketId && member._id !== userId) {
      //     io.to(socketId).emit("newGroupMessage", {...});
      //   }
      // }
    }

    res.json({ success: true, message });

  } catch (err) {
    console.error("💥 sendMessage error:", err);
    res.status(500).json({ message: "فشل في إرسال الرسالة" });
  }
};


