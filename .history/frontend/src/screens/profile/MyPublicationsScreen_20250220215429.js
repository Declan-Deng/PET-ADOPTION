import * as React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Card,
  Title,
  Text,
  Chip,
  List,
  Surface,
  ActivityIndicator,
  Appbar,
  Portal,
  Dialog,
  Button,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyPublicationsScreen = ({ navigation, route }) => {
  const { user } = React.useContext(UserContext);
  const [publications, setPublications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [selectedPet, setSelectedPet] = React.useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "获取发布列表失败");
      }

      const data = await response.json();
      console.log("获取到的数据:", data);

      if (!Array.isArray(data)) {
        console.error("服务器返回的数据格式错误");
        throw new Error("数据格式错误");
      }

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
    } catch (error) {
      console.error("获取发布列表失败:", error);
      setError(error.message || "获取发布列表失败，请检查网络连接");
      setPublications([]); // 清空列表
    }
  }, [user]);

  const handleCancelPublication = async () => {
    if (!selectedPet) return;

    try {
      setCancelling(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("登录已过期，请重新登录");
      }

      console.log("开始取消发布:", selectedPet._id);
      const response = await fetch(
        `http://192.168.3.74:5001/api/pets/${selectedPet._id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("取消发布响应:", data);

      if (!response.ok) {
        throw new Error(data.message || "取消发布失败");
      }

      // 从列表中移除已取消的发布
      setPublications((prev) =>
        prev.filter((pub) => pub._id !== selectedPet._id)
      );
      Alert.alert("成功", "已取消发布");
    } catch (error) {
      console.error("取消发布失败:", error);
      Alert.alert("错误", error.message || "取消发布失败，请重试");
    } finally {
      setCancelling(false);
      setShowConfirmDialog(false);
      setSelectedPet(null);
    }
  };

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
            <Chip
              mode="outlined"
              onPress={() => {
                if (item.applicants > 0) {
                  navigation.navigate("ApplicationList", {
                    petId: item._id,
                    petName: item.petName,
                  });
                }
              }}
              style={[
                styles.applicantChip,
                item.applicants === 0 && styles.disabledChip,
              ]}
            >
              {item.applicants || 0} 人申请
            </Chip>
            <Button
              mode="text"
              textColor="red"
              onPress={() => {
                setSelectedPet(item);
                setShowConfirmDialog(true);
              }}
              disabled={item.applicants > 0}
            >
              取消发布
            </Button>
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

      <Portal>
        <Dialog
          visible={showConfirmDialog}
          onDismiss={() => {
            setShowConfirmDialog(false);
            setSelectedPet(null);
          }}
        >
          <Dialog.Title>确认取消发布</Dialog.Title>
          <Dialog.Content>
            <Text>
              确定要取消发布 {selectedPet?.petName || "该宠物"}
              吗？取消后将无法恢复。
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowConfirmDialog(false);
                setSelectedPet(null);
              }}
            >
              取消
            </Button>
            <Button
              mode="contained"
              onPress={handleCancelPublication}
              loading={cancelling}
              disabled={cancelling}
            >
              确定
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  applicantChip: {
    marginVertical: 4,
  },
  disabledChip: {
    opacity: 0.5,
  },
});

export default MyPublicationsScreen;
