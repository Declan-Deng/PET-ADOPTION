import * as React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { Card, Title, Text, Chip, List, Surface } from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyAdoptionsScreen = ({ navigation }) => {
  const { user } = React.useContext(UserContext);
  const [refreshing, setRefreshing] = React.useState(false);
  const [adoptions, setAdoptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // 获取申请记录
  const fetchAdoptions = React.useCallback(async () => {
    try {
      setLoading(true);
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
      setAdoptions(data);
    } catch (error) {
      console.error("获取申请记录失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理导航到宠物详情
  const handlePetPress = async (item) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("未找到用户令牌");
      }

      // 获取完整的宠物信息
      const response = await fetch(
        `http://192.168.3.74:5001/api/pets/${item.pet._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("获取宠物信息失败");
      }

      const petData = await response.json();

      // 导航到宠物详情页，传递完整的宠物信息和申请信息
      navigation.navigate("PetDetail", {
        petId: item.pet._id,
        pet: {
          ...petData,
          // 确保申请相关信息也被传递
          adoption: {
            _id: item._id,
            status: item.status,
            date: item.createdAt,
            reason: item.reason,
          },
        },
      });
    } catch (error) {
      console.error("导航到宠物详情失败:", error);
      Alert.alert("错误", error.message || "获取宠物详情失败");
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAdoptions();
    setRefreshing(false);
  }, [fetchAdoptions]);

  React.useEffect(() => {
    fetchAdoptions();
  }, [fetchAdoptions]);

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>请先登录</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return { bg: "#FFF3E0", text: "#F57C00" };
      case "approved":
        return { bg: "#E8F5E9", text: "#2E7D32" };
      case "rejected":
        return { bg: "#FFEBEE", text: "#C62828" };
      default:
        return { bg: "#F5F5F5", text: "#757575" };
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
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.itemContainer} elevation={1}>
      <List.Item
        title={item.pet?.petName || "未知宠物"}
        description={`申请日期: ${new Date(
          item.createdAt
        ).toLocaleDateString()}`}
        left={(props) => (
          <List.Icon
            {...props}
            icon={item.pet?.type === "cat" ? "cat" : "dog"}
          />
        )}
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
        onPress={() => handlePetPress(item)}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.reasonTitle}>申请理由：</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
        {item.reviewNotes && (
          <>
            <Text style={styles.reasonTitle}>审核备注：</Text>
            <Text style={styles.reasonText}>{item.reviewNotes}</Text>
          </>
        )}
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={adoptions}
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
  list: {
    padding: 16,
  },
  itemContainer: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  statusChip: {
    marginVertical: 4,
  },
  detailsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginTop: 8,
  },
  reasonText: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
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

export default MyAdoptionsScreen;
