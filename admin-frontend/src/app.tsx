import { LogoutOutlined } from '@ant-design/icons';
import { message } from 'antd';

export async function getInitialState() {
  const user = localStorage.getItem('user');
  if (!user) {
    window.location.href = '/user/login';
    return null;
  }
  return JSON.parse(user);
}

export const layout = {
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    message.success('退出成功');
    window.location.href = '/user/login';
  },
  rightRender: (initialState: any) => {
    return {
      avatar:
        initialState?.profile?.avatar ||
        'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      name: initialState?.profile?.name || initialState?.username || '未登录',
      logout: true,
      dropdownProps: {
        menu: {
          items: [
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: '退出登录',
              onClick: () => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                message.success('退出成功');
                window.location.href = '/user/login';
              },
            },
          ],
        },
      },
    };
  },
};

export const request = {
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      return response;
    },
  ],
  errorConfig: {
    errorHandler: (error: any) => {
      console.log('请求错误:', error);
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.href = '/user/login';
          message.error('登录已过期，请重新登录');
        } else if (error.response.status === 403) {
          message.error('没有管理员权限，请使用管理员账号登录');
        } else {
          message.error('请求失败，请重试');
        }
      } else if (error.request) {
        message.error('网络错误，请检查后端服务是否正常');
      } else {
        message.error('请求错误');
      }
    },
  },
};
