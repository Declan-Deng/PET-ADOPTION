import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Surface, Icon } from "react-native-paper";

const PublishSuccessScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Icon source="check-circle" size={80} color="#4CAF50" />
        <Text variant="headlineSmall" style={styles.title}>
          发布成功！
        </Text>
        <Text variant="bodyLarge" style={styles.message}>
          您的宠物信息已成功发布，请在个人中心查看发布状态
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("ProfileTab")}
            style={styles.button}
          >
            查看发布
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("Publish")}
            style={styles.button}
          >
            继续发布
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  surface: {
    padding: 24,
    alignItems: "center",
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    color: "#4CAF50",
  },
  message: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    width: "100%",
  },
});

export default PublishSuccessScreen;
