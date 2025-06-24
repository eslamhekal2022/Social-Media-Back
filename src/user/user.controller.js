import { userModel } from "../../Model/user.model.js";
import { Notification } from "../../Model/notifications.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import upload from "../../MiddleWare/uploadImages.js";
import { io, onlineUsers } from "../../index.js";
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

export const signUp = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;


    const image = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : '';

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered', success: false });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = crypto.randomBytes(32).toString('hex');
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'admin',
      image,
      emailVerificationToken: token,
      emailVerificationExpires: Date.now() + 3600000, // 1 hour
    });

    await newUser.save();

    const verificationLink = `${process.env.FrontendDomain}/verify-email/${token}`;

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'تأكيد بريدك الإلكتروني',
      html: `<p>اضغط على الرابط لتأكيد بريدك:</p><a href="${verificationLink}">${verificationLink}</a>`
    });

    res.status(201).json({ message: 'تم التسجيل بنجاح، تحقق من بريدك الإلكتروني لتفعيل الحساب', success: true,token});

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.isVerified) return res.status(401).json({ message: 'يرجى تفعيل الحساب من البريد الإلكتروني' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || ''
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'رابط التفعيل غير صالح أو منتهي' });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'تم تفعيل الحساب بنجاح. يمكنك تسجيل الدخول الآن.',success:true});
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




  export const getUsers = async (req, res) => {
    try {
      const allUsers = await userModel.find().populate("following","name email ").populate("followers","name email ");

      const countUsers=allUsers.length
      res.status(200).json({
        message: "All users retrieved successfully",
        success: true,
        data: allUsers,
        count:countUsers
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        success: false,
        error: error.message
      });
    }
  };


  export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const userDel = await userModel.findByIdAndDelete(id);
  
      if (!userDel) {
        return res.status(404).json({
          message: "User not found",
          success: false
        });
      }
  
      res.status(200).json({
        message: "User deleted successfully",
        success: true,
        data: userDel
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        success: false,
        error: error.message
      });
    }
  };

    export const deleteAllUser = async (req, res) => {
      try {
        await userModel.deleteMany()
        res.status(200).json({message:"All user IS deleted"})
      } catch (error) {
            console.error("Delete All Users Error:", error);

      }
    }


  export const updateUserRole = async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
  
      if (!['user', 'admin',"moderator"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role provided" });
      }
  
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Something went wrong", error });
    }
  };
  

export const getUser = async (req, res) => {
 try {
  const { id } = req.params;
const user=await userModel.findById(id).populate("following","name email").populate("followers","name email")

res.status(200).json({message:"userAho",success:true,data:user})
 } catch (error) {
  console.log(error)
 }
}



export const updateUserImage = async (req, res) => {
  try {
    const userId=req.userId
    const { id } = req.params;

    if(userId!==id){
      return res.status(400).json({message:"You do not user"})
    }
    // تحقق من وجود صورة مرفوعة
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { image: `/uploads/${req.file.filename}` }, // نحفظ المسار النسبي
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({data:updatedUser,success:true});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const toggleFollow = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.id;

    console.log("currentUserId",currentUserId)
    console.log("targetUserId",targetUserId)

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "لا يمكنك متابعة نفسك" });
    }

    const currentUser = await userModel.findById(currentUserId);
    const targetUser = await userModel.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);



      await Notification.deleteOne({
         senderId: currentUserId,
        receiverId: targetUserId,
        type: "follow",
      })


      // إنشاء إشعار متابعة
      const followNotification = new Notification({
        senderId: currentUserId,
        receiverId: targetUserId,
        type: "follow",
      });
      await followNotification.save();

      // إرسال الإشعار عبر Socket.IO
    if(targetUserId!==currentUser){
    const receiverSocketId = onlineUsers.get(targetUserId);
if (receiverSocketId) {
  io.to(receiverSocketId).emit("getFollow", {
    senderId: currentUserId,
    senderName: currentUser.name,
    receiverId: targetUserId,
    type: "follow",
    createdAt: new Date(),
  });
}
    }

    }

    await currentUser.save();
    await targetUser.save();

    res.json({ success: true, following: !isFollowing });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};



export const getFollowers = async (req, res) => {
  const user = await userModel.findById(req.params.id).populate("followers", "name image");
  res.json({ success: true, followers: user.followers });
};

export const getFollowing = async (req, res) => {
  const user = await userModel.findById(req.params.id).populate("following", "name image");
  res.json({ success: true, following: user.following });
};


export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: "Query parameter is required" });
    }

    const products = await userModel.find({
      $or: [
        { 'name': { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Error searching for products", error });
  }
};

export const EditUserInfo = async (req,res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const userUpdated = await userModel.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    );

    if (!userUpdated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: userUpdated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};