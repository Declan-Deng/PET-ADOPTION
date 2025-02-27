import { deleteUser, getAllUsers, updateUserStatus } from '@/services/user';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, Button, message, Modal, Space, Switch } from 'antd';
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
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleStatusChange = async (checked: boolean, record: User) => {
    if (record.role === 'admin') {
      message.warning('管理员账号不能被禁用');
      return;
    }

    const newStatus = checked ? 'active' : 'disabled';

    confirm({
      title: `确认${checked ? '启用' : '禁用'}用户`,
      content: `确定要${checked ? '启用' : '禁用'}该用户吗？`,
      onOk: async () => {
        setLoading((prev) => ({ ...prev, [record._id]: true }));

        try {
          await updateUserStatus(record._id, newStatus);
          message.success('操作成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('操作失败');
        } finally {
          setLoading((prev) => ({ ...prev, [record._id]: false }));
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该用户吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ProColumns<User>[] = [
    {
      title: '用户信息',
      dataIndex: 'username',
      fieldProps: {
        placeholder: '请输入用户名或邮箱',
      },
      render: (_, record) => (
        <Space>
          <Avatar src={record.profile.avatar} size="large">
            {record.username[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <div>{record.username}</div>
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
      search: false,
    },
    {
      title: '地址',
      dataIndex: ['profile', 'address'],
      ellipsis: true,
      search: false,
    },
    {
      title: '领养申请',
      dataIndex: 'adoptionCount',
      search: false,
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
      search: false,
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
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        disabled: { text: '已禁用', status: 'Error' },
      },
      render: (_, record) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={record.status === 'active'}
          loading={loading[record._id]}
          onChange={(checked) => handleStatusChange(checked, record)}
          disabled={record.role === 'admin'}
        />
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => handleDelete(record._id)}
          disabled={record.role === 'admin'}
        >
          删除
        </Button>,
      ],
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
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
          defaultCollapsed: false,
        }}
        request={async (params) => {
          try {
            const users = await getAllUsers();
            let filteredUsers = [...users];

            // 按用户名或邮箱过滤
            if (params.username) {
              const searchText = params.username.toString().toLowerCase();
              filteredUsers = filteredUsers.filter(
                (user) =>
                  user.username.toLowerCase().includes(searchText) ||
                  user.email.toLowerCase().includes(searchText),
              );
            }

            // 按状态过滤
            if (params.status) {
              filteredUsers = filteredUsers.filter(
                (user) => user.status === params.status,
              );
            }

            return {
              data: filteredUsers,
              success: true,
              total: filteredUsers.length,
            };
          } catch (error) {
            message.error('获取用户列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default UserList;
