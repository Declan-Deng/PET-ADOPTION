import * as React from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Text,
  Chip,
  List,
  Surface,
  ActivityIndicator,
  Appbar,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyPublicationsScreen = ({ navigation, route }) => {
  const { user } = React.useContext(UserContext);
  const [publications, setPublications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchPublications = React.useCallback(async () => {
    try {
      console.log("开始获取发布列表...");
      console.log("当前用户数据:", user);

      const userId = user?.id || user?._id;
      if (!user || !userId) {
        console.error("用户数据不完整");
        setError("用户数据不完整，请重新登录");
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("未找到用户令牌");
        setError("登录已过期，请重新登录");
        return;
      }

      console.log("当前用户ID:", userId);

      const response = await fetch("http://192.168.3.74:5001/api/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("获取到的数据:", data);

      if (response.ok) {
        // 只显示当前用户的发布
        const userPubs = data.filter((pub) => {
          if (!pub.owner || !(pub.owner._id || pub.owner.id)) {
            console.log("跳过无效的发布数据:", pub);
            return false;
          }
          const ownerId = pub.owner._id || pub.owner.id;
          console.log("比较:", ownerId, userId);
          return ownerId.toString() === userId.toString();
        });
        console.log("过滤后的用户发布:", userPubs);
        setPublications(userPubs);
        setError(null);
      } else {
        console.error("获取发布列表失败:", data.message);
        setError(data.message || "获取发布列表失败");
      }
    } catch (error) {
      console.error("获取发布列表失败:", error);
      setError("获取发布列表失败，请检查网络连接");
    }
  }, [user]);

  // 首次加载和用户变化时获取数据
  React.useEffect(() => {
    if (user) {
      setLoading(true);
      fetchPublications().finally(() => setLoading(false));
    }
  }, [user, fetchPublications]);

  // 监听路由参数变化，用于发布成功后刷新列表
  React.useEffect(() => {
    if (route.params?.refresh) {
      fetchPublications();
      // 清除刷新标记
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh, fetchPublications, navigation]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPublications();
    setRefreshing(false);
  }, [fetchPublications]);

  const renderItem = ({ item }) => (
    <Surface style={styles.itemContainer} elevation={1}>
      <List.Item
        title={item.petName}
        description={`发布日期: ${new Date(
          item.createdAt
        ).toLocaleDateString()}`}
        left={(props) => (
          <List.Icon {...props} icon={item.type === "cat" ? "cat" : "dog"} />
        )}
        right={(props) => (
          <View style={styles.rightContent}>
            <Text style={styles.applicants}>{item.applicants || 0} 人申请</Text>
          </View>
        )}
        onPress={() =>
          navigation.navigate("PetDetail", {
            petId: item._id,
            pet: item,
          })
        }
      />
    </Surface>
  );

  const renderContent = () => {
    if (!user) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.messageText}>请先登录</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={publications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.list,
          publications.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.messageText}>暂无发布记录</Text>
          </View>
        }
      />
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "我的发布",
      headerLeft: () => (
        <Appbar.BackAction onPress={() => navigation.navigate("Profile")} />
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  itemContainer: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  rightContent: {
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 48,
  },
  applicants: {
    fontSize: 14,
    color: "#666",
  },
  messageText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#B00020",
    textAlign: "center",
  },
});

export default MyPublicationsScreen;
