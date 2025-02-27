const User = require("../models/user.model");
const Adoption = require("../models/adoption.model");
const Pet = require("../models/pet.model");

// 获取所有用户
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    // 获取每个用户的领养申请数量和发布数量
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        // 统计领养申请数量（不包括已取消的）
        const adoptionCount = await Adoption.countDocuments({
          applicant: user._id,
          status: { $ne: "cancelled" },
        });

        // 统计发布宠物数量（所有状态）
        const publicationCount = await Pet.countDocuments({
          owner: user._id,
        });

        // 转换为普通对象并添加统计数量
        const userObj = user.toObject();
        return {
          ...userObj,
          adoptionCount,
          publicationCount,
        };
      })
    );

    res.json(usersWithCounts);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({
      message: error.message || "获取用户列表失败",
    });
  }
};

// 获取单个用户
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 获取用户的领养申请（不包括已取消的）和发布
    const adoptions = await Adoption.find({
      applicant: user._id,
      status: { $ne: "cancelled" },
    })
      .populate("pet", "petName type")
      .sort({ createdAt: -1 });

    // 获取用户发布的宠物信息，包含更多详细信息
    const publications = await Pet.find({ owner: user._id })
      .select(
        "petName type status createdAt images breed age gender medical description requirements"
      )
      .sort({ createdAt: -1 });

    const userObj = user.toObject();
    res.json({
      ...userObj,
      adoptions,
      publications,
      adoptionCount: adoptions.length,
      publicationCount: publications.length,
    });
  } catch (error) {
    console.error("获取用户详情失败:", error);
    res.status(500).json({
      message: error.message || "获取用户详情失败",
    });
  }
};

// 更新用户状态
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    res.json(user);
  } catch (error) {
    console.error("更新用户状态失败:", error);
    res.status(500).json({
      message: error.message || "更新用户状态失败",
    });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUserStatus,
};
