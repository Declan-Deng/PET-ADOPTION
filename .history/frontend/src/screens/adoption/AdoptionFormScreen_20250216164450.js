import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, ActivityIndicator, TextInput } from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const AdoptionFormScreen = ({ navigation, route }) => {
  const { user, loading } = React.useContext(UserContext);
  const [isReady, setIsReady] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [petId, setPetId] = React.useState("");

  // 增强的日志调试
  React.useEffect(() => {
    console.log("=== AdoptionFormScreen Debug ===");
    console.log("Loading state:", loading);
    console.log("User data:", user);
    console.log("User profile:", user?.profile);
    console.log("Route params:", route.params);
    console.log("==============================");

    const checkUserAndInit = () => {
      if (!loading) {
        if (!user) {
          console.log("No user found, redirecting to login...");
          navigation.replace("Auth", { screen: "Login" });
          return false;
        }
        if (!user.profile) {
          console.log("No user profile found");
          return false;
        }
        console.log("User and profile verified, setting ready state");
        setIsReady(true);
        return true;
      }
      return false;
    };

    checkUserAndInit();
  }, [user, loading, navigation, route.params]);

  // 处理加载状态和数据验证
  if (loading || !isReady || !user || !user.profile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {loading ? "加载中..." : "验证用户信息..."}
        </Text>
      </View>
    );
  }

  // 处理无效的路由参数
  if (!route.params?.petId || !route.params?.petName) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>无效的宠物信息</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          返回
        </Button>
      </View>
    );
  }

  const validateReason = () => {
    if (!reason.trim()) {
      Alert.alert("提示", "请填写申请理由");
      return false;
    }
    if (reason.trim().length < 20) {
      Alert.alert("提示", "申请理由至少需要20个字");
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
      Alert.alert("提示", "请先完善个人信息");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateReason()) {
        return;
      }

      if (!checkUserProfile()) {
        return;
      }

      setSubmitting(true);
      console.log("开始提交申请...");
      console.log("申请数据:", {
        pet: petId,
        reason: reason.trim(),
      });

      const adoptionData = {
        pet: petId,
        reason: reason.trim(),
      };

      const token = await AsyncStorage.getItem("userToken");
      console.log("用户Token:", token ? "存在" : "不存在");

      const response = await fetch("http://192.168.3.74:5001/api/adoptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adoptionData),
      });

      const data = await response.json();
      console.log("服务器响应:", data);

      if (!response.ok) {
        console.error("提交失败:", data);
        throw new Error(data.message || "申请失败，请稍后重试");
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>领养申请</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.subtitle}>申请人信息</Text>
        <Text style={styles.infoText}>
          姓名: {user.profile.name || "未设置"}
        </Text>
        <Text style={styles.infoText}>
          电话: {user.profile.phone || "未设置"}
        </Text>
        <Text style={styles.infoText}>
          地址: {user.profile.address || "未设置"}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.subtitle}>申请领养</Text>
        <Text style={styles.infoText}>宠物: {route.params.petName}</Text>
        <TextInput
          label="申请理由"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          style={styles.input}
          placeholder="请详细说明您想领养的原因（至少20字）"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          disabled={submitting}
        >
          {submitting ? "提交中..." : "提交申请"}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  button: {
    width: 200,
  },
  input: {
    marginBottom: 16,
  },
});

export default AdoptionFormScreen;
