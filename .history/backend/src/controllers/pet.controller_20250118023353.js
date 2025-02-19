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

// 获取单个宠物详情
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate(
      "owner",
      "username profile.name profile.avatar profile.phone"
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "未找到该宠物",
      });
    }

    res.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error("获取宠物详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取宠物详情失败",
      error: error.message,
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
};
