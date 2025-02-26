import * as React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const EMOJIS = ["🐱", "🐶", "🐰", "🐹", "🦜", "🐠"];
const EMOJI_SIZE = 120;

const AnimatedEmoji = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scaleAnim = React.useRef(new Animated.Value(0.3)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const interval = setInterval(() => {
      // 重置动画值
      scaleAnim.setValue(0.3);
      rotateAnim.setValue(0);

      // 开始新的动画
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // 更新emoji
      setCurrentIndex((prev) => (prev + 1) % EMOJIS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-20deg", "0deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.emoji,
          {
            transform: [{ scale: scaleAnim }, { rotate }],
          },
        ]}
      >
        {EMOJIS[currentIndex]}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    height: EMOJI_SIZE,
  },
  emoji: {
    fontSize: EMOJI_SIZE,
  },
});

export default AnimatedEmoji;
