// 运行时配置
import { history } from '@umijs/max';

interface InitialState {
  currentUser?: {
    name: string;
    role: string;
  };
}

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<InitialState> {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    history.push('/user/login');
    return {};
  }

  const user = JSON.parse(userStr);
  return {
    currentUser: {
      name: user.profile?.name || user.username,
      role: user.role,
    },
  };
}

export const layout = () => {
  return {
    logo: require('@/assets/logo.png'),
    menu: {
      locale: false,
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      history.push('/user/login');
    },
    rightRender: (initialState: InitialState) => {
      return initialState.currentUser?.name;
    },
  };
};

// @ts-ignore
import { RequestConfig } from '@umijs/max';
import { message } from 'antd';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

export const request: RequestConfig = {
  timeout: 10000,
  errorConfig: {
    errorHandler: (error: any) => {
      console.error('请求错误:', error);
      if (error.response) {
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        if (error.response.status === 401) {
          message.error('请先登录');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          history.push('/user/login');
          return;
        }
        if (error.response.status === 403) {
          message.error('没有权限访问');
          return;
        }
        message.error(error.response.data?.message || '请求失败');
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        message.error('网络错误，请检查后端服务是否正常运行');
      } else {
        // 发送请求时出了点问题
        message.error('请求错误，请稍后重试');
      }
    },
  },
  requestInterceptors: [
    (config: any) => {
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],
  responseInterceptors: [
    // @ts-ignore
    (response) => {
      return response;
    },
  ],
};
