import { LogoutOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, message, Space } from 'antd';

const Welcome = () => {
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    message.success('退出成功');
    window.location.href = '/user/login';
  };

  return (
    <PageContainer>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h1>欢迎使用宠物领养管理系统</h1>
            <p>
              本系统提供宠物管理、领养申请管理和用户管理等功能。
              <br />
              请从左侧菜单选择要使用的功能。
            </p>
          </div>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            size="large"
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
