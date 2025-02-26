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
  Button,
  Portal,
  Dialog,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appbar } from "react-native-paper";
import { API_ENDPOINTS } from "../../config";

const MyAdoptionsScreen = ({ navigation }) => {
  const { user, cancelAdoption } = React.useContext(UserContext);
  const [adoptions, setAdoptions] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [selectedAdoption, setSelectedAdoption] = React.useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  const fetchAdoptions = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("登录已过期");
      }

      const response = await fetch(API_ENDPOINTS.ADOPTIONS, {
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchAdoptions();
    }
  }, [user]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAdoptions();
  }, []);

  // 添加 useLayoutEffect 来设置导航栏
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Appbar.BackAction onPress={() => navigation.navigate("Profile")} />
      ),
    });
  }, [navigation]);

  const handleCancelAdoption = async () => {
    if (!selectedAdoption) return;

    try {
      setCancelling(true);
      await cancelAdoption(selectedAdoption._id);

      // 更新本地数据
      setAdoptions((prev) =>
        prev.map((adoption) =>
          adoption._id === selectedAdoption._id
            ? { ...adoption, status: "cancelled" }
            : adoption
        )
      );

      Alert.alert("成功", "已取消申请");
    } catch (error) {
      console.error("取消申请失败:", error);
      Alert.alert("错误", error.message || "取消申请失败，请重试");
    } finally {
      setCancelling(false);
      setShowConfirmDialog(false);
      setSelectedAdoption(null);
    }
  };

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
      case "active":
      case "pending":
        return { bg: "#E8F5E9", text: "#2E7D32" };
      case "approved":
        return { bg: "#E3F2FD", text: "#1565C0" };
      case "cancelled":
        return { bg: "#FFEBEE", text: "#C62828" };
      default:
        return { bg: "#F5F5F5", text: "#757575" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
      case "pending":
        return "申请中";
      case "approved":
        return "已通过";
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
        onPress={() => {
          navigation.navigate("PetDetail", {
            petId: item.pet?._id,
            pet: item.pet,
            adoption: item,
          });
        }}
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
        {item.status === "active" && (
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedAdoption(item);
              setShowConfirmDialog(true);
            }}
            style={styles.cancelButton}
            color="#d32f2f"
          >
            取消申请
          </Button>
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

      <Portal>
        <Dialog
          visible={showConfirmDialog}
          onDismiss={() => {
            setShowConfirmDialog(false);
            setSelectedAdoption(null);
          }}
        >
          <Dialog.Title>确认取消申请</Dialog.Title>
          <Dialog.Content>
            <Text>
              确定要取消申请 {selectedAdoption?.pet?.petName || "该宠物"}
              吗？取消后将无法恢复。
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowConfirmDialog(false);
                setSelectedAdoption(null);
              }}
            >
              取消
            </Button>
            <Button
              mode="contained"
              onPress={handleCancelAdoption}
              loading={cancelling}
              disabled={cancelling}
              color="#d32f2f"
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
  cancelButton: {
    marginTop: 16,
    borderColor: "#d32f2f",
  },
});

export default MyAdoptionsScreen;
