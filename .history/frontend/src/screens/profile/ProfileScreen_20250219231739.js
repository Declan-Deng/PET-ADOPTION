import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Avatar,
  Text,
  Card,
  Button,
  List,
  Divider,
  Surface,
  useTheme,
  Title,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Image from "react-native/Libraries/Image/Image";

const ProfileScreen = ({ navigation }) => {
  const { user, logout, setUser } = React.useContext(UserContext);
  const { profile, adoptions = [], publications = [] } = user || {};
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [avatarKey, setAvatarKey] = React.useState(0);

  // 刷新用户数据
  const refreshUserData = React.useCallback(async () => {
    try {
      setRefreshing(true);
      console.log("开始刷新用户数据...");

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log("未找到用户令牌");
        throw new Error("未找到用户令牌");
      }
      console.log("成功获取到用户令牌:", token.substring(0, 10) + "...");

      // 发起网络请求
      console.log("开始请求用户数据...");
      const response = await fetch("http://192.168.3.74:5001/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("服务器响应状态:", response.status);

      if (!response.ok) {
        throw new Error(`服务器响应错误: ${response.status}`);
      }

      const userData = await response.json();
      console.log("获取到的用户数据:", userData);

      // 确保数据格式正确
      const formattedUserData = {
        ...userData,
        profile: userData.profile || {
          name: userData.username,
          email: userData.email,
          phone: userData.phone,
          address: "",
          avatar: null,
        },
      };

      // 更新本地存储
      await AsyncStorage.setItem("userData", JSON.stringify(formattedUserData));
      console.log("已更新本地存储的用户数据");

      // 更新Context
      setUser(formattedUserData);
      console.log("已更新Context中的用户数据");

      // 强制刷新头像
      setAvatarKey((prev) => prev + 1);
      console.log("已触发头像刷新");
    } catch (error) {
      console.error("刷新用户数据失败:", error.message);

      // 尝试从本地获取数据
      try {
        const localUserData = await AsyncStorage.getItem("userData");
        if (localUserData) {
          const parsedData = JSON.parse(localUserData);
          setUser(parsedData);
          Alert.alert("提示", "使用本地缓存数据");
        }
      } catch (e) {
        console.error("读取本地数据失败:", e);
        Alert.alert("错误", "获取用户数据失败");
      }
    } finally {
      setRefreshing(false);
    }
  }, [setUser, setAvatarKey]);

  // 组件加载时刷新一次数据
  React.useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const getInitials = (name) => {
    return (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const stats = [
    {
      label: "发布",
      value: user?.publications?.length || 0,
      color: theme.colors.primary,
    },
    {
      label: "申请",
      value: user?.adoptions?.length || 0,
      color: theme.colors.secondary,
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      "退出登录",
      "确定要退出登录吗？",
      [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "确定",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert("错误", "退出登录失败，请重试");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshUserData}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Surface style={styles.header} elevation={2}>
        <View style={styles.avatarContainer}>
          {profile?.avatar ? (
            <Avatar.Image
              key={avatarKey}
              size={80}
              source={{
                uri: `${profile.avatar}?t=${new Date().getTime()}`,
                headers: {
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                  Pragma: "no-cache",
                  Expires: "0",
                },
              }}
              style={styles.avatar}
              onError={(e) => {
                console.log("头像加载失败，详细信息：", {
                  url: profile.avatar,
                  error: e.nativeEvent.error,
                  timestamp: new Date().toISOString(),
                });

                // 检查网络连接并尝试预加载图片
                Image.prefetch(profile.avatar)
                  .then(() => {
                    console.log("头像预加载成功");
                    setAvatarKey((prev) => prev + 1);
                  })
                  .catch((error) => {
                    console.log("头像预加载失败：", error);
                    if (!profile.avatar.startsWith("file://")) {
                      Alert.alert(
                        "头像加载失败",
                        "请检查网络连接或重新上传头像",
                        [
                          {
                            text: "重试",
                            onPress: refreshUserData,
                          },
                          {
                            text: "确定",
                            onPress: () => {
                              setUser({
                                ...user,
                                profile: {
                                  ...user.profile,
                                  avatar: null,
                                },
                              });
                            },
                          },
                        ]
                      );
                    }
                  });
              }}
            />
          ) : (
            <Avatar.Text
              size={80}
              label={getInitials(profile?.name)}
              style={styles.avatar}
            />
          )}
          <Text style={styles.name}>{profile?.name || "未设置昵称"}</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </Surface>

      <Card style={styles.infoCard}>
        <Card.Content>
          <List.Item
            title="联系电话"
            description={profile?.phone || "未设置"}
            left={(props) => <List.Icon {...props} icon="phone" />}
          />
          <Divider />
          <List.Item
            title="电子邮箱"
            description={profile?.email || "未设置"}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="居住地址"
            description={profile?.address || "未设置"}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
          />
          {!profile?.address && (
            <View style={styles.addressWarning}>
              <Text style={styles.warningText}>
                请设置您的居住地址，这对于宠物领养审核很重要
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("EditProfile")}
                style={styles.warningButton}
                labelStyle={styles.warningButtonLabel}
                color="#f44336"
              >
                立即设置
              </Button>
            </View>
          )}
          <View style={{ height: 16 }} />
          <Button
            mode="outlined"
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.editButton}
          >
            编辑777资料
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <List.Item
            title="我的发布"
            left={(props) => <List.Icon {...props} icon="paw" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              if (user) {
                navigation.navigate("MyPublications");
              } else {
                Alert.alert("提示", "请先登录");
              }
            }}
          />
          <Divider />
          <List.Item
            title="申请记录"
            left={(props) => <List.Icon {...props} icon="clipboard-list" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              if (user) {
                navigation.navigate("MyAdoptions");
              } else {
                Alert.alert("提示", "请先登录");
              }
            }}
          />
          <Divider />
          <List.Item
            title="关于我们"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              navigation.navigate("About");
            }}
          />
          <Divider />
          <List.Item
            title="退出登录"
            titleStyle={{ color: theme.colors.error }}
            left={(props) => (
              <List.Icon {...props} icon="logout" color={theme.colors.error} />
            )}
            onPress={handleLogout}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  editButton: {
    marginBottom: 16,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  addressWarning: {
    backgroundColor: "#fff3e0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  warningButton: {
    marginTop: 8,
  },
  warningButtonLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
