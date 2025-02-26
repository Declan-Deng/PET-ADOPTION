import { getAllUsers, updateUserStatus } from '@/services/user';
import {
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { message, Modal, Switch } from 'antd';

const { confirm } = Modal;

interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    name: string;
    phone: string;
    address: string;
  };
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
}

const UserList = () => {
  const handleStatusChange = async (checked: boolean, record: User) => {
    const newStatus = checked ? 'active' : 'disabled';
    confirm({
      title: `确认${checked ? '启用' : '禁用'}用户`,
      content: `确定要${checked ? '启用' : '禁用'}该用户吗？`,
      onOk: async () => {
        try {
          await updateUserStatus(record._id, newStatus);
          message.success('操作成功');
          window.location.reload();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const columns: ProColumns<User>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '姓名',
      dataIndex: ['profile', 'name'],
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
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => (
        <Switch
          checked={record.status === 'active'}
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
        headerTitle="用户列表"
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        request={async () => {
          try {
            const users = await getAllUsers();
            return {
              data: users,
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
        columns={columns}
      />
    </PageContainer>
  );
};

export default UserList;
