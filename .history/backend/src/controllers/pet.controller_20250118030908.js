const Pet = require("../models/pet.model");
const User = require("../models/user.model");

// 创建新的宠物发布
const createPet = async (req, res) => {
  try {
    const petData = {
      ...req.body,
      owner: req.user._id,
    };

    const pet = await Pet.create(petData);

    // 更新用户的发布列表
    await User.findByIdAndUpdate(req.user._id, {
      $push: { publications: pet._id },
    });

    res.status(201).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error("创建宠物发布失败:", error);
    res.status(500).json({
      success: false,
      message: "创建宠物发布失败",
      error: error.message,
    });
  }
};

// 获取所有宠物列表
const getPets = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    const pets = await Pet.find(filter)
      .populate("owner", "username profile.name profile.avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pets,
    });
  } catch (error) {
    console.error("获取宠物列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取宠物列表失败",
      error: error.message,
    });
  }
};

// 获取所有宠物
const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find()
      .populate({
        path: "owner",
        select: "username profile",
        populate: {
          path: "profile",
          select: "name phone address avatar",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      message: "获取宠物列表成功",
      data: pets,
    });
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// 获取单个宠物详情
const getPetById = async (req, res) => {
  try {
    console.log("正在获取宠物详情，ID:", req.params.id);

    if (!req.params.id) {
      console.error("宠物ID未提供");
      return res.status(400).json({ message: "宠物ID未提供" });
    }

    const pet = await Pet.findById(req.params.id).populate({
      path: "owner",
      select: "username profile",
      populate: {
        path: "profile",
        select: "name phone address avatar",
      },
    });

    if (!pet) {
      console.error("未找到宠物，ID:", req.params.id);
      return res.status(404).json({ message: "未找到该宠物" });
    }

    console.log("成功获取宠物详情:", pet);
    res.json({
      message: "获取宠物详情成功",
      data: pet,
    });
  } catch (error) {
    console.error("获取宠物详情失败:", error);
    // 检查是否是无效的ID格式
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ message: "无效的宠物ID格式" });
    }
    res.status(500).json({
      message: "获取宠物详情失败",
      error: error.message,
      details: error.stack,
    });
  }
};

// 更新宠物信息
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "未找到该宠物",
      });
    }

    // 检查是否是宠物的发布者
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "无权修改此宠物信息",
      });
    }

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: updatedPet,
    });
  } catch (error) {
    console.error("更新宠物信息失败:", error);
    res.status(500).json({
      success: false,
      message: "更新宠物信息失败",
      error: error.message,
    });
  }
};

// 删除宠物发布
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "未找到该宠物",
      });
    }

    // 检查是否是宠物的发布者
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "无权删除此宠物信息",
      });
    }

    await Pet.findByIdAndDelete(req.params.id);

    // 从用户的发布列表中移除
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { publications: pet._id },
    });

    res.json({
      success: true,
      message: "宠物发布已删除",
    });
  } catch (error) {
    console.error("删除宠物发布失败:", error);
    res.status(500).json({
      success: false,
      message: "删除宠物发布失败",
      error: error.message,
    });
  }
};

module.exports = {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  getAllPets,
};
