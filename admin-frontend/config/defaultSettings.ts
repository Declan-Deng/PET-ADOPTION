import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  logo: '../public/logo.png', // 使用 public 目录下的 logo.png
  title: '你的网站名称',
};

export default settings;
