# 宠物领养系统

一个完整的宠物领养平台解决方案，包含移动端用户应用（React Native）、Web 端管理系统（Ant Design Pro）和 Node.js 后端服务。

## 项目架构

项目采用三端分离的微服务架构设计：

```
pet-adoption/
├── frontend/                # React Native 移动端应用
│   ├── src/
│   │   ├── screens/       # 页面组件
│   │   ├── components/    # 可复用组件
│   │   ├── navigation/    # 路由导航配置
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── context/      # 全局状态管理
│   │   ├── constants/    # 常量定义
│   │   ├── assets/       # 静态资源
│   │   └── config.js     # 环境配置
│   ├── assets/           # 应用级静态资源
│   ├── App.js            # 应用入口
│   └── app.json         # Expo 配置文件
│
├── admin-frontend/        # 基于 UmiJS 的管理后台
│   ├── src/
│   │   ├── pages/       # 页面组件
│   │   ├── services/    # API 服务
│   │   ├── models/      # 数据模型
│   │   ├── utils/       # 工具函数
│   │   ├── constants/   # 常量定义
│   │   ├── assets/      # 静态资源
│   │   ├── access.ts    # 权限控制
│   │   └── app.ts      # 应用配置
│   ├── config/          # 项目配置
│   ├── public/          # 静态资源
│   └── .umirc.ts       # UmiJS 配置
│
└── backend/              # Node.js 后端服务
    ├── src/
    │   ├── controllers/ # 业务控制器
    │   ├── routes/      # API 路由
    │   ├── models/      # 数据模型
    │   ├── services/    # 业务服务
    │   ├── middleware/  # 中间件
    │   ├── utils/       # 工具函数
    │   ├── config/      # 配置文件
    │   ├── seed/        # 数据库种子
    │   └── app.js      # 应用入口
    ├── scripts/         # 管理脚本
    └── uploads/         # 文件上传目录
```

### 移动端架构说明

- `screens/`: 包含所有页面级组件
- `components/`: 可复用的 UI 组件
- `navigation/`: 应用路由和导航配置
- `hooks/`: 自定义 React Hooks
- `context/`: React Context 全局状态管理
- `constants/`: 常量和枚举定义
- `config.js`: 环境变量和配置

### 管理后台架构说明

- `pages/`: 基于 UmiJS 的页面组件
- `services/`: API 接口封装
- `models/`: DVA 数据模型
- `utils/`: 工具函数集合
- `constants/`: 常量定义
- `access.ts`: RBAC 权限控制
- `app.ts`: 全局运行时配置

### 后端架构说明

- `controllers/`: REST API 控制器
- `routes/`: 路由定义和中间件配置
- `models/`: Mongoose 数据模型
- `services/`: 业务逻辑服务
- `middleware/`: 自定义中间件
- `utils/`: 工具函数
- `config/`: 环境配置
- `seed/`: 数据库初始化脚本

## 技术架构

### 移动端 (frontend)

- 基于 React Native 和 Expo 平台
- 使用 React Navigation 进行路由管理
- 支持 iOS 和 Android 双平台

### 管理后台 (admin-frontend)

- 基于 UmiJS 和 Ant Design Pro 框架
- TypeScript 开发
- 现代化的开发工具链（ESLint, Prettier, Husky）

### 后端服务 (backend)

- Node.js 运行环境
- Express 框架
- MongoDB 数据库
- JWT 认证机制
- 文件上传功能

## 环境要求

- Node.js >= 14
- MongoDB >= 4.4
- React Native/Expo 开发环境
- UmiJS 开发环境

## 部署说明

### 后端部署

1. 配置环境变量（.env 文件）
2. 安装依赖：`npm install`
3. 启动服务：`npm start`

### 移动端部署

1. 使用 Expo 构建应用
2. 按照平台要求发布到应用商店

### 管理后台部署

1. 构建生产版本：`npm run build`
2. 部署 dist 目录到 Web 服务器

## 安全说明

- 所有 API 请求都需要进行 JWT 认证
- 文件上传有大小限制和类型验证
- 管理后台实现了基于角色的访问控制（RBAC）
- 敏感信息（如密码）进行加密存储

## 主要功能

### 移动端用户应用

- 用户认证（注册、登录、个人信息管理）
- 宠物浏览和搜索
- 领养申请和进度追踪
- 个人宠物发布
- 收藏功能（可开发）

### Web 端管理系统

- 管理员认证
- 用户管理
- 宠物信息管理
- 领养申请审核
- 数据统计和分析（可开发）

### 后端功能

- RESTful API
- JWT 认证
- 文件上传
- 数据验证
- 错误处理

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

### 环境配置

#### 后端配置 (backend/.env)

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/pet-adoption

# 服务器配置
PORT=5001
HOST=192.168.31.232
SERVER_URL=http://your-ip-address:5001

# JWT配置
JWT_SECRET=your-secret-key

# 环境配置
NODE_ENV=development

# 文件上传配置
UPLOAD_PATH=uploads
UPLOAD_URL=http://your-ip-address:5001/uploads
```

#### 移动端配置 (frontend/src/config.js)

```javascript
// API配置
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

### 安装依赖

后端：

```bash
cd backend
npm run dev
```

移动端：

```bash
cd frontend
sudo npm start
```

管理后台：

```bash
cd admin-frontend
sudo npm start
```
