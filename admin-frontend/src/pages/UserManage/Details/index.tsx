import { getUser } from '@/services/user';
import { PageContainer } from '@ant-design/pro-components';
import { Avatar, Card, Space, Tabs, Tag } from 'antd';
import { useEffect, useState } from 'react';

interface IUserDetails {
  _id: string;
  username: string;
  email: string;
  profile: {
    name: string;
    phone: string;
    address: string;
    avatar?: string;
  };
  adoptions: Array<{
    _id: string;
    pet: {
      petName: string;
      type: string;
    };
    status: string;
    createdAt: string;
  }>;
  publications: Array<{
    _id: string;
    petName: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

const UserDetailsPage = () => {
  // 从URL中获取参数
  const urlParams = new URLSearchParams(window.location.search);
  const id = window.location.pathname.split('/').pop();
  const [userDetails, setUserDetails] = useState<IUserDetails | null>(null);
  const [activeTab, setActiveTab] = useState(
    urlParams.get('tab') || 'adoptions',
  );

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await getUser(id!);
        setUserDetails(data);
      } catch (error) {
        console.error('获取用户详情失败:', error);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  if (!userDetails) {
    return <PageContainer>加载中...</PageContainer>;
  }

  return (
    <PageContainer
      title="用户详情"
      content={
        <Space size="large">
          <Avatar src={userDetails.profile.avatar} size={64}>
            {userDetails.profile.name?.[0] || userDetails.username[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <div style={{ fontSize: '20px' }}>
              {userDetails.profile.name || userDetails.username}
            </div>
            <div style={{ color: '#666' }}>{userDetails.email}</div>
          </Space>
        </Space>
      }
    >
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'adoptions',
              label: '领养申请',
              children: (
                <div>
                  {userDetails.adoptions.map((adoption) => (
                    <Card.Grid
                      key={adoption._id}
                      style={{ width: '33.33%', padding: '16px' }}
                    >
                      <Space direction="vertical">
                        <div>宠物名称: {adoption.pet.petName}</div>
                        <div>
                          宠物类型:{' '}
                          {adoption.pet.type === 'cat'
                            ? '猫'
                            : adoption.pet.type === 'dog'
                            ? '狗'
                            : '其他'}
                        </div>
                        <div>
                          申请状态:
                          <Tag
                            color={
                              adoption.status === 'approved'
                                ? 'success'
                                : adoption.status === 'active'
                                ? 'processing'
                                : 'default'
                            }
                          >
                            {adoption.status === 'approved'
                              ? '已通过'
                              : adoption.status === 'active'
                              ? '处理中'
                              : '已取消'}
                          </Tag>
                        </div>
                        <div>
                          申请时间:{' '}
                          {new Date(adoption.createdAt).toLocaleDateString()}
                        </div>
                      </Space>
                    </Card.Grid>
                  ))}
                </div>
              ),
            },
            {
              key: 'publications',
              label: '发布宠物',
              children: (
                <div>
                  {userDetails.publications.map((pet) => (
                    <Card.Grid
                      key={pet._id}
                      style={{ width: '33.33%', padding: '16px' }}
                    >
                      <Space direction="vertical">
                        <div>宠物名称: {pet.petName}</div>
                        <div>
                          宠物类型:{' '}
                          {pet.type === 'cat'
                            ? '猫'
                            : pet.type === 'dog'
                            ? '狗'
                            : '其他'}
                        </div>
                        <div>
                          状态:
                          <Tag
                            color={
                              pet.status === 'available'
                                ? 'success'
                                : pet.status === 'pending'
                                ? 'processing'
                                : 'default'
                            }
                          >
                            {pet.status === 'available'
                              ? '可领养'
                              : pet.status === 'pending'
                              ? '申请中'
                              : '已领养'}
                          </Tag>
                        </div>
                        <div>
                          发布时间:{' '}
                          {new Date(pet.createdAt).toLocaleDateString()}
                        </div>
                      </Space>
                    </Card.Grid>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default UserDetailsPage;
