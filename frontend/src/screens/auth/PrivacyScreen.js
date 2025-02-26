import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Appbar } from "react-native-paper";

const PrivacyScreen = ({ navigation }) => {
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="隐私政策" />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>隐私政策</Text>

        <Text style={styles.section}>1. 信息收集</Text>
        <Text style={styles.content}>
          我们收集的信息包括但不限于：{"\n"}• 基本个人信息（姓名、联系方式）
          {"\n"}• 身份验证信息{"\n"}• 设备信息{"\n"}• 使用记录
        </Text>

        <Text style={styles.section}>2. 信息使用</Text>
        <Text style={styles.content}>
          收集的信息将用于：{"\n"}• 提供领养服务{"\n"}• 身份验证{"\n"}• 安全保障
          {"\n"}• 服务改进
        </Text>

        <Text style={styles.section}>3. 信息保护</Text>
        <Text style={styles.content}>
          我们采取严格的安全措施保护您的个人信息：{"\n"}• 数据加密存储{"\n"}•
          访问权限控制{"\n"}• 定期安全审计
        </Text>

        <Text style={styles.section}>4. 信息共享</Text>
        <Text style={styles.content}>
          除非经过您的同意，我们不会与第三方分享您的个人信息。以下情况除外：
          {"\n"}• 法律要求{"\n"}• 保护平台及用户权益{"\n"}• 提供必要的服务
        </Text>

        <Text style={styles.section}>5. 用户权利</Text>
        <Text style={styles.content}>
          您有权：{"\n"}• 访问您的个人信息{"\n"}• 更正不准确的信息{"\n"}•
          删除个人信息{"\n"}• 撤回授权同意
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

export default PrivacyScreen;
