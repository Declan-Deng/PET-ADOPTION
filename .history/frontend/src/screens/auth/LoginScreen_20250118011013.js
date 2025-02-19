import * as React from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  useTheme,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";

const { width } = Dimensions.get("window");

// 表单状态管理
const initialState = {
  username: "",
  password: "",
  showPassword: false,
  error: "",
  loading: false,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
        error: "",
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case "START_LOADING":
      return {
        ...state,
        loading: true,
        error: "",
      };
    case "STOP_LOADING":
      return {
        ...state,
        loading: false,
      };
    case "TOGGLE_PASSWORD":
      return {
        ...state,
        showPassword: !state.showPassword,
      };
    default:
      return state;
  }
};

// 自定义Hook处理图片预加载
const useImagePreload = (imageUri) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        await Image.prefetch(imageUri);
        setImageLoaded(true);
      } catch (error) {
        console.error("Image preload failed:", error);
        setImageLoaded(true); // 即使加载失败也显示UI
      }
    };
    loadImage();
  }, [imageUri]);

  return imageLoaded;
};

// API_URL常量
const API_URL = "http://192.168.3.74:5001/api";

// 自定义Hook处理登录逻辑
const useLogin = () => {
  const { login } = React.useContext(UserContext);

  const handleLogin = async (username, password) => {
    if (!username || !password) {
      throw new Error("请输入用户名和密码");
    }

    if (password.length < 6) {
      throw new Error("密码长度至少为6位");
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "登录失败");
      }

      await login(data);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "登录失败，请稍后重试");
    }
  };

  return handleLogin;
};

const LoginScreen = ({ navigation }) => {
  const [state, dispatch] = React.useReducer(formReducer, initialState);
  const theme = useTheme();
  const handleLogin = useLogin();

  const LOGO_URI =
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80";
  const imageLoaded = useImagePreload(LOGO_URI);

  const onLogin = async () => {
    dispatch({ type: "START_LOADING" });
    try {
      await handleLogin(state.username, state.password);
    } catch (error) {
      dispatch({ type: "SET_ERROR", error: error.message });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {!imageLoaded ? (
            <View style={styles.logoPlaceholder}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <Image source={{ uri: LOGO_URI }} style={styles.logo} />
          )}
        </View>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>登录您的账号继续</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="用户名"
          value={state.username}
          onChangeText={(text) =>
            dispatch({ type: "SET_FIELD", field: "username", value: text })
          }
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          disabled={state.loading}
        />

        <TextInput
          label="密码"
          value={state.password}
          onChangeText={(text) =>
            dispatch({ type: "SET_FIELD", field: "password", value: text })
          }
          mode="outlined"
          style={styles.input}
          secureTextEntry={!state.showPassword}
          disabled={state.loading}
          right={
            <TextInput.Icon
              icon={state.showPassword ? "eye-off" : "eye"}
              onPress={() => dispatch({ type: "TOGGLE_PASSWORD" })}
            />
          }
        />

        <HelperText type="error" visible={!!state.error}>
          {state.error}
        </HelperText>

        <Button
          mode="contained"
          onPress={onLogin}
          style={styles.button}
          loading={state.loading}
          disabled={state.loading}
        >
          登录
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate("Register")}
          style={styles.registerButton}
          disabled={state.loading}
        >
          还没有账号？立即注册
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    alignSelf: "center",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 6,
  },
  registerButton: {
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
