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
    // 修复申请人数计数
    const pet = await Pet.findById(req.params.petId);
    if (pet) {
      // 获取实际的活跃申请数量
      const activeAdoptionsCount = await Adoption.countDocuments({
        pet: req.params.petId,
        status: "active",
      });

      // 如果计数不匹配，更新为正确的数量
      if (pet.applicants !== activeAdoptionsCount) {
        await Pet.findByIdAndUpdate(req.params.petId, {
          applicants: activeAdoptionsCount,
        });
      }
    }

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

// 删除领养申请（管理员专用）
const deleteAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: "领养申请不存在" });
    }

    // 如果申请状态是active，需要减少宠物的申请人数
    if (adoption.status === "active") {
      await Pet.findByIdAndUpdate(adoption.pet, {
        $inc: { applicants: -1 },
      });
    }

    await Adoption.findByIdAndDelete(req.params.id);
    res.json({ message: "领养申请已删除" });
  } catch (error) {
    console.error("删除领养申请失败:", error);
    res.status(500).json({
      message: error.message || "删除领养申请失败",
    });
  }
};

// 取消领养申请（用户专用）
const cancelAdoption = async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: "领养申请不存在" });
    }

    // 检查是否是申请人本人
    if (adoption.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "无权取消他人的申请" });
    }

    // 如果申请状态是active，需要减少宠物的申请人数
    if (adoption.status === "active") {
      await Pet.findByIdAndUpdate(adoption.pet, {
        $inc: { applicants: -1 },
      });
    }

    adoption.status = "cancelled";
    await adoption.save();

    res.json({ message: "领养申请已取消" });
  } catch (error) {
    console.error("取消领养申请失败:", error);
    res.status(500).json({
      message: error.message || "取消领养申请失败",
    });
  }
};

// 通过领养申请
const approveAdoption = async (req, res) => {
  try {
    console.log("开始处理通过申请请求...");
    const adoptionId = req.params.id;

    // 查找申请记录
    const adoption = await Adoption.findById(adoptionId)
      .populate("pet")
      .populate("applicant");

    if (!adoption) {
      return res.status(404).json({ message: "申请不存在" });
    }

    // 检查权限（只有宠物主人可以通过申请）
    if (req.user._id.toString() !== adoption.pet.owner.toString()) {
      return res.status(403).json({ message: "没有权限通过此申请" });
    }

    // 检查状态
    if (adoption.status !== "active") {
      return res.status(400).json({ message: "该申请已不能被通过" });
    }

    // 更新申请状态为已通过
    adoption.status = "approved";
    await adoption.save();

    // 将其他活跃的申请状态更新为已取消
    await Adoption.updateMany(
      {
        pet: adoption.pet._id,
        _id: { $ne: adoptionId },
        status: "active",
      },
      { status: "cancelled" }
    );

    // 更新宠物状态为已被领养
    await Pet.findByIdAndUpdate(adoption.pet._id, { status: "adopted" });

    res.json({
      message: "申请已通过",
      data: adoption,
    });
  } catch (error) {
    console.error("通过申请失败:", error);
    res.status(500).json({
      message: error.message || "通过申请失败",
    });
  }
};

// 拒绝领养申请
const rejectAdoption = async (req, res) => {
  try {
    console.log("开始处理拒绝申请请求...");
    const adoptionId = req.params.id;

    // 查找申请记录
    const adoption = await Adoption.findById(adoptionId)
      .populate("pet")
      .populate("applicant");

    if (!adoption) {
      return res.status(404).json({ message: "申请不存在" });
    }

    // 检查权限（只有宠物主人可以拒绝申请）
    if (req.user._id.toString() !== adoption.pet.owner.toString()) {
      return res.status(403).json({ message: "没有权限拒绝此申请" });
    }

    // 检查状态
    if (adoption.status !== "active") {
      return res.status(400).json({ message: "该申请已不能被拒绝" });
    }

    // 更新申请状态为已拒绝
    adoption.status = "rejected";
    await adoption.save();

    // 减少宠物的申请人数
    await Pet.findByIdAndUpdate(adoption.pet._id, {
      $inc: { applicants: -1 },
    });

    res.json({
      message: "申请已拒绝",
      data: adoption,
    });
  } catch (error) {
    console.error("拒绝申请失败:", error);
    res.status(500).json({
      message: error.message || "拒绝申请失败",
    });
  }
};

// 获取所有领养申请（管理员）
const getAllAdoptions = async (req, res) => {
  try {
    console.log("收到查询参数:", req.query);
    const {
      "pet.petName": petName,
      "pet.type": petType,
      "applicant.profile.name": applicantName,
      startTime,
      endTime,
      status,
    } = req.query;

    // 构建聚合管道
    const pipeline = [
      // 关联宠物信息
      {
        $lookup: {
          from: "pets",
          localField: "pet",
          foreignField: "_id",
          as: "petInfo",
        },
      },
      {
        $unwind: "$petInfo",
      },
      // 关联申请人信息
      {
        $lookup: {
          from: "users",
          localField: "applicant",
          foreignField: "_id",
          as: "applicantInfo",
        },
      },
      {
        $unwind: "$applicantInfo",
      },
      // 重构文档结构
      {
        $project: {
          _id: 1,
          status: 1,
          reason: 1,
          experience: 1,
          livingCondition: 1,
          createdAt: 1,
          pet: {
            _id: "$petInfo._id",
            petName: "$petInfo.petName",
            type: "$petInfo.type",
          },
          applicant: {
            _id: "$applicantInfo._id",
            username: "$applicantInfo.username",
            profile: "$applicantInfo.profile",
          },
        },
      },
    ];

    // 按宠物名称筛选
    if (petName) {
      pipeline.push({
        $match: {
          "pet.petName": new RegExp(petName, "i"),
        },
      });
    }

    // 按宠物类型筛选
    if (petType) {
      pipeline.push({
        $match: {
          "pet.type": petType,
        },
      });
    }

    // 按申请人姓名筛选
    if (applicantName) {
      pipeline.push({
        $match: {
          "applicant.profile.name": new RegExp(applicantName, "i"),
        },
      });
    }

    // 按申请时间筛选
    if (startTime && endTime) {
      pipeline.push({
        $match: {
          createdAt: {
            $gte: new Date(startTime),
            $lte: new Date(endTime),
          },
        },
      });
    }

    // 按状态筛选
    if (status) {
      pipeline.push({
        $match: {
          status: status,
        },
      });
    }

    // 按创建时间排序
    pipeline.push({
      $sort: { createdAt: -1 },
    });

    console.log("执行聚合查询，pipeline:", JSON.stringify(pipeline, null, 2));
    const adoptions = await Adoption.aggregate(pipeline);
    console.log("查询结果数量:", adoptions.length);

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

module.exports = {
  createAdoption,
  getUserAdoptions,
  getPetAdoptions,
  getAdoptionById,
  deleteAdoption,
  cancelAdoption,
  approveAdoption,
  rejectAdoption,
  getAllAdoptions,
};
