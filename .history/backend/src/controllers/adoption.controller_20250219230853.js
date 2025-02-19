const Adoption = require("../models/adoption.model");
const Pet = require("../models/pet.model");
const User = require("../models/user.model");

// 创建领养申请
const createAdoption = async (req, res) => {
  try {
    const { pet: petId, reason, experience, livingCondition } = req.body;
    const applicant = req.user._id;

    // 验证必填字段
    if (!petId || !reason || !experience || !livingCondition) {
      return res.status(400).json({
        message: "请填写所有必填信息",
      });
    }

    // 检查宠物是否存在
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        message: "未找到该宠物",
      });
    }

    // 检查是否是自己发布的宠物
    if (pet.owner.toString() === applicant.toString()) {
      return res.status(400).json({
        message: "不能申请领养自己发布的宠物",
      });
    }

    // 检查是否已经申请过
    const existingApplication = await Adoption.findOne({
      pet: petId,
      applicant,
      status: "active",
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "您已经申请过这只宠物了",
      });
    }

    // 创建申请
    const adoption = await Adoption.create({
      pet: petId,
      applicant,
      reason,
      experience,
      livingCondition,
      status: "active",
    });

    // 更新宠物的申请人数
    await Pet.findByIdAndUpdate(petId, {
      $inc: { applicants: 1 },
    });

    // 更新用户的申请列表
    await User.findByIdAndUpdate(applicant, {
      $push: { adoptions: adoption._id },
    });

    res.status(201).json({
      message: "申请提交成功",
      data: adoption,
    });
  } catch (error) {
    console.error("创建领养申请失败:", error);
    res.status(500).json({
      message: error.message || "创建领养申请失败",
    });
  }
};

// 获取用户的申请列表
const getUserAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ applicant: req.user._id })
      .populate({
        path: "pet",
        select: "petName images type breed age gender",
        populate: {
          path: "owner",
          select: "username profile",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      message: "获取申请列表成功",
      data: adoptions,
    });
  } catch (error) {
    console.error("获取申请列表失败:", error);
    res.status(500).json({
      message: error.message || "获取申请列表失败",
    });
  }
};

// 获取宠物的申请列表
const getPetAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.find({ pet: req.params.petId })
      .populate("applicant", "username profile")
      .sort({ createdAt: -1 });

    res.json({
      message: "获取申请列表成功",
      data: adoptions,
    });
  } catch (error) {
    console.error("获取申请列表失败:", error);
    res.status(500).json({
      message: error.message || "获取申请列表失败",
    });
  }
};

// 获取单个领养申请详情
const getAdoptionById = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate("pet")
      .populate("applicant", "username profile");

    if (!adoption) {
      return res.status(404).json({ message: "申请不存在" });
    }

    // 检查权限（只有申请人和宠物主人可以查看）
    const pet = await Pet.findById(adoption.pet);
    if (
      req.user._id.toString() !== adoption.applicant.toString() &&
      req.user._id.toString() !== pet.owner.toString()
    ) {
      return res.status(403).json({ message: "没有权限查看此申请" });
    }

    res.json({
      message: "获取申请详情成功",
      data: adoption,
    });
  } catch (error) {
    console.error("获取申请详情失败:", error);
    res.status(500).json({
      message: error.message || "获取申请详情失败",
    });
  }
};

// 取消领养申请
const cancelAdoption = async (req, res) => {
  try {
    console.log("开始取消申请，ID:", req.params.id);
    console.log("当前用户ID:", req.user._id);

    const adoption = await Adoption.findById(req.params.id);
    console.log("找到的申请记录:", JSON.stringify(adoption, null, 2));

    if (!adoption) {
      console.log("未找到申请记录");
      return res.status(404).json({ message: "申请不存在" });
    }

    // 检查权限（只有申请人可以取消）
    if (req.user._id.toString() !== adoption.applicant.toString()) {
      console.log("权限检查失败", {
        userId: req.user._id.toString(),
        applicantId: adoption.applicant.toString(),
      });
      return res.status(403).json({ message: "没有权限取消此申请" });
    }

    // 检查状态（可以取消 active 或 pending 状态的申请）
    console.log("当前申请状态:", adoption.status);
    if (adoption.status === "cancelled") {
      console.log("状态检查失败，申请已经被取消");
      return res.status(400).json({ message: "该申请已经被取消" });
    }

    // 更新宠物的申请人数
    await Pet.findByIdAndUpdate(adoption.pet, {
      $inc: { applicants: -1 },
    });

    // 更新申请状态为已取消
    adoption.status = "cancelled";
    const updatedAdoption = await adoption.save();
    console.log("更新后的申请记录:", JSON.stringify(updatedAdoption, null, 2));

    // 返回完整的更新后数据
    const populatedAdoption = await Adoption.findById(updatedAdoption._id)
      .populate({
        path: "pet",
        select: "petName images type breed age gender",
        populate: {
          path: "owner",
          select: "username profile",
        },
      })
      .populate("applicant", "username profile");

    console.log(
      "返回给客户端的数据:",
      JSON.stringify(populatedAdoption, null, 2)
    );

    res.json({
      message: "申请已取消",
      data: populatedAdoption,
    });
  } catch (error) {
    console.error("取消申请失败:", error);
    res.status(500).json({
      message: error.message || "取消申请失败",
    });
  }
};

module.exports = {
  createAdoption,
  getUserAdoptions,
  getPetAdoptions,
  getAdoptionById,
  cancelAdoption,
};
