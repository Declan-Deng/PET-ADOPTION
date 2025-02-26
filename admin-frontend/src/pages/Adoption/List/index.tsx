import {
  Adoption,
  approveAdoption,
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

  const columns: ProColumns<Adoption>[] = [
    {
      title: '宠物名称',
      dataIndex: ['pet', 'petName'],
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
    },
    {
      title: '联系电话',
      dataIndex: ['applicant', 'profile', 'phone'],
    },
    {
      title: '申请理由',
      dataIndex: 'reason',
      ellipsis: true,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
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
        }}
        request={async () => {
          try {
            const { data } = await getAllAdoptions();
            return {
              data: data || [],
              success: true,
            };
          } catch (error) {
            message.error('获取数据失败');
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

export default AdoptionList;
