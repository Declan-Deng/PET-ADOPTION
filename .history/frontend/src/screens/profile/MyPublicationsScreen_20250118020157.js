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
      const response = await fetch("http://192.168.3.74:5001/api/pets", {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        // 只显示当前用户的发布
        const userPubs = data.data.filter((pub) => pub.owner._id === user._id);
        setPublications(userPubs);
        setError(null);
      } else {
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

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>请先登录</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    item.status === "已通过" ? "#E8F5E9" : "#FFF3E0",
                },
              ]}
            >
              {item.status}
            </Chip>
            <Text style={styles.applicants}>{item.applicants || 0}人申请</Text>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={publications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无发布记录</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  itemContainer: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  rightContent: {
    alignItems: "flex-end",
  },
  statusChip: {
    marginBottom: 4,
  },
  applicants: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#666",
  },
  errorText: {
    color: "#B00020",
  },
});

export default MyPublicationsScreen;
