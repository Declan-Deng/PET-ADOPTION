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
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("提示", "请先登录");
        return;
      }

      const response = await fetch("http://192.168.3.74:5001/api/adoptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pet: petId,
          reason: reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "申请失败");
      }

      navigation.replace("AdoptionSuccess");
    } catch (error) {
      console.error("申请失败:", error);
      Alert.alert("申请失败", error.message || "请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

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
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>申请领养</Text>
        <Text style={styles.subtitle}>申请领养 的结结实实卡那你</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>申请人信息</Text>
          <View style={styles.infoItem}>
            <Text>姓名：{user?.profile?.name || "未设置"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text>电话：{user?.profile?.phone || "未设置"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text>地址：{user?.profile?.address || "未设置"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>申请理由</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="请输入申请理由"
          />
          <Text style={styles.counter}>{reason.length}/500字</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={submitting}
          disabled={submitting || !reason.trim()}
        >
          提交申请
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoItem: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 4,
  },
  counter: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
  },
});

export default AdoptionFormScreen;
