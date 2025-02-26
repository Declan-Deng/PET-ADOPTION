const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// 生成JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// 注册
const register = async (req, res) => {
  try {
    const { username, email, password, phone, avatar } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "用户名或邮箱已被注册" });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      phone,
      profile: {
        name: username,
        phone: phone || "",
        email: email || "",
        avatar: avatar || null,
      },
    });

    // 生成token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile: {
          name: user.profile.name,
          phone: user.profile.phone,
          email: user.profile.email,
          avatar: user.profile.avatar,
          address: user.profile.address,
        },
        favorites: user.favorites || [],
        notifications: user.notifications || [],
        publications: user.publications || [],
        adoptions: user.adoptions || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// 登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("登录请求:", { username, password });

    // 查找用户
    const user = await User.findOne({
      $or: [{ email: username }, { username }],
    }).select("+password");
    console.log("查找到的用户:", {
      _id: user?._id,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      password: user?.password,
    });

    if (!user) {
      console.log("用户不存在");
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log("密码验证结果:", isPasswordValid);
    console.log("密码比较:", {
      input: password,
      hashed: user.password,
    });

    if (!isPasswordValid) {
      console.log("密码错误");
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 生成token
    const token = generateToken(user._id);

    // 确保返回完整的用户数据
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profile: {
        name: user.profile?.name || user.username,
        phone: user.profile?.phone || user.phone || "",
        email: user.profile?.email || user.email || "",
        address: user.profile?.address || "",
        avatar: user.profile?.avatar || null,
      },
      favorites: user.favorites || [],
      notifications: user.notifications || [],
      publications: user.publications || [],
      adoptions: user.adoptions || [],
    };

    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};

// 更新用户信息
const updateProfile = async (req, res) => {
  try {
    console.log("收到更新个人资料请求:", req.body);
    console.log("当前用户ID:", req.user._id);

    const { name, email, phone, address, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      console.error("用户不存在:", req.user._id);
      return res.status(404).json({ message: "用户不存在" });
    }

    console.log("当前用户资料:", user.profile);

    // 更新profile信息，只更新非空值
    const updatedProfile = {
      ...user.profile,
      name: name !== undefined ? name : user.profile.name,
      email: email !== undefined ? email : user.profile.email,
      phone: phone !== undefined ? phone : user.profile.phone,
      address: address !== undefined ? address : user.profile.address,
      avatar: avatar !== undefined ? avatar : user.profile.avatar,
    };

    console.log("更新后的资料:", updatedProfile);

    user.profile = updatedProfile;
    await user.save();

    console.log("用户资料已保存");

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profile: user.profile,
      favorites: user.favorites || [],
      notifications: user.notifications || [],
      publications: user.publications || [],
      adoptions: user.adoptions || [],
    };

    console.log("返回更新后的用户数据:", userData);
    res.json({ user: userData });
  } catch (error) {
    console.error("更新个人资料失败:", error);
    res.status(500).json({
      message: "更新个人资料失败",
      error: error.message,
      details: error.stack,
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
};
