const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token;

    // 检查Authorization头
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 获取当前请求的完整路径
    const fullPath = req.originalUrl || req.url;
    console.log("当前请求路径:", fullPath);

    // 如果是公开路由，直接放行
    if (
      req.method === "GET" &&
      (fullPath === "/api/pets" ||
        fullPath.startsWith("/api/pets/") ||
        fullPath.startsWith("/uploads/"))
    ) {
      console.log("公开路由，允许访问");
      return next();
    }

    console.log("需要认证的路由");

    // 如果需要token但没有提供
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "请先登录",
        code: "NOT_AUTHENTICATED",
      });
    }

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "用户不存在或已被删除",
          code: "USER_NOT_FOUND",
        });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "登录已过期，请重新登录",
          code: "TOKEN_EXPIRED",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("认证中间件错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器错误",
      error: error.message,
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await protect(req, res, () => {
      if (req.user.role !== "admin") {
        throw new Error();
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ message: "没有管理员权限" });
  }
};

module.exports = {
  protect,
  adminAuth,
};
