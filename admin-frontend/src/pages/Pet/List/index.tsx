import { deletePet, getAllPets } from '@/services/pet';
import { ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Image,
  message,
  Modal,
  Space,
  Tag,
} from 'antd';
import { useRef, useState } from 'react';

const { confirm } = Modal;

interface Pet {
  _id: string;
  petName: string;
  type: 'cat' | 'dog' | 'other';
  breed: string;
  age: string;
  gender: 'male' | 'female' | 'unknown';
  description?: string;
  requirements?: string;
  images?: string[];
  medical: {
    healthStatus: '健康' | '亚健康' | '需要治疗';
    vaccinated: boolean;
    sterilized: boolean;
  };
  status: 'available' | 'pending' | 'adopted';
  owner: {
    _id: string;
    username: string;
    profile?: {
      name?: string;
      phone?: string;
      address?: string;
      avatar?: string;
    };
  };
  createdAt: string;
}

const PetList = () => {
  const actionRef = useRef<ActionType>();
  const [viewPet, setViewPet] = useState<Pet | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleDelete = async (id: string) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个宠物信息吗？',
      onOk: async () => {
        try {
          await deletePet(id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const showPetDetails = (record: Pet) => {
    setViewPet(record);
    setDrawerVisible(true);
  };

  const healthStatusColorMap: Record<string, string> = {
    健康: 'success',
    亚健康: 'warning',
    需要治疗: 'error',
  };

  const columns: ProColumns<Pet>[] = [
    {
      title: '宠物照片',
      dataIndex: 'images',
      search: false,
      render: (_, record) =>
        record.images && record.images.length > 0 ? (
          <Image.PreviewGroup>
            <Space>
              <Image
                src={record.images[0]}
                alt="宠物照片"
                width={80}
                height={80}
                style={{ objectFit: 'cover' }}
              />
              {record.images.length > 1 && (
                <Tag color="processing">+{record.images.length - 1}张</Tag>
              )}
            </Space>
          </Image.PreviewGroup>
        ) : (
          '暂无照片'
        ),
    },
    {
      title: '宠物名称',
      dataIndex: 'petName',
      fieldProps: {
        placeholder: '请输入宠物名称',
      },
    },
    {
      title: '发布者',
      dataIndex: ['owner', 'username'],
      fieldProps: {
        placeholder: '请输入发布者用户名或真实姓名',
      },
      search: {
        transform: (value) => {
          return {
            'owner.username': value,
          };
        },
      },
      render: (_, record) => (
        <Space>
          <Avatar src={record.owner?.profile?.avatar} size="small">
            {record.owner?.profile?.name?.[0] || record.owner?.username[0]}
          </Avatar>
          <span>{record.owner?.profile?.name || record.owner?.username}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueEnum: {
        cat: { text: '猫' },
        dog: { text: '狗' },
        other: { text: '其他' },
      },
    },
    {
      title: '品种',
      dataIndex: 'breed',
      search: false,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      search: false,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      valueEnum: {
        male: { text: '公' },
        female: { text: '母' },
        unknown: { text: '未知' },
      },
    },
    {
      title: '健康状况',
      dataIndex: ['medical', 'healthStatus'],
      valueEnum: {
        健康: { text: '健康', status: 'Success' },
        亚健康: { text: '亚健康', status: 'Warning' },
        需要治疗: { text: '需要治疗', status: 'Error' },
      },
      search: {
        transform: (value) => {
          return {
            'medical.healthStatus': value,
          };
        },
      },
    },
    {
      title: '疫苗接种',
      dataIndex: ['medical', 'vaccinated'],
      valueEnum: {
        true: { text: '已接种', status: 'Success' },
        false: { text: '未接种', status: 'Warning' },
      },
      search: {
        transform: (value) => {
          return {
            'medical.vaccinated': value,
          };
        },
      },
    },
    {
      title: '绝育情况',
      dataIndex: ['medical', 'sterilized'],
      valueEnum: {
        true: { text: '已绝育', status: 'Success' },
        false: { text: '未绝育', status: 'Warning' },
      },
      search: {
        transform: (value) => {
          return {
            'medical.sterilized': value,
          };
        },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        available: { text: '可领养', status: 'Success' },
        pending: { text: '申请中', status: 'Processing' },
        adopted: { text: '已领养', status: 'Default' },
      },
    },
    {
      title: '发布时间',
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
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showPetDetails(record)}
        >
          查看详情
        </Button>,
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
      <ProTable<Pet>
        headerTitle="宠物列表"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
          optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" href="/pet/create">
            添加宠物
          </Button>,
        ]}
        request={async (params) => {
          try {
            console.log('搜索参数:', params);

            // 获取所有宠物数据
            const pets = await getAllPets();
            let filteredPets = [...pets];

            // 按宠物名称过滤
            if (params.petName) {
              filteredPets = filteredPets.filter((pet) =>
                pet.petName
                  .toLowerCase()
                  .includes(params.petName.toLowerCase()),
              );
            }

            // 按发布者过滤
            if (params['owner.username']) {
              const searchText = params['owner.username'].toLowerCase();
              filteredPets = filteredPets.filter(
                (pet) =>
                  pet.owner?.username?.toLowerCase().includes(searchText) ||
                  pet.owner?.profile?.name?.toLowerCase().includes(searchText),
              );
            }

            // 按类型过滤
            if (params.type) {
              filteredPets = filteredPets.filter(
                (pet) => pet.type === params.type,
              );
            }

            // 按性别过滤
            if (params.gender) {
              filteredPets = filteredPets.filter(
                (pet) => pet.gender === params.gender,
              );
            }

            // 按健康状况过滤
            if (params['medical.healthStatus']) {
              filteredPets = filteredPets.filter(
                (pet) =>
                  pet.medical.healthStatus === params['medical.healthStatus'],
              );
            }

            // 按疫苗接种过滤
            if (params['medical.vaccinated']) {
              const isVaccinated = params['medical.vaccinated'] === 'true';
              filteredPets = filteredPets.filter(
                (pet) => pet.medical.vaccinated === isVaccinated,
              );
            }

            // 按绝育情况过滤
            if (params['medical.sterilized']) {
              const isSterilized = params['medical.sterilized'] === 'true';
              filteredPets = filteredPets.filter(
                (pet) => pet.medical.sterilized === isSterilized,
              );
            }

            // 按状态过滤
            if (params.status) {
              filteredPets = filteredPets.filter(
                (pet) => pet.status === params.status,
              );
            }

            // 按发布时间过滤
            if (params.createdAt && params.createdAt.length === 2) {
              const startTime = new Date(params.createdAt[0]).setHours(
                0,
                0,
                0,
                0,
              );
              const endTime = new Date(params.createdAt[1]).setHours(
                23,
                59,
                59,
                999,
              );
              console.log('时间过滤条件:', {
                startTime: new Date(startTime).toLocaleString(),
                endTime: new Date(endTime).toLocaleString(),
              });

              filteredPets = filteredPets.filter((pet) => {
                const petTime = new Date(pet.createdAt).getTime();
                console.log('宠物发布时间:', {
                  petName: pet.petName,
                  createdAt: new Date(pet.createdAt).toLocaleString(),
                  isInRange: petTime >= startTime && petTime <= endTime,
                });
                return petTime >= startTime && petTime <= endTime;
              });

              console.log('时间过滤后的结果数量:', filteredPets.length);
            }

            console.log('过滤后的宠物数据:', filteredPets);

            return {
              data: filteredPets,
              success: true,
              total: filteredPets.length,
            };
          } catch (error) {
            console.error('获取宠物列表失败:', error);
            message.error('获取宠物列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
      />

      <Drawer
        title="宠物详情"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        {viewPet && (
          <>
            <Image.PreviewGroup>
              <Space wrap>
                {viewPet.images?.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`宠物照片 ${index + 1}`}
                    width={200}
                    height={200}
                    style={{ objectFit: 'cover' }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>

            <Descriptions column={1} style={{ marginTop: 24 }}>
              <Descriptions.Item label="宠物名称">
                {viewPet.petName}
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                {viewPet.type === 'cat'
                  ? '猫'
                  : viewPet.type === 'dog'
                  ? '狗'
                  : '其他'}
              </Descriptions.Item>
              <Descriptions.Item label="品种">
                {viewPet.breed}
              </Descriptions.Item>
              <Descriptions.Item label="年龄">{viewPet.age}</Descriptions.Item>
              <Descriptions.Item label="性别">
                {viewPet.gender === 'male'
                  ? '公'
                  : viewPet.gender === 'female'
                  ? '母'
                  : '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="健康状况">
                <Tag color={healthStatusColorMap[viewPet.medical.healthStatus]}>
                  {viewPet.medical.healthStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="疫苗接种">
                <Tag color={viewPet.medical.vaccinated ? 'success' : 'warning'}>
                  {viewPet.medical.vaccinated ? '已接种' : '未接种'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="绝育情况">
                <Tag color={viewPet.medical.sterilized ? 'success' : 'warning'}>
                  {viewPet.medical.sterilized ? '已绝育' : '未绝育'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {viewPet.description || '暂无描述'}
              </Descriptions.Item>
              <Descriptions.Item label="领养要求">
                {viewPet.requirements || '暂无特殊要求'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag
                  color={
                    viewPet.status === 'available'
                      ? 'success'
                      : viewPet.status === 'pending'
                      ? 'processing'
                      : 'default'
                  }
                >
                  {viewPet.status === 'available'
                    ? '可领养'
                    : viewPet.status === 'pending'
                    ? '申请中'
                    : '已领养'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '24px 0' }} />

            <Descriptions title="发布者信息" column={1}>
              <Descriptions.Item label="姓名">
                {viewPet.owner?.profile?.name ||
                  viewPet.owner?.username ||
                  '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {viewPet.owner?.profile?.phone || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="地址">
                {viewPet.owner?.profile?.address || '未设置'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default PetList;
