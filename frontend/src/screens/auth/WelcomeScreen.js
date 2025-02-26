import * as React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import { Button, Text } from "react-native-paper";
import AnimatedEmoji from "../../components/AnimatedEmoji";

const { width } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.imageContainer}>
        <AnimatedEmoji />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>欢迎来到宠物领养</Text>
        <Text style={styles.subtitle}>
          在这里，每一个生命都值得被关爱， 每一个家庭都能找到最适合的伙伴
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Register")}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            立即注册
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate("Login")}
            style={[styles.button, styles.loginButton]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.loginButtonLabel}
          >
            已有账号？登录
          </Button>
        </View>

        <Text style={styles.terms}>
          注册即表示同意我们的
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Terms")}
          >
            服务条款
          </Text>
          和
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Privacy")}
          >
            隐私政策
          </Text>
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 24,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a237e",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    borderColor: "#1a237e",
  },
  loginButtonLabel: {
    fontSize: 16,
    color: "#1a237e",
  },
  terms: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  link: {
    color: "#1a237e",
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;
