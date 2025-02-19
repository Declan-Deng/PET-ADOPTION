import * as React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Card,
  Title,
  Text,
  Chip,
  List,
  Surface,
  Divider,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyAdoptionsScreen = ({ navigation, route }) => {
  const { user } = React.useContext(UserContext);
  const [adoptions, setAdoptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchAdoptions = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("未找到用户令牌");
      }

      const response = await fetch("http://192.168.3.74:5001/api/adoptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取申请记录失败");
      }

      const { data } = await response.json();
      console.log("获取到的申请记录:", data);
      setAdoptions(data || []);
    } catch (error) {
      console.error("获取申请记录失败:", error);
      Alert.alert("错误", error.message || "获取申请记录失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 监听路由参数变化，用于处理刷新
  React.useEffect(() => {
    if (route.params?.refresh) {
      fetchAdoptions();
      // 清除刷新标记
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh, fetchAdoptions, navigation]);

  // 首次加载时获取数据
  React.useEffect(() => {
    fetchAdoptions();
  }, [fetchAdoptions]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAdoptions();
  }, [fetchAdoptions]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={adoptions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <View>
                  <Title>{item.pet?.petName || "未知宠物"}</Title>
                  <Text style={styles.date}>
                    申请时间: {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Chip mode="outlined" style={getStatusStyle(item.status)}>
                  {getStatusText(item.status)}
                </Chip>
              </View>
              <Divider style={styles.divider} />
              <List.Item
                title="申请理由"
                description={item.reason}
                left={(props) => <List.Icon {...props} icon="information" />}
              />
              <Divider />
              <List.Item
                title="养宠经验"
                description={item.experience}
                left={(props) => <List.Icon {...props} icon="paw" />}
              />
              <Divider />
              <List.Item
                title="居住条件"
                description={item.livingCondition}
                left={(props) => <List.Icon {...props} icon="home" />}
              />
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无申请记录</Text>
          </View>
        }
      />
    </View>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return styles.statusPending;
    case "approved":
      return styles.statusApproved;
    case "rejected":
      return styles.statusRejected;
    default:
      return styles.statusPending;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "待审核";
    case "approved":
      return "已通过";
    case "rejected":
      return "已拒绝";
    default:
      return "待审核";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  divider: {
    marginVertical: 8,
  },
  statusPending: {
    backgroundColor: "#fff3e0",
  },
  statusApproved: {
    backgroundColor: "#e8f5e9",
  },
  statusRejected: {
    backgroundColor: "#ffebee",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

export default MyAdoptionsScreen;
