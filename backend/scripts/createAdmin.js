const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/user.model");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB连接成功");

    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("删除现有管理员用户");
      await User.deleteOne({ role: "admin" });
    }

    // 手动生成密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    console.log("生成的密码哈希:", hashedPassword);

    // 创建管理员用户
    const adminUser = new User({
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      profile: {
        name: "管理员",
        phone: "",
        email: "admin@example.com",
        address: "",
      },
    });

    await adminUser.save();
    console.log("管理员用户创建成功");

    // 验证密码
    const isPasswordValid = await adminUser.comparePassword("admin123");
    console.log("密码验证测试:", isPasswordValid);

    process.exit(0);
  } catch (error) {
    console.error("创建管理员失败:", error);
    process.exit(1);
  }
};

createAdmin();
