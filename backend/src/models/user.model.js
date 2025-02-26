const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      bio: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String,
        default: null,
      },
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: ["adoption_request", "message", "system"],
          required: true,
        },
        title: String,
        message: String,
        read: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    publications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
      },
    ],
    adoptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adoption",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 密码加密中间件
userSchema.pre("save", async function (next) {
  // 如果密码已经是哈希值，跳过哈希
  if (!this.isModified("password") || this.password.startsWith("$2a$")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log("密码比较:", {
    candidate: candidatePassword,
    stored: this.password,
  });
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log("密码比较结果:", isMatch);
  return isMatch;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
