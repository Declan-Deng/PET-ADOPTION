const Pet = require("../models/pet.model");
const User = require("../models/user.model");
const Adoption = require("../models/adoption.model");

// 创建新的宠物发布
const createPet = async (req, res) => {
  try {
    const petData = {
      ...req.body,
      owner: req.user._id,
    };

    const pet = new Pet(petData);
    await pet.save();

    // 更新用户的发布列表
    await User.findByIdAndUpdate(req.user._id, {
      $push: { publications: pet._id },
    });

    res.status(201).json({
      message: "宠物信息发布成功",
      data: pet,
    });
  } catch (error) {
    console.error("创建宠物失败:", error);
    res.status(500).json({
      message: error.message || "创建宠物失败",
    });
  }
};

// 获取所有宠物列表
const getPets = async (req, res) => {
  try {
    console.log("开始获取宠物列表");
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

    console.log("成功获取宠物列表，数量:", pets.length);
    res.json(pets);
  } catch (error) {
    console.error("获取宠物列表失败:", error);
    res.status(500).json({
      message: error.message || "获取宠物列表失败",
    });
  }
};

// 获取所有宠物
const getAllPets = async (req, res) => {
  try {
    console.log("开始获取所有宠物列表...");

    // 添加查询条件，只获取可领养的宠物
    const query = { status: { $ne: "cancelled" } };

    // 使用 lean() 提高查询性能
    const pets = await Pet.find(query)
      .lean()
      .populate({
        path: "owner",
        select: "username profile",
        populate: {
          path: "profile",
          select: "name phone address avatar",
        },
      })
      .sort({ createdAt: -1 });

    console.log("成功获取宠物列表，数量:", pets.length);

    // 确保返回的是数组
    if (!Array.isArray(pets)) {
      throw new Error("数据格式错误");
    }

    // 包装响应数据
    res.json({
      success: true,
      message: "获取宠物列表成功",
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

const cancelPublication = async (req, res) => {
  try {
    console.log("开始处理取消发布请求...");
    const petId = req.params.id;
    const userId = req.user._id;

    // 查找宠物信息
    const pet = await Pet.findById(petId);
    if (!pet) {
      console.log("未找到宠物信息:", petId);
      return res.status(404).json({ message: "未找到该宠物信息" });
    }

    // 验证是否为发布者
    if (pet.owner.toString() !== userId.toString()) {
      console.log("权限验证失败:", {
        petOwner: pet.owner.toString(),
        requestUser: userId.toString(),
      });
      return res.status(403).json({ message: "只有发布者可以取消发布" });
    }

    // 检查是否有进行中的领养申请
    const activeAdoptions = await Adoption.find({
      pet: petId,
      status: "active",
    });

    if (activeAdoptions.length > 0) {
      console.log("存在进行中的领养申请:", activeAdoptions.length);
      return res.status(400).json({
        message: "该宠物有正在进行的领养申请,无法取消发布",
      });
    }

    // 删除相关的领养申请
    await Adoption.deleteMany({ pet: petId });
    console.log("已删除相关的领养申请");

    // 删除宠物信息
    await Pet.findByIdAndDelete(petId);
    console.log("已删除宠物信息");

    // 从用户的发布列表中移除
    await User.findByIdAndUpdate(userId, {
      $pull: { publications: petId },
    });
    console.log("已从用户发布列表中移除");

    res.json({
      message: "已成功取消发布",
      data: { petId },
    });
  } catch (error) {
    console.error("取消发布失败:", error);
    res.status(500).json({
      message: error.message || "取消发布失败",
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
  cancelPublication,
};
