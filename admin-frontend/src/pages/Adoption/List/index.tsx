import {
  Adoption,
  approveAdoption,
  deleteAdoption,
  getAllAdoptions,
  rejectAdoption,
} from '@/services/adoption';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ActionType,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Modal, Row, Space } from 'antd';
import { useRef } from 'react';

const { confirm } = Modal;

const AdoptionList = () => {
  const actionRef = useRef<ActionType>();

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

  const handleApprove = async (id: string) => {
    confirm({
      title: '确认通过',
      icon: <ExclamationCircleOutlined />,
      content: '通过后该宠物将标记为已被领养，确定要通过吗？',
      onOk: async () => {
        try {
          await approveAdoption(id);
          message.success('申请已通过');
          actionRef.current?.reload();
        } catch (error) {
          console.error('通过申请失败:', error);
          message.error('通过申请失败');
        }
      },
    });
  };

  const handleReject = async (id: string) => {
    confirm({
      title: '确认拒绝',
      icon: <ExclamationCircleOutlined />,
      content: '确定要拒绝该领养申请吗？',
      onOk: async () => {
        try {
          await rejectAdoption(id);
          message.success('申请已拒绝');
          actionRef.current?.reload();
        } catch (error) {
          console.error('拒绝申请失败:', error);
          message.error('拒绝申请失败');
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
      search: {
        transform: (value) => {
          return {
            'pet.petName': value,
          };
        },
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
      search: {
        transform: (value) => {
          return {
            'pet.type': value,
          };
        },
      },
    },
    {
      title: '申请人',
      dataIndex: ['applicant', 'profile', 'name'],
      fieldProps: {
        placeholder: '请输入申请人姓名',
      },
      search: {
        transform: (value) => {
          return {
            'applicant.profile.name': value,
          };
        },
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
            createdAt: value,
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
        rejected: { text: '已拒绝', status: 'Error' },
        cancelled: { text: '已取消', status: 'Default' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => {
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Button
              key="delete"
              type="link"
              danger
              onClick={() => handleDelete(record._id)}
              style={{ padding: '4px 0', height: 'auto' }}
            >
              删除
            </Button>

            {record.status === 'active' && (
              <Row>
                <Space>
                  <Button
                    key="approve"
                    type="link"
                    style={{ color: 'green', padding: '4px 0', height: 'auto' }}
                    onClick={() => handleApprove(record._id)}
                  >
                    通过
                  </Button>
                  <Button
                    key="reject"
                    type="link"
                    danger
                    style={{ padding: '4px 0', height: 'auto' }}
                    onClick={() => handleReject(record._id)}
                  >
                    拒绝
                  </Button>
                </Space>
              </Row>
            )}
          </Space>
        );
      },
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
            console.log('搜索参数:', params);

            // 构建查询参数
            const queryParams: any = {};

            // 添加宠物名称搜索
            if (params['pet.petName']) {
              queryParams['pet.petName'] = params['pet.petName'];
            }

            // 添加宠物类型搜索
            if (params['pet.type']) {
              queryParams['pet.type'] = params['pet.type'];
            }

            // 添加申请人姓名搜索
            if (params['applicant.profile.name']) {
              queryParams['applicant.profile.name'] =
                params['applicant.profile.name'];
            }

            // 添加状态搜索
            if (params.status) {
              queryParams.status = params.status;
            }

            // 添加时间范围搜索
            if (params.createdAt) {
              queryParams.startTime = params.createdAt[0];
              queryParams.endTime = params.createdAt[1];
            }

            console.log('发送到后端的参数:', queryParams);

            const response = await getAllAdoptions(queryParams);
            console.log('获取到的申请数据:', response);

            if (!response || !response.data) {
              return {
                data: [],
                success: true,
                total: 0,
              };
            }

            return {
              data: response.data,
              success: true,
              total: response.data.length,
            };
          } catch (error) {
            console.error('获取数据失败:', error);
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
