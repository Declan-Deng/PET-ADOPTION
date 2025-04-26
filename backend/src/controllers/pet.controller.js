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

    // 修复每个宠物的申请人数
    for (const pet of pets) {
      const activeAdoptionsCount = await Adoption.countDocuments({
        pet: pet._id,
        status: "active",
      });

      if (pet.applicants !== activeAdoptionsCount) {
        await Pet.findByIdAndUpdate(pet._id, {
          applicants: activeAdoptionsCount,
        });
        pet.applicants = activeAdoptionsCount;
      }
    }

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
    console.log("开始获取所有宠物列表...", req.query);

    // 构建查询条件
    const query = {};

    // 安全地处理查询参数
    const safeQuery = req.query || {};

    // 处理基本筛选条件
    if (
      safeQuery.type &&
      safeQuery.type !== "undefined" &&
      safeQuery.type !== "null"
    ) {
      query.type = safeQuery.type;
    }

    if (
      safeQuery.breed &&
      safeQuery.breed !== "undefined" &&
      safeQuery.breed !== "null"
    ) {
      query.breed = new RegExp(safeQuery.breed, "i"); // 不区分大小写
    }

    // 添加年龄筛选
    if (
      safeQuery.age &&
      safeQuery.age !== "undefined" &&
      safeQuery.age !== "null"
    ) {
      // 尝试将年龄转换为数字
      const ageNumber = parseFloat(safeQuery.age);
      if (!isNaN(ageNumber)) {
        // 如果是纯数字，进行精确匹配
        query.age = ageNumber;
      } else {
        // 如果是"2岁"这样的格式，尝试提取数字部分
        const ageMatch = safeQuery.age.match(/(\d+)/);
        if (ageMatch && ageMatch[1]) {
          query.age = parseInt(ageMatch[1], 10);
        } else {
          // 如果无法提取数字，则跳过年龄筛选
          console.log("无法从年龄查询中提取有效数字:", safeQuery.age);
        }
      }
    }

    if (
      safeQuery.gender &&
      safeQuery.gender !== "undefined" &&
      safeQuery.gender !== "null"
    ) {
      query.gender = safeQuery.gender;
    }

    // 处理健康状况筛选
    if (
      safeQuery["medical.healthStatus"] &&
      safeQuery["medical.healthStatus"] !== "undefined" &&
      safeQuery["medical.healthStatus"] !== "null"
    ) {
      query["medical.healthStatus"] = safeQuery["medical.healthStatus"];
    }

    // 处理疫苗接种状态
    if (
      safeQuery["medical.vaccinated"] !== undefined &&
      safeQuery["medical.vaccinated"] !== "undefined" &&
      safeQuery["medical.vaccinated"] !== "null"
    ) {
      // 将字符串转换为布尔值
      const isVaccinated =
        safeQuery["medical.vaccinated"] === "true" ||
        safeQuery["medical.vaccinated"] === true;
      query["medical.vaccinated"] = isVaccinated;
    }

    // 处理绝育状态
    if (
      safeQuery["medical.sterilized"] !== undefined &&
      safeQuery["medical.sterilized"] !== "undefined" &&
      safeQuery["medical.sterilized"] !== "null"
    ) {
      // 将字符串转换为布尔值
      const isSterilized =
        safeQuery["medical.sterilized"] === "true" ||
        safeQuery["medical.sterilized"] === true;
      query["medical.sterilized"] = isSterilized;
    }

    // 处理状态筛选
    if (
      safeQuery.status &&
      safeQuery.status !== "undefined" &&
      safeQuery.status !== "null"
    ) {
      query.status = safeQuery.status;
    }

    // 调试查询条件
    console.log("筛选条件:", query);

    const pets = await Pet.find(query)
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
    // 直接返回数组，不包装在data字段中
    res.json(pets);
  } catch (error) {
    console.error("获取宠物列表失败:", error);
    res.status(500).json({ message: "获取宠物列表失败", error: error.message });
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

// 删除宠物发布（管理员专用）
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "未找到该宠物",
      });
    }

    // 删除相关的领养申请
    await Adoption.deleteMany({ pet: pet._id });

    // 删除宠物信息
    await Pet.findByIdAndDelete(req.params.id);

    // 从发布者的发布列表中移除
    await User.findByIdAndUpdate(pet.owner, {
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
    const activeAdoptionsCount = await Adoption.countDocuments({
      pet: petId,
      status: "active",
    });

    if (activeAdoptionsCount > 0) {
      console.log("存在进行中的领养申请:", activeAdoptionsCount);
      return res.status(400).json({
        message: "该宠物有正在进行的领养申请,无法取消发布",
      });
    }

    // 删除所有相关的领养申请（包括已取消和已通过的）
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
