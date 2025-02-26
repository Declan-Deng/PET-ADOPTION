const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    console.log("收到的Authorization头:", token);

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "请先登录" });
    }

    token = token.replace("Bearer ", "");
    console.log("处理后的token:", token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("解码后的token:", decoded);

      // 使用_id而不是id
      const user = await User.findById(decoded.id || decoded._id).select(
        "-password"
      );
      console.log("查找到的用户:", user ? user._id : "未找到用户");

      if (!user) {
        return res.status(401).json({ message: "用户不存在" });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.error("Token验证失败:", error);
      return res.status(401).json({ message: "登录已过期，请重新登录" });
    }
  } catch (error) {
    console.error("认证中间件错误:", error);
    res.status(401).json({ message: "认证失败" });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "没有管理员权限" });
    }
    next();
  } catch (error) {
    console.error("管理员权限验证失败:", error);
    res.status(403).json({ message: "没有管理员权限" });
  }
};

module.exports = {
  protect: protect,
  adminAuth,
};
