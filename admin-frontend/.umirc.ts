import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '宠物领养管理系统',
  },
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          name: '登录',
          path: '/user/login',
          component: './User/Login',
        },
      ],
    },
    {
      path: '/welcome',
      name: '欢迎',
      icon: 'smile',
      component: './Welcome',
    },
    {
      path: '/pet',
      name: '宠物管理',
      icon: 'heart',
      routes: [
        {
          path: '/pet/list',
          name: '宠物列表',
          component: './Pet/List',
        },
        {
          path: '/pet/create',
          name: '添加宠物',
          component: './Pet/Create',
          hideInMenu: true,
        },
        {
          path: '/pet/edit/:id',
          name: '编辑宠物',
          component: './Pet/Edit',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/adoption',
      name: '领养管理',
      icon: 'form',
      routes: [
        {
          path: '/adoption/list',
          name: '领养申请列表',
          component: './Adoption/List',
        },
      ],
    },
    {
      path: '/user-manage',
      name: '用户管理',
      icon: 'user',
      routes: [
        {
          path: '/user-manage/list',
          name: '用户列表',
          component: './UserManage/List',
        },
      ],
    },
    {
      path: '/',
      redirect: '/welcome',
    },
    {
      path: '*',
      layout: false,
      component: './404',
    },
  ],
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
    },
  },
});
