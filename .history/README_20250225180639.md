# 宠物领养系统

一个基于 React Native (前端) 和 Node.js (后端) 的宠物领养平台。

## 项目结构

```
pet-adoption/
├── frontend/                # React Native 前端项目
│   ├── src/                # 源代码
│   │   ├── components/     # 可复用组件
│   │   ├── screens/        # 页面组件
│   │   ├── navigation/     # 导航配置
│   │   ├── context/        # Context API
│   │   └── constants/      # 常量定义
│   └── package.json        # 前端依赖
│
├── backend/                 # Node.js 后端项目
│   ├── src/                # 源代码
│   │   ├── controllers/    # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   └── utils/         # 工具函数
│   └── package.json        # 后端依赖
```

## 功能特性

- 用户认证（注册、登录、个人信息管理）
- 宠物管理（发布、搜索、收藏）
- 领养流程（申请、审核、追踪）
- 消息通知系统
- 地理位置服务

## 开始使用

### 前端启动

```bash
cd frontend
npm install
npm start
```

### 后端启动

```bash
cd backend
npm install
npm run dev
```

## 环境要求

- Node.js >= 14
- MongoDB >= 4.4
- React Native >= 0.63

## API 文档

API 文档见 [API.md](./backend/API.md)

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

# 宠物领养平台配置指南

## IP 环境配置

当您的 IP 环境发生变化时，只需要修改以下两个文件中的相关配置即可：

### 1. 后端配置 (`backend/.env`)

修改以下配置项：

```env
HOST=192.168.31.232            # 修改为您的新 IP
SERVER_URL=http://192.168.31.232:5001  # 修改为您的新 IP
UPLOAD_URL=http://192.168.31.232:5001/uploads  # 修改为您的新 IP
```

### 2. 前端配置 (`frontend/src/config.js`)

修改以下配置项：

```javascript
export const API_BASE_URL = "http://192.168.31.232:5001";  # 修改为您的新 IP
```

## 注意事项

1. 确保前后端的 IP 配置保持一致
2. 修改配置后需要重启前后端服务
3. 端口号（5001）可以保持不变，除非有特殊需求
4. 修改后请确认以下功能是否正常：
   - 图片上传和显示
   - API 接口调用
   - 静态资源访问

## 重启服务

配置修改后，请按以下步骤重启服务：

1. 后端重启：

```bash
cd backend
npm run dev  # 或其他启动命令
```

2. 前端重启：

```bash
cd frontend
npm start  # 或其他启动命令
```
