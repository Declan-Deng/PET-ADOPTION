import * as React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { TextInput, Button, Surface, Text } from "react-native-paper";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdoptionFormScreen = ({ route, navigation }) => {
  const { petName, petId } = route.params;
  const { user, loading, addAdoption } = React.useContext(UserContext);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const validateReason = () => {
    if (reason.trim().length < 20) {
      setError("申请理由至少需要20个字");
      return false;
    }
    if (reason.trim().length > 500) {
      setError("申请理由不能超过500个字");
      return false;
    }
    return true;
  };

  const checkUserProfile = () => {
    if (
      !user?.profile?.name ||
      !user?.profile?.phone ||
      !user?.profile?.address
    ) {
      Alert.alert("提示", "请先完善个人信息后再申请领养", [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "去完善",
          onPress: () => {
            navigation.navigate("Main", {
              screen: "ProfileTab",
              params: {
                screen: "Profile",
                params: {
                  message: "请先完善个人信息后再申请领养",
                },
              },
            });
          },
        },
      ]);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const adoptionData = {
        pet: petId,
        reason: reason,
        experience: "",
        livingCondition: "",
      };

      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch("http://192.168.3.74:5001/api/adoptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adoptionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "申请失败");
      }

      Alert.alert("申请成功", "您的申请已提交", [
        {
          text: "确定",
          onPress: () => navigation.navigate("MyAdoptions"),
        },
      ]);
    } catch (error) {
      console.error("申请失败:", error);
      Alert.alert("申请失败", error.message || "请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  // 如果用户未登录，显示错误信息
  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>请先登录后再申请领养</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Auth")}
          style={styles.button}
        >
          去登录
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="titleLarge" style={styles.title}>
          申请领养 {petName}
        </Text>

        <View style={styles.infoSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            申请人信息
          </Text>
          <Text style={styles.infoText}>
            姓名：{user?.profile?.name || "未设置"}
          </Text>
          <Text style={styles.infoText}>
            电话：{user?.profile?.phone || "未设置"}
          </Text>
          <Text style={styles.infoText}>
            地址：{user?.profile?.address || "未设置"}
          </Text>
        </View>

        <TextInput
          label="申请理由"
          value={reason}
          onChangeText={(text) => {
            setReason(text);
            setError("");
          }}
          multiline
          numberOfLines={6}
          style={styles.input}
          placeholder="请详细说明您想领养的原因，以及能为宠物提供的生活条件（至少20字）"
          error={!!error}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        <Text style={styles.wordCount}>{reason.trim().length}/500字</Text>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={submitting}
          disabled={!reason.trim() || submitting}
        >
          {submitting ? "提交中..." : "提交申请"}
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  surface: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  infoSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    color: "#1a237e",
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  errorText: {
    color: "#B00020",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  wordCount: {
    textAlign: "right",
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
});

export default AdoptionFormScreen;
