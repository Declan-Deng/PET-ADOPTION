import { createPet } from '@/services/pet';
import {
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { message } from 'antd';

const PetCreate = () => {
  const handleSubmit = async (values: any) => {
    try {
      await createPet(values);
      message.success('创建成功');
      history.push('/pet/list');
    } catch (error) {
      message.error('创建失败');
    }
  };

  return (
    <PageContainer title="添加宠物">
      <ProForm
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: '保存',
          },
        }}
      >
        <ProFormText
          name="petName"
          label="宠物名称"
          rules={[{ required: true, message: '请输入宠物名称' }]}
        />
        <ProFormSelect
          name="type"
          label="类型"
          options={[
            { label: '猫', value: 'cat' },
            { label: '狗', value: 'dog' },
            { label: '其他', value: 'other' },
          ]}
          rules={[{ required: true, message: '请选择宠物类型' }]}
        />
        <ProFormText
          name="breed"
          label="品种"
          rules={[{ required: true, message: '请输入品种' }]}
        />
        <ProFormDigit
          name="age"
          label="年龄"
          rules={[{ required: true, message: '请输入年龄' }]}
          min={0}
        />
        <ProFormSelect
          name="gender"
          label="性别"
          options={[
            { label: '公', value: 'male' },
            { label: '母', value: 'female' },
            { label: '未知', value: 'unknown' },
          ]}
          rules={[{ required: true, message: '请选择性别' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          rules={[{ required: true, message: '请输入描述' }]}
        />
        <ProFormTextArea
          name="requirements"
          label="领养要求"
          rules={[{ required: true, message: '请输入领养要求' }]}
        />
        <ProFormSelect
          name="medical.healthStatus"
          label="健康状况"
          options={[
            { label: '健康', value: '健康' },
            { label: '亚健康', value: '亚健康' },
            { label: '需要治疗', value: '需要治疗' },
          ]}
          rules={[{ required: true, message: '请选择健康状况' }]}
        />
        <ProFormSelect
          name={['medical', 'vaccinated']}
          label="是否接种疫苗"
          options={[
            { label: '是', value: true },
            { label: '否', value: false },
          ]}
          rules={[{ required: true, message: '请选择是否接种疫苗' }]}
        />
        <ProFormSelect
          name={['medical', 'sterilized']}
          label="是否绝育"
          options={[
            { label: '是', value: true },
            { label: '否', value: false },
          ]}
          rules={[{ required: true, message: '请选择是否绝育' }]}
        />
        <ProFormUploadButton
          name="images"
          label="宠物照片"
          max={5}
          fieldProps={{
            name: 'file',
            listType: 'picture-card',
          }}
          action="/api/upload"
          rules={[{ required: true, message: '请上传宠物照片' }]}
        />
      </ProForm>
    </PageContainer>
  );
};

export default PetCreate;
