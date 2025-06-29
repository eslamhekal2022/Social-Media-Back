import  mongoose  from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number
  },
  role: {
    type: String,
    enum: ['user', 'admin',"moderator"],
    default: 'admin',
  },
  image: {
    type: String,
    default: '',
  },
 
    followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified:{ type: Boolean, default: false }
},{timestamps: true});




export const userModel = mongoose.model('User', UserSchema);
