import * as React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Surface, List, Text, Chip, useTheme } from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyAdoptionsScreen = ({ navigation }) => {
  const { user } = React.useContext(UserContext);
  const [adoptions, setAdoptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const theme = useTheme();

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

      // 获取每个申请对应的完整宠物信息
      const adoptionsWithFullPetInfo = await Promise.all(
        data.map(async (adoption) => {
          try {
            const petResponse = await fetch(
              `http://192.168.3.74:5001/api/pets/${
                adoption.pet?._id || adoption.petId
              }`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (petResponse.ok) {
              const petData = await petResponse.json();
              return {
                ...adoption,
                pet: petData,
              };
            }
            return adoption;
          } catch (error) {
            console.error("获取宠物详情失败:", error);
            return adoption;
          }
        })
      );

      setAdoptions(adoptionsWithFullPetInfo);
    } catch (error) {
      console.error("获取申请记录失败:", error);
      Alert.alert("错误", error.message || "获取申请记录失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAdoptions();
  }, [fetchAdoptions]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAdoptions();
  }, [fetchAdoptions]);

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
        onPress={() =>
          navigation.navigate("PetDetail", {
            petId: item.pet?._id,
            pet: item.pet,
          })
        }
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

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={adoptions}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Text>暂无申请记录</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  itemContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
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
  statusChip: {
    alignSelf: "center",
  },
});

export default MyAdoptionsScreen;
