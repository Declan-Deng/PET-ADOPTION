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
      status: "pending",
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
      status: "pending",
    });

    // 更新宠物的申请人数
    await Pet.findByIdAndUpdate(petId, {
      $inc: { applicants: 1 },
    });

    // 更新用户的申请列表
    await User.findByIdAndUpdate(applicant, {
      $push: { adoptions: adoption._id },
    });

    // 给宠物主人发送通知
    await User.findByIdAndUpdate(pet.owner, {
      $push: {
        notifications: {
          type: "new_adoption_request",
          title: "新的领养申请",
          message: `有人申请领养您发布的宠物 ${pet.petName}`,
          relatedId: adoption._id,
          createdAt: new Date(),
        },
      },
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

// 审核领养申请
const reviewAdoption = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const adoption = await Adoption.findById(req.params.id).populate("pet");

    if (!adoption) {
      return res.status(404).json({ message: "申请不存在" });
    }

    // 检查权限（只有宠物主人可以审核）
    const pet = await Pet.findById(adoption.pet);
    if (req.user._id.toString() !== pet.owner.toString()) {
      return res.status(403).json({ message: "没有权限审核此申请" });
    }

    // 更新申请状态
    adoption.status = status;
    adoption.reviewNotes = reviewNotes;
    adoption.reviewedBy = req.user._id;
    adoption.reviewedAt = new Date();

    await adoption.save();

    // 给申请人发送通知
    await User.findByIdAndUpdate(adoption.applicant, {
      $push: {
        notifications: {
          type: "adoption_review",
          title: "领养申请状态更新",
          message: `您申请领养的宠物 ${pet.petName} ${
            status === "approved" ? "已通过" : "被拒绝"
          }`,
          relatedId: adoption._id,
          createdAt: new Date(),
        },
      },
    });

    res.json({
      message: "审核成功",
      data: adoption,
    });
  } catch (error) {
    console.error("审核申请失败:", error);
    res.status(500).json({
      message: error.message || "审核申请失败",
    });
  }
};

// 取消领养申请
const cancelAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
      return res.status(404).json({ message: "申请不存在" });
    }

    // 检查权限（只有申请人可以取消）
    if (req.user._id.toString() !== adoption.applicant.toString()) {
      return res.status(403).json({ message: "没有权限取消此申请" });
    }

    // 检查状态（只能取消待处理的申请）
    if (adoption.status !== "pending") {
      return res.status(400).json({ message: "只能取消待处理的申请" });
    }

    // 更新宠物的申请人数
    await Pet.findByIdAndUpdate(adoption.pet, {
      $inc: { applicants: -1 },
    });

    // 从用户的申请列表中移除
    await User.findByIdAndUpdate(adoption.applicant, {
      $pull: { adoptions: adoption._id },
    });

    // 使用 deleteOne 替代 remove
    await Adoption.deleteOne({ _id: adoption._id });

    res.json({ message: "申请已取消" });
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
  reviewAdoption,
  cancelAdoption,
};
