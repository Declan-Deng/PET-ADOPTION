import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  TextInput,
  IconButton,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const AdoptionFormScreen = ({ navigation, route }) => {
  const { user, loading } = React.useContext(UserContext);
  const [isReady, setIsReady] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [livingCondition, setLivingCondition] = React.useState("");
  const [error, setError] = React.useState("");
  const [petId, setPetId] = React.useState("");

  // 重置表单状态
  const resetForm = React.useCallback(() => {
    setReason("");
    setExperience("");
    setLivingCondition("");
    setError("");
    setSubmitting(false);
  }, []);

  // 增强的日志调试
  React.useEffect(() => {
    console.log("=== AdoptionFormScreen Debug ===");
    console.log("Loading state:", loading);
    console.log("User data:", user);
    console.log("User profile:", user?.profile);
    console.log("Route params:", route.params);
    console.log("==============================");

    if (route.params?.petId) {
      setPetId(route.params.petId);
    }

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

  const validateForm = () => {
    if (!reason.trim()) {
      setError("请填写申请理由");
      return false;
    }
    if (!experience.trim()) {
      setError("请填写养宠经验");
      return false;
    }
    if (!livingCondition.trim()) {
      setError("请填写居住条件");
      return false;
    }
    return true;
  };

  const checkUserProfile = () => {
    if (!user.profile.phone) {
      Alert.alert("提示", "请先完善个人资料中的联系电话");
      navigation.navigate("Profile", { screen: "EditProfile" });
      return false;
    }
    if (!user.profile.address) {
      Alert.alert("提示", "请先完善个人资料中的居住地址");
      navigation.navigate("Profile", { screen: "EditProfile" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      if (!checkUserProfile()) {
        return;
      }

      setSubmitting(true);
      console.log("开始提交申请...");

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("未找到用户Token");
        Alert.alert("提示", "登录已过期，请重新登录");
        navigation.replace("Auth", { screen: "Login" });
        return;
      }

      console.log("用户Token:", token ? "存在" : "不存在");
      console.log("提交的宠物ID:", route.params.petId);
      console.log("当前用户ID:", user._id);

      const adoptionData = {
        pet: route.params.petId,
        reason: reason.trim(),
        experience: experience.trim(),
        livingCondition: livingCondition.trim(),
      };

      console.log("申请数据:", adoptionData);

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
        if (response.status === 401) {
          Alert.alert("提示", "登录已过期，请重新登录");
          navigation.replace("Auth", { screen: "Login" });
          return;
        }
        if (response.status === 404) {
          Alert.alert("提示", "该宠物不存在或已被领养");
          navigation.goBack();
          return;
        }
        if (response.status === 400) {
          Alert.alert("提示", data.message || "申请失败，请检查填写的信息");
          return;
        }
        throw new Error(data.message || "申请失败，请稍后重试");
      }

      // 提交成功后重置表单
      resetForm();

      // 显示成功提示并导航
      Alert.alert(
        "提交成功",
        "您的申请已提交，请等待审核",
        [
          {
            text: "查看申请记录",
            onPress: () => {
              navigation.navigate("Profile", {
                screen: "MyAdoptions",
                params: { refresh: true },
              });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("提交申请失败:", error);
      Alert.alert("错误", error.message || "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={{ flex: 1 }}>
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

              <View style={styles.inputContainer}>
                <TextInput
                  label="申请理由"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                  placeholder="请详细说明您想领养的原因（至少20字）"
                />
                <Text style={styles.wordCount}>{reason.trim().length}/20</Text>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="养宠经验"
                  value={experience}
                  onChangeText={setExperience}
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                  placeholder="请描述您之前的养宠经验"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="居住条件"
                  value={livingCondition}
                  onChangeText={setLivingCondition}
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                  placeholder="请描述您的居住环境和条件"
                />
              </View>
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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  wordCount: {
    position: "absolute",
    right: 8,
    bottom: -20,
    fontSize: 12,
    color: "#666",
  },
  input: {
    marginBottom: 24,
    backgroundColor: "#fff",
  },
});

export default AdoptionFormScreen;
