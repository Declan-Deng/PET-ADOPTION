const Pet = require("../models/pet.model");
const User = require("../models/user.model");

// 创建新宠物
const createPet = async (req, res) => {
  try {
    const petData = {
      ...req.body,
      owner: req.user._id,
      images: req.files ? req.files.map((file) => file.path) : [],
    };

    const pet = await Pet.create(petData);
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: "创建失败", error: error.message });
  }
};

// 获取宠物列表
const getPets = async (req, res) => {
  try {
    const {
      type,
      breed,
      gender,
      size,
      status,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const query = {};
    if (type) query.type = type;
    if (breed) query.breed = breed;
    if (gender) query.gender = gender;
    if (size) query.size = size;
    if (status) query.status = status;

    const [pets, total] = await Promise.all([
      Pet.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("owner", "username avatar"),
      Pet.countDocuments(query),
    ]);

    res.json({
      pets,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "获取失败", error: error.message });
  }
};

// 获取单个宠物详情
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate(
      "owner",
      "username avatar"
    );

    if (!pet) {
      return res.status(404).json({ message: "宠物不存在" });
    }

    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: "获取失败", error: error.message });
  }
};

// 更新宠物信息
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "宠物不存在" });
    }

    // 检查权限
    if (
      pet.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "没有权限" });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: "更新失败", error: error.message });
  }
};

// 删除宠物
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "宠物不存在" });
    }

    // 检查权限
    if (
      pet.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "没有权限" });
    }

    await pet.remove();
    res.json({ message: "删除成功" });
  } catch (error) {
    res.status(500).json({ message: "删除失败", error: error.message });
  }
};

// 搜索附近的宠物
const getNearbyPets = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    const pets = await Pet.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      status: "available",
    }).populate("owner", "username avatar");

    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "搜索失败", error: error.message });
  }
};

// 添加宠物到收藏
const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const petId = req.params.id;

    if (!user.favorites.includes(petId)) {
      user.favorites.push(petId);
      await user.save();
    }

    res.json({ message: "添加收藏成功" });
  } catch (error) {
    res.status(500).json({ message: "添加收藏失败", error: error.message });
  }
};

// 从收藏中移除宠物
const removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const petId = req.params.id;

    user.favorites = user.favorites.filter((id) => id.toString() !== petId);
    await user.save();

    res.json({ message: "移除收藏成功" });
  } catch (error) {
    res.status(500).json({ message: "移除收藏失败", error: error.message });
  }
};

module.exports = {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  getNearbyPets,
  addToFavorites,
  removeFromFavorites,
};
