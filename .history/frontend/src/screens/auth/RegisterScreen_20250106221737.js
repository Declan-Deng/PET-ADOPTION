import * as React from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  HelperText,
  useTheme,
  IconButton,
  Snackbar,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../../context/UserContext";

const { width } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const { register } = React.useContext(UserContext);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [avatar, setAvatar] = React.useState(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [visible, setVisible] = React.useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!username) newErrors.username = "请输入用户名";
    if (!password) newErrors.password = "请输入密码";
    if (password.length < 6) newErrors.password = "密码长度至少6位";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "两次输入的密码不一致";
    if (!email) newErrors.email = "请输入邮箱";
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "请输入有效的邮箱地址";
    if (!phone) newErrors.phone = "请输入手机号";
    if (!/^1[3-9]\d{9}$/.test(phone)) newErrors.phone = "请输入有效的手机号";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 模拟注册API调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 这里应该是实际的注册API调用
      await register({
        username,
        password,
        email,
        phone,
        avatar,
      });

      setVisible(true);
      // 2秒后自动跳转到登录页面
      setTimeout(() => {
        navigation.navigate("Login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("注册失败", "请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("错误", "选择图片时出现错误，请重试");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>创建账号</Text>
          <Text style={styles.subtitle}>加入我们的宠物领养社区</Text>
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <IconButton icon="camera" size={30} onPress={pickImage} />
              </View>
            )}
            <Button
              mode="text"
              onPress={pickImage}
              style={styles.changeAvatarButton}
            >
              {avatar ? "更换头像" : "添加头像"}
            </Button>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            label="用户名"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            error={!!errors.username}
          />
          <HelperText type="error" visible={!!errors.username}>
            {errors.username}
          </HelperText>

          <TextInput
            label="邮箱"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            label="手机号"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            error={!!errors.phone}
          />
          <HelperText type="error" visible={!!errors.phone}>
            {errors.phone}
          </HelperText>

          <TextInput
            label="密码"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            error={!!errors.password}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>

          <TextInput
            label="确认密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            error={!!errors.confirmPassword}
          />
          <HelperText type="error" visible={!!errors.confirmPassword}>
            {errors.confirmPassword}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            注册
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={styles.linkButton}
          >
            已有账号？立即登录
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={visible}
        duration={2000}
        onDismiss={() => setVisible(false)}
        style={styles.snackbar}
      >
        注册成功！正在跳转到登录页面...
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  changeAvatarButton: {
    marginTop: 8,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
  snackbar: {
    backgroundColor: "#4CAF50",
  },
});

export default RegisterScreen;
