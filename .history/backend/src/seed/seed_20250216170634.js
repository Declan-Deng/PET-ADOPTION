const mongoose = require("mongoose");
const User = require("../models/user.model");
const Pet = require("../models/pet.model");
require("dotenv").config();

const seedData = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("数据库连接成功");

    // 清空现有数据
    await User.deleteMany({});
    await Pet.deleteMany({});
    console.log("已清空现有数据");

    // 创建测试用户
    const testUser = await User.create({
      username: "test",
      email: "test@example.com",
      password: "123456",
      profile: {
        name: "测试用户",
        phone: "13800138000",
        email: "test@example.com",
        address: "测试地址",
      },
    });
    console.log("测试用户创建成功");

    // 创建奥利奥的数据
    const oreo = await Pet.create({
      petName: "奥利奥",
      type: "cat",
      breed: "英短",
      age: 2,
      gender: "male",
      description:
        "这是一只可爱的黑白相间的英短猫，性格温顺，特别喜欢和人玩耍。",
      requirements:
        "希望找一个有爱心、有耐心的主人，能够给予充分的关爱和照顾。",
      images: ["https://example.com/oreo.jpg"], // 这里需要替换为实际的图片URL
      medical: {
        vaccinated: true,
        sterilized: true,
        healthStatus: "健康",
      },
      status: "已通过",
      owner: testUser._id,
    });

    // 更新用户的发布列表
    await User.findByIdAndUpdate(testUser._id, {
      $push: { publications: oreo._id },
    });

    console.log("奥利奥数据创建成功");
    console.log("种子数据创建完成");

    // 断开数据库连接
    await mongoose.disconnect();
    console.log("数据库连接已断开");
  } catch (error) {
    console.error("种子数据创建失败:", error);
    process.exit(1);
  }
};

// 运行种子数据脚本
seedData();
