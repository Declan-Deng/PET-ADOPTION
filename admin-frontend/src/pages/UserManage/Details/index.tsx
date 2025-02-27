import { getUser } from '@/services/user';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Card,
  Col,
  Descriptions,
  Empty,
  Image,
  List,
  Result,
  Row,
  Spin,
  Tabs,
  Tag,
} from 'antd';
import { useEffect, useState } from 'react';

const UserDetails = () => {
  const id = window.location.pathname.split('/').pop();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(
    new URLSearchParams(window.location.search).get('tab') || 'publications',
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await getUser(id!);
        setUserDetails(data);
      } catch (error) {
        console.error('获取用户详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const renderPublications = () => {
    if (!userDetails?.publications?.length) {
      return <Empty description="暂无发布的宠物" />;
    }

    return (
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={userDetails.publications}
        renderItem={(pet: any) => (
          <List.Item>
            <Card
              hoverable
              cover={
                pet.images?.length > 0 ? (
                  <Image
                    alt={pet.petName}
                    src={pet.images[0]}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                ) : null
              }
            >
              <Card.Meta
                title={
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span>{pet.petName}</span>
                    <Tag
                      color={
                        pet.status === 'available'
                          ? 'green'
                          : pet.status === 'pending'
                          ? 'orange'
                          : 'red'
                      }
                    >
                      {pet.status === 'available'
                        ? '可领养'
                        : pet.status === 'pending'
                        ? '领养中'
                        : '已领养'}
                    </Tag>
                  </div>
                }
                description={
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="品种">
                      {pet.breed}
                    </Descriptions.Item>
                    <Descriptions.Item label="年龄">
                      {pet.age}岁
                    </Descriptions.Item>
                    <Descriptions.Item label="性别">
                      {pet.gender === 'male' ? '公' : '母'}
                    </Descriptions.Item>
                    <Descriptions.Item label="发布时间">
                      {new Date(pet.createdAt).toLocaleDateString()}
                    </Descriptions.Item>
                  </Descriptions>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    );
  };

  const renderAdoptions = () => {
    if (!userDetails?.adoptions?.length) {
      return <Empty description="暂无领养申请" />;
    }

    return (
      <List
        dataSource={userDetails.adoptions}
        renderItem={(adoption: any) => (
          <List.Item>
            <Card style={{ width: '100%' }}>
              <Card.Meta
                title={`申请领养: ${adoption.pet.petName}`}
                description={
                  <>
                    <Tag
                      color={
                        adoption.status === 'pending'
                          ? 'orange'
                          : adoption.status === 'approved'
                          ? 'green'
                          : 'red'
                      }
                    >
                      {adoption.status === 'pending'
                        ? '审核中'
                        : adoption.status === 'approved'
                        ? '已通过'
                        : '已拒绝'}
                    </Tag>
                    <div>
                      申请时间: {new Date(adoption.createdAt).toLocaleString()}
                    </div>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <Spin />
      </PageContainer>
    );
  }

  if (!userDetails) {
    return (
      <PageContainer>
        <Result status="404" title="用户不存在" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <Row gutter={24}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={120} src={userDetails.profile.avatar}>
                {userDetails.username[0].toUpperCase()}
              </Avatar>
              <h2 style={{ marginTop: 16 }}>{userDetails.username}</h2>
              <p>{userDetails.email}</p>
              <Tag color={userDetails.status === 'active' ? 'green' : 'red'}>
                {userDetails.status === 'active' ? '正常' : '已禁用'}
              </Tag>
            </div>
          </Col>
          <Col span={18}>
            <Descriptions title="基本信息" column={2}>
              <Descriptions.Item label="真实姓名">
                {userDetails.profile.name || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="电话">
                {userDetails.profile.phone || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="地址">
                {userDetails.profile.address || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="角色">
                {userDetails.role === 'admin' ? '管理员' : '普通用户'}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {new Date(userDetails.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'publications',
              label: '发布的宠物',
              children: renderPublications(),
            },
            {
              key: 'adoptions',
              label: '领养申请',
              children: renderAdoptions(),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default UserDetails;
