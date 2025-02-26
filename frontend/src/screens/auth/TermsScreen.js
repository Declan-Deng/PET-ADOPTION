import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Appbar } from "react-native-paper";

const TermsScreen = ({ navigation }) => {
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="服务条款" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>宠物领养平台服务条款</Text>
        <Text style={styles.section}>1. 服务说明</Text>
        <Text style={styles.content}>
          宠物领养平台（以下简称"平台"）是一个致力于为流浪动物提供新家，为爱心人士提供领养渠道的公益平台。
        </Text>

        <Text style={styles.section}>2. 用户责任</Text>
        <Text style={styles.content}>
          • 用户应确保提供真实、准确的个人信息{"\n"}• 用户应遵守相关法律法规
          {"\n"}• 用户应善待领养的宠物，提供适当的生活环境
        </Text>

        <Text style={styles.section}>3. 领养规则</Text>
        <Text style={styles.content}>
          • 领养人必须年满18周岁{"\n"}• 具有固定住所和稳定收入{"\n"}•
          有能力承担宠物的日常开支{"\n"}• 同意定期反馈宠物状况
        </Text>

        <Text style={styles.section}>4. 平台责任</Text>
        <Text style={styles.content}>
          • 审核发布者和领养者信息{"\n"}• 提供安全的交流平台{"\n"}•
          保护用户隐私信息{"\n"}• 监督领养过程
        </Text>

        <Text style={styles.section}>5. 免责声明</Text>
        <Text style={styles.content}>
          平台仅提供信息对接服务，不对领养双方产生的纠纷承担责任。建议用户在线下见面时注意安全。
        </Text>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1a237e",
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#1a237e",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
  },
});

export default TermsScreen;
