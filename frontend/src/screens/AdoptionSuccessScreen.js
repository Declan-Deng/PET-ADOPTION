import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";

const AdoptionSuccessScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        申请提交成功！
      </Text>
      <Text variant="bodyLarge" style={styles.message}>
        我们会尽快审核您的申请，并通过电话联系您。
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("Home")}
        style={styles.button}
      >
        返回首页
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  message: {
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: 200,
  },
});

export default AdoptionSuccessScreen;
