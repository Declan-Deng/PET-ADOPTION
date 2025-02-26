import { login } from '@/services/auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { message } from 'antd';

const Login = () => {
  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      const response = await login(values);
      if (response.user.role !== 'admin') {
        message.error('非管理员用户无法登录！');
        return;
      }
      message.success('登录成功！');
      history.push('/welcome');
    } catch (error: any) {
      console.error('登录错误:', error);
      if (error.response) {
        message.error(error.response.data?.message || '登录失败');
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('登录失败，请重试！');
      }
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        background: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <LoginForm
        title="宠物领养管理系统"
        subTitle="管理员登录"
        onFinish={async (values) => {
          await handleSubmit(values as { username: string; password: string });
        }}
      >
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined />,
          }}
          placeholder="用户名：admin"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="密码：admin123"
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        />
      </LoginForm>
    </div>
  );
};

export default Login;
