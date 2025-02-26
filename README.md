# 宠物领养系统

一个完整的宠物领养平台解决方案，包含移动端用户应用（React Native）、Web 端管理系统（Ant Design Pro）和 Node.js 后端服务。

## 项目架构

```
pet-adoption/
├── frontend/                # React Native 移动端应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── screens/        # 页面组件
│   │   ├── navigation/     # 导航配置
│   │   ├── context/       # 全局状态管理
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── constants/     # 常量定义
│   │   └── config.js      # 环境配置
│   └── package.json
│
├── admin-frontend/         # Ant Design Pro 管理后台
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── models/        # 数据模型
│   │   ├── utils/         # 工具函数
│   │   └── access.ts      # 权限控制
│   └── package.json
│
├── backend/               # Node.js 后端服务
│   ├── src/
│   │   ├── controllers/  # 业务控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # API 路由
│   │   ├── middleware/   # 中间件
│   │   ├── services/     # 业务服务
│   │   └── utils/        # 工具函数
│   ├── scripts/          # 管理脚本
│   └── uploads/          # 文件上传目录
```

## 主要功能

### 移动端用户应用

- 用户认证（注册、登录、个人信息管理）
- 宠物浏览和搜索
- 领养申请和进度追踪
- 个人宠物发布
- 收藏和关注功能
- 消息通知

### Web 端管理系统

- 管理员认证和权限控制
- 用户管理
- 宠物信息管理
- 领养申请审核
- 数据统计和分析

### 后端功能

- RESTful API
- JWT 认证
- 文件上传
- 数据验证
- 错误处理
- 日志记录

## 技术栈

### 移动端

- React Native
- React Navigation
- Axios
- AsyncStorage
- React Context

### 管理后台

- React
- Ant Design Pro
- UmiJS
- DVA

### 后端

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Multer

## 环境要求

- Node.js >= 14
- MongoDB >= 4.4
- React Native >= 0.63
- Expo SDK >= 44

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/pet-adoption.git
cd pet-adoption
```

### 2. 环境配置

#### 后端配置 (backend/.env)

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/pet-adoption
JWT_SECRET=your-secret-key
HOST=your-ip-address
SERVER_URL=http://your-ip-address:5001
UPLOAD_URL=http://your-ip-address:5001/uploads
```

#### 移动端配置 (frontend/src/config.js)

```javascript
export const API_BASE_URL = "http://your-ip-address:5001";
```

#### 管理后台配置 (admin-frontend/.umirc.ts)

```typescript
export default {
  proxy: {
    "/api": {
      target: "http://your-ip-address:5001",
      changeOrigin: true,
    },
  },
};
```

### 3. 安装依赖

后端：

```bash
cd backend
npm install
```

移动端：

```bash
cd frontend
npm install
```

管理后台：

```bash
cd admin-frontend
npm install
```

### 4. 创建管理员账户

```bash
cd backend
node scripts/createAdmin.js
```

### 5. 启动服务

后端：

```bash
cd backend
npm run dev
```

移动端：

```bash
cd frontend
npm start
```

管理后台：

```bash
cd admin-frontend
npm start
```

## 部署说明

### 后端部署

1. 配置生产环境变量
2. 构建生产版本：`npm run build`
3. 使用 PM2 启动：`pm2 start dist/server.js`

### 移动端部署

1. 配置生产环境 API 地址
2. 使用 Expo 构建：`expo build:android` 或 `expo build:ios`

### 管理后台部署

1. 配置生产环境 API 地址
2. 构建生产版本：`npm run build`
3. 部署 dist 目录到 Web 服务器

## 开发指南

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 Airbnb JavaScript 风格指南
- 使用 Prettier 进行代码格式化

### Git 工作流

1. 从 main 分支创建特性分支
2. 提交代码时使用规范的 commit 消息
3. 提交 Pull Request 前先同步主分支
4. 通过 CI 检查后合并到主分支

### 提交消息规范

- feat: 新功能
- fix: 修复问题
- docs: 文档变更
- style: 代码格式
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 常见问题

### 1. 图片上传失败

- 检查 uploads 目录权限
- 确认 UPLOAD_URL 配置正确
- 验证文件大小是否超过限制

### 2. 管理后台登录失败

- 确认管理员账户已创建
- 检查 API 地址配置
- 验证网络连接状态

### 3. 移动端无法连接后端

- 确认 IP 地址配置正确
- 检查设备与服务器的网络连接
- 验证后端服务是否正常运行

## 维护者

- [@your-name](https://github.com/your-username)

## 许可证

[MIT](LICENSE)
