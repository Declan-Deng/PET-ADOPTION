import * as React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { Text } from "react-native-paper";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ onFinish }) => {
  const logoScale = React.useRef(new Animated.Value(0)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // 动画序列
    Animated.sequence([
      // Logo缩放和淡入
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // 文字淡入
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 延迟后调用完成回调
      setTimeout(() => {
        onFinish?.();
      }, 500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>🐱</Text>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.title}>宠物领养</Text>
        <Text style={styles.subtitle}>让爱找到归宿</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a237e",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default SplashScreen;
