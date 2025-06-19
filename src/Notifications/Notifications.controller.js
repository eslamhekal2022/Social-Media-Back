import { Notification } from "../../Model/notifications.js";


export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("userId",userId)
    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .populate("senderId", "name image") // لو عايز تجيب اسم وصورة اللي بعت
      .populate("postId", "content image"); // ولو عايز تجيب بيانات البوست
const countNoti=notifications.length
      console.log("notificaions",notifications)
    res.json({ success: true, notifications,countNoti});
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateRead = async (req, res) => {
  try {
    const { NotificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      NotificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found", success: false });
    }

    console.log("notification",notification)
    console.log("NotificationId",NotificationId)

    res.status(200).json({
      message: "Notification marked as read",
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error updating notification read status:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


export const DelNotifications = async (req, res) => {
try {
  await Notification.deleteMany()
  res.status(200).json({
    message:"Notifications is Deleted",
    success:true
  })
} catch (error) {
  console.log(error)
}
}