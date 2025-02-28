import {
  Adoption,
  approveAdoption,
  deleteAdoption,
  getAllAdoptions,
} from '@/services/adoption';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ActionType,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { useRef } from 'react';

const { confirm } = Modal;

const AdoptionList = () => {
  const actionRef = useRef<ActionType>();

  const handleApprove = async (id: string) => {
    confirm({
      title: '确认通过',
      icon: <ExclamationCircleOutlined />,
      content: '确定要通过这个领养申请吗？',
      onOk: async () => {
        try {
          await approveAdoption(id);
          message.success('已通过申请');
          actionRef.current?.reload();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个领养申请吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await deleteAdoption(id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const columns: ProColumns<Adoption>[] = [
    {
      title: '宠物名称',
      dataIndex: ['pet', 'petName'],
      fieldProps: {
        placeholder: '请输入宠物名称',
      },
    },
    {
      title: '宠物类型',
      dataIndex: ['pet', 'type'],
      valueEnum: {
        cat: { text: '猫' },
        dog: { text: '狗' },
        other: { text: '其他' },
      },
    },
    {
      title: '申请人',
      dataIndex: ['applicant', 'profile', 'name'],
      fieldProps: {
        placeholder: '请输入申请人姓名',
      },
    },
    {
      title: '联系电话',
      dataIndex: ['applicant', 'profile', 'phone'],
      search: false,
    },
    {
      title: '申请理由',
      dataIndex: 'reason',
      ellipsis: true,
      search: false,
    },
    {
      title: '养宠经验',
      dataIndex: 'experience',
      ellipsis: true,
      search: false,
    },
    {
      title: '居住条件',
      dataIndex: 'livingCondition',
      ellipsis: true,
      search: false,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        active: { text: '待处理', status: 'Processing' },
        approved: { text: '已通过', status: 'Success' },
        cancelled: { text: '已取消', status: 'Default' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        record.status === 'active' && (
          <Button
            key="approve"
            type="link"
            onClick={() => handleApprove(record._id)}
          >
            通过
          </Button>
        ),
        <Button
          key="delete"
          type="link"
          danger
          onClick={() => handleDelete(record._id)}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<Adoption>
        headerTitle="领养申请列表"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        request={async (params) => {
          try {
            const { data } = await getAllAdoptions({
              'pet.petName': params.pet?.petName,
              'pet.type': params.pet?.type,
              'applicant.profile.name': params.applicant?.profile?.name,
              startTime: params.createdAt?.[0],
              endTime: params.createdAt?.[1],
              status: params.status,
            });

            return {
              data: data || [],
              success: true,
              total: (data || []).length,
            };
          } catch (error) {
            message.error('获取数据失败');
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

export default AdoptionList;
