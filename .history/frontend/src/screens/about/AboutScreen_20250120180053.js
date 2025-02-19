import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
} from "react-native";
import { Text, Card, useTheme, Button, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

const AboutScreen = () => {
  const theme = useTheme();

  const features = [
    {
      icon: "heart",
      title: "爱心领养",
      description: "为流浪动物提供一个温暖的家，让爱心传递下去",
    },
    {
      icon: "shield-check",
      title: "安全保障",
      description: "严格审核领养人资质，确保宠物找到合适的家庭",
    },
    {
      icon: "account-group",
      title: "社区互动",
      description: "建立爱心领养社区，分享养宠经验和温暖故事",
    },
    {
      icon: "paw",
      title: "宠物关爱",
      description: "提供专业的宠物护理建议和医疗资源对接",
    },
  ];

  const contactInfo = [
    {
      icon: "email",
      title: "邮箱联系",
      value: "support@petadoption.com",
      onPress: () => Linking.openURL("mailto:support@petadoption.com"),
    },
    {
      icon: "phone",
      title: "客服电话",
      value: "400-888-8888",
      onPress: () => Linking.openURL("tel:4008888888"),
    },
    {
      icon: "wechat",
      title: "微信公众号",
      value: "PetAdoption",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        entering={FadeInDown.delay(200)}
        style={styles.headerContainer}
      >
        <Avatar.Icon
          size={80}
          icon="paw"
          style={[styles.logo, { backgroundColor: theme.colors.primary }]}
        />
        <Text style={styles.title}>宠物领养平台</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.slogan}>让每一个生命都被温柔以待</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400)}
        style={styles.sectionContainer}
      >
        <Text style={styles.sectionTitle}>我们的特色</Text>
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              style={[styles.featureCard, { width: CARD_WIDTH / 2 - 12 }]}
            >
              <Card.Content style={styles.featureContent}>
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={32}
                  color={theme.colors.primary}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(600)}
        style={styles.sectionContainer}
      >
        <Text style={styles.sectionTitle}>联系我们</Text>
        <Card style={styles.contactCard}>
          <Card.Content>
            {contactInfo.map((contact, index) => (
              <React.Fragment key={contact.title}>
                <Button
                  icon={contact.icon}
                  mode="outlined"
                  onPress={contact.onPress}
                  style={styles.contactButton}
                  labelStyle={styles.contactButtonLabel}
                >
                  {contact.title}: {contact.value}
                </Button>
                {index < contactInfo.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(800)}
        style={[styles.sectionContainer, styles.lastSection]}
      >
        <Text style={styles.sectionTitle}>关于我们</Text>
        <Card style={styles.aboutCard}>
          <Card.Content>
            <Text style={styles.aboutText}>
              我们致力于为流浪动物提供一个温暖的家，通过专业的平台连接爱心人士与需要帮助的小动物。
              我们相信，每一个生命都值得被珍惜，每一份爱都值得被传递。
            </Text>
            <Text style={[styles.aboutText, { marginTop: 8 }]}>
              加入我们，一起为流浪动物创造更美好的未来。
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureContent: {
    alignItems: "center",
    padding: 16,
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactButton: {
    marginVertical: 4,
  },
  contactButtonLabel: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  aboutCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aboutText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
    textAlign: "justify",
  },
  lastSection: {
    paddingBottom: 32,
  },
});

export default AboutScreen;
