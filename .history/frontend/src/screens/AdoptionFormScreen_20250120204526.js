import * as React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  Surface,
  Text,
  Avatar,
  Divider,
  useTheme,
  IconButton,
} from "react-native-paper";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AdoptionFormScreen = ({ route, navigation }) => {
  const theme = useTheme();
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
      <Surface style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>申请领养</Text>
          <Text style={styles.subtitle}>{petName || "未知宠物"}</Text>
        </View>
        <IconButton
          icon="close"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        />
      </Surface>

      <View style={styles.content}>
        <Surface style={styles.card}>
          <View style={styles.userInfoSection}>
            {user?.profile?.avatar ? (
              <Avatar.Image
                size={60}
                source={{ uri: user.profile.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <MaterialCommunityIcons
                  name="account"
                  size={36}
                  color={theme.colors.primary}
                />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.profile?.name || "未设置"}
              </Text>
              <View style={styles.contactInfo}>
                <MaterialCommunityIcons
                  name="phone"
                  size={16}
                  color={theme.colors.primary}
                  style={styles.icon}
                />
                <Text style={styles.contactText}>
                  {user?.profile?.phone || "未设置"}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={theme.colors.primary}
                  style={styles.icon}
                />
                <Text style={styles.contactText}>
                  {user?.profile?.address || "未设置"}
                </Text>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>申请理由</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="请输入申请理由"
              mode="outlined"
              outlineColor={theme.colors.primary}
              activeOutlineColor={theme.colors.primary}
            />
            <Text style={styles.counter}>{reason.length}/500字</Text>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            loading={submitting}
            disabled={submitting || !reason.trim()}
          >
            提交申请
          </Button>
        </Surface>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    elevation: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  closeButton: {
    margin: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  userInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderAvatar: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  icon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
  },
  divider: {
    marginVertical: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  counter: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});

export default AdoptionFormScreen;
