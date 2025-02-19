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

    // 创建测试宠物数据
    const pets = [
      {
        petName: "奥利奥",
        type: "cat",
        breed: "英短",
        age: 2,
        gender: "male",
        description:
          "这是一只可爱的黑白相间的英短猫，性格温顺，特别喜欢和人玩耍。",
        requirements:
          "希望找一个有爱心、有耐心的主人，能够给予充分的关爱和照顾。",
        images: [
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
          "https://images.unsplash.com/photo-1573865526739-10659fec78a5",
        ],
        medical: {
          vaccinated: true,
          sterilized: true,
          healthStatus: "健康",
        },
        status: "available",
        owner: testUser._id,
      },
      {
        petName: "小白",
        type: "dog",
        breed: "萨摩耶",
        age: 1,
        gender: "female",
        description: "活泼可爱的萨摩耶，非常喜欢和人互动，是个完美的家庭伴侣。",
        requirements: "需要有充足的活动空间，每天定时遛狗。",
        images: [
          "https://images.unsplash.com/photo-1508532566027-b2032cd8a715",
          "https://images.unsplash.com/photo-1587764379873-97837921fd44",
        ],
        medical: {
          vaccinated: true,
          sterilized: false,
          healthStatus: "健康",
        },
        status: "available",
        owner: testUser._id,
      },
      {
        petName: "兔兔",
        type: "other",
        breed: "荷兰垂耳兔",
        age: 1,
        gender: "female",
        description: "温顺的小兔子，适合家庭饲养，不需要太大的活动空间。",
        requirements: "需要定期补充干草，保持环境清洁。",
        images: [
          "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308",
          "https://images.unsplash.com/photo-1452857297128-d9c29adba80b",
        ],
        medical: {
          vaccinated: true,
          sterilized: false,
          healthStatus: "健康",
        },
        status: "available",
        owner: testUser._id,
      },
    ];

    // 批量创建宠物数据
    const createdPets = await Pet.create(pets);
    console.log(`成功创建 ${createdPets.length} 个宠物数据`);

    // 更新用户的发布列表
    await User.findByIdAndUpdate(testUser._id, {
      $push: { publications: { $each: createdPets.map((pet) => pet._id) } },
    });

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
