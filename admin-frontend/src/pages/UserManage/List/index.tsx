import { getAllUsers, updateUserStatus } from '@/services/user';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, message, Modal, Space, Switch } from 'antd';
import { useRef, useState } from 'react';

const { confirm } = Modal;

interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    name: string;
    phone: string;
    address: string;
    avatar?: string;
  };
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
  adoptionCount: number;
  publicationCount: number;
}

const UserList = () => {
  const actionRef = useRef<ActionType>();
  // 使用 Map 来存储用户状态，避免对象引用问题
  const [loadedUsers, setLoadedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleStatusChange = async (checked: boolean, record: User) => {
    const newStatus = checked ? 'active' : 'disabled';

    confirm({
      title: `确认${checked ? '启用' : '禁用'}用户`,
      content: `确定要${checked ? '启用' : '禁用'}该用户吗？`,
      onOk: async () => {
        // 设置loading状态
        setLoading((prev) => ({ ...prev, [record._id]: true }));

        try {
          await updateUserStatus(record._id, newStatus);
          message.success('操作成功');

          // 更新本地数据
          setLoadedUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === record._id ? { ...user, status: newStatus } : user,
            ),
          );
        } catch (error) {
          message.error('操作失败');
        } finally {
          // 清除loading状态
          setLoading((prev) => ({ ...prev, [record._id]: false }));
        }
      },
    });
  };

  const columns: ProColumns<User>[] = [
    {
      title: '用户信息',
      dataIndex: 'profile',
      search: false,
      render: (_, record) => (
        <Space>
          <Avatar src={record.profile.avatar} size="large">
            {record.profile.name?.[0] || record.username[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <div>{record.profile.name || record.username}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.email}
            </div>
          </Space>
        </Space>
      ),
    },
    {
      title: '电话',
      dataIndex: ['profile', 'phone'],
    },
    {
      title: '地址',
      dataIndex: ['profile', 'address'],
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      valueEnum: {
        user: { text: '普通用户' },
        admin: { text: '管理员' },
      },
    },
    {
      title: '领养申请',
      dataIndex: 'adoptionCount',
      render: (_, record) => (
        <a
          onClick={() =>
            (window.location.href = `/user-manage/details/${record._id}?tab=adoptions`)
          }
        >
          {record.adoptionCount} 个申请
        </a>
      ),
    },
    {
      title: '发布宠物',
      dataIndex: 'publicationCount',
      render: (_, record) => (
        <a
          onClick={() =>
            (window.location.href = `/user-manage/details/${record._id}?tab=publications`)
          }
        >
          {record.publicationCount} 个发布
        </a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={record.status === 'active'}
          loading={loading[record._id]}
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
  ];

  return (
    <PageContainer>
      <ProTable<User>
        actionRef={actionRef}
        headerTitle="用户列表"
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        request={async () => {
          try {
            const data = await getAllUsers();
            setLoadedUsers(data);
            return {
              data,
              success: true,
            };
          } catch (error) {
            message.error('获取用户列表失败');
            return {
              data: [],
              success: false,
            };
          }
        }}
        dataSource={loadedUsers}
        columns={columns}
      />
    </PageContainer>
  );
};

export default UserList;
