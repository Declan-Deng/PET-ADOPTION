import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';

const Welcome = () => {
  return (
    <PageContainer>
      <Card>
        <h1>欢迎使用宠物领养管理系统</h1>
        <p>
          本系统提供宠物管理、领养申请管理和用户管理等功能。
          <br />
          请从左侧菜单选择要使用的功能。
        </p>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
