import * as React from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Text,
  Surface,
  List,
  Chip,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ApplicationListScreen = ({ route, navigation }) => {
  const { petId, petName } = route.params;
  const [applications, setApplications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchApplications = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("登录已过期");
      }

      const response = await fetch(
        `http://192.168.3.74:5001/api/adoptions/pet/${petId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("获取申请列表失败");
      }

      const { data } = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("获取申请列表失败:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petId]);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, [fetchApplications]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { bg: "#E8F5E9", text: "#2E7D32" };
      case "cancelled":
        return { bg: "#FFEBEE", text: "#C62828" };
      default:
        return { bg: "#F5F5F5", text: "#757575" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "申请中";
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.itemContainer} elevation={1}>
      <List.Item
        title={item.applicant?.profile?.name || "未知用户"}
        description={`申请时间: ${new Date(
          item.createdAt
        ).toLocaleDateString()}`}
        left={(props) => <List.Icon {...props} icon="account" />}
        right={(props) => (
          <Chip
            mode="flat"
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(item.status).bg },
            ]}
            textStyle={{ color: getStatusColor(item.status).text }}
          >
            {getStatusText(item.status)}
          </Chip>
        )}
      />
      <Divider />
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>申请人信息</Text>
        <Text style={styles.infoText}>
          联系电话: {item.applicant?.profile?.phone || "未设置"}
        </Text>
        <Text style={styles.infoText}>
          居住地址: {item.applicant?.profile?.address || "未设置"}
        </Text>

        <Text style={styles.sectionTitle}>申请详情</Text>
        <Text style={styles.label}>申请理由:</Text>
        <Text style={styles.content}>{item.reason}</Text>

        <Text style={styles.label}>养宠经验:</Text>
        <Text style={styles.content}>{item.experience}</Text>

        <Text style={styles.label}>居住条件:</Text>
        <Text style={styles.content}>{item.livingCondition}</Text>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无申请记录</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  itemContainer: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  statusChip: {
    marginVertical: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
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
});

export default ApplicationListScreen;
