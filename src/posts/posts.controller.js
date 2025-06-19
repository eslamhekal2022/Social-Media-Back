import { Notification } from "../../Model/notifications.js";
import { userModel } from "../../Model/user.model.js";
import { Post } from "../../Model/post.model.js";
import { io, onlineUsers } from "../../index.js";

export const addPost = async (req, res) => {
  try {
    const { content, image } = req.body;


console.log("content",content)
const imagePaths = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const newPost = new Post({ content, image:imagePaths,user:req.userId });
    await newPost.save();
    await newPost.populate("user","name email image")
    res.status(201).json({
      message: "Post added successfully",
      success: true,
      post: newPost,
    });
    console.log("NewPost",newPost)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getUserPost = async (req, res) => {
try {
    const posts=await Post.find({user:req.userId})
    .populate("user","name email image ").populate("comments.user","name email image").populate("likes")
    const countPosts=posts.length
    if(!posts){
        return res.status(404).json({
            message:" kos pos",
            success:false
        })
    }
    res.status(200).json({message:"khod ya kos",success:true,posts,countPosts})
} 
catch (error) {
    console.log(error)
}
}

export const getPosts = async (req, res) => {
  try {
    const randomPosts = await Post.aggregate([
      { $sample: { size: 10 } } // جيب 10 عشوائيًا
    ]);

    // Manual population (لأن aggregate ما بيعملش populate)
    const populatedPosts = await Post.populate(randomPosts, [
      { path: "user", select: "name email image" },
      { path: "comments.user", select: "name email image" },
      { path: "likes", select: "name email image" },
    ]);

    res.status(200).json({ message: "randomPosts", success: true, data: populatedPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "فشل السيرفر" });
  }
};

export const deletePost = async (req, res) => {
    try {
      const { id } = req.params;
      const postDel = await Post.findByIdAndDelete(id);
  
      if (!postDel) {
        return res.status(404).json({
          message: "User not found",
          success: false
        });
      }
  
      res.status(200).json({
        message: "User deleted successfully",
        success: true,
        data: postDel
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        success: false,
        error: error.message
      });
    }
};




export const likedPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.userId;

    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);

      const receiverId = post.user.toString();

      await Notification.deleteMany({
        senderId: userId,
        receiverId,
        postId: post._id,
        type: "like",
      });

      const newNotification = new Notification({
        senderId: userId,
        receiverId,
        postId: post._id,
        type: "like",
      });

      await newNotification.save();

      // ✅ Get sender name
      const sender = await userModel.findById(userId).select("name");

      // 🔴 Real-time Notification (Socket.io)
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("getNotification", {
          senderId: userId,
          senderName: sender.name, // ✅ أرسل الاسم هنا
          receiverId,
          postId: post._id,
          type: "like",
          createdAt: new Date(),
        });
      }
    }

    await post.save();
    await post.populate("likes");

    res.json({ success: true, likes: post.likes });

  } catch (err) {
    console.error("❌ Like Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    const userId = req.userId;

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✏️ جهّز الكومنت
    const comment = {
      text,
      user: userId,
      createdAt: new Date()
    };

    // ✏️ ضيفه للبوست
    post.comments.push(comment);

    // ✨ سجل إشعار في الداتابيز
    const receiverId = post.user.toString();

    // ✳️ جيب اسم المستخدم اللي علّق
    const sender = await userModel.findById(userId).select("name");

    // ✉️ ابعت إشعار فوري
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("doComment", {
        senderId: userId,
        senderName: sender.name,
        receiverId,
        postId: post._id,
        type: "comment",
        createdAt: new Date(),
      });
    }

    await post.save();
    await post.populate("comments.user");

    res.json({ success: true, comments: post.comments });

  } catch (err) {
    console.error("❌ Comment Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteAllPosts=async (req,res)=>{
  try {
    const allPosts=await Post.deleteMany()
    res.status(200).json({
      message:"AllPostsIsDel",
      success:true,allPosts
    })
  } catch (error) {
    
  }
}

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId)     
    .populate("user","name email image ")
    .populate("comments.user","name email image")
    

    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.find(c => c._id.toString() === commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
      comments: post.comments,
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // السماح فقط لصاحب الكومنت بالتعديل
    if (comment.user._id.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    comment.text = text;
    await post.save();
    await post.populate("comments.user");
    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comments: post.comments,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
