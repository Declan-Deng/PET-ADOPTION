import * as React from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { Text, List, Surface, Button, Divider } from "react-native-paper";

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section} elevation={2}>
        <Text style={styles.title}>关于我们</Text>
        <Text style={styles.description}>
          宠物领养平台致力于为流浪动物提供一个温暖的家。我们希望通过这个平台，让更多的爱心人士能够收养到心仪的宠物，同时也为流浪动物提供一个安全的庇护所。
        </Text>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text style={styles.subtitle}>我们的使命</Text>
        <List.Item
          title="帮助流浪动物"
          description="为流浪动物提供一个找到新家的机会"
          left={(props) => <List.Icon {...props} icon="paw" />}
        />
        <Divider />
        <List.Item
          title="负责任的领养"
          description="确保每一次领养都是经过慎重考虑的决定"
          left={(props) => <List.Icon {...props} icon="heart" />}
        />
        <Divider />
        <List.Item
          title="教育与宣传"
          description="提高公众对待宠物领养的认识"
          left={(props) => <List.Icon {...props} icon="book-open" />}
        />
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text style={styles.subtitle}>联系我们</Text>
        <List.Item
          title="客服电话"
          description="400-123-4567"
          left={(props) => <List.Icon {...props} icon="phone" />}
          onPress={() => Linking.openURL("tel:4001234567")}
        />
        <Divider />
        <List.Item
          title="电子邮箱"
          description="support@petadoption.com"
          left={(props) => <List.Icon {...props} icon="email" />}
          onPress={() => Linking.openURL("mailto:support@petadoption.com")}
        />
        <Divider />
        <List.Item
          title="官方网站"
          description="www.petadoption.com"
          left={(props) => <List.Icon {...props} icon="web" />}
          onPress={() => Linking.openURL("https://www.petadoption.com")}
        />
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text style={styles.subtitle}>版本信息</Text>
        <Text style={styles.version}>当前版本：1.0.0</Text>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a237e",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  version: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default AboutScreen;
