import * as React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  IconButton,
  Button,
  Portal,
  Dialog,
  ActivityIndicator,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const AdoptionItem = React.memo(({ item, onPress, onCancelPress }) => {
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

  const colors = getStatusColor(item.status);

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemLeft}>
          <MaterialCommunityIcons
            name={item.pet?.type === "cat" ? "cat" : "dog"}
            size={24}
            color="#666"
            style={styles.icon}
          />
          <View>
            <Text style={styles.petName}>
              {item.pet?.petName || "未知宠物"}
            </Text>
            <Text style={styles.dateText}>
              申请日期: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.reasonTitle}>申请理由：</Text>
        <Text style={styles.reasonText}>{item.reason || "无"}</Text>
        {item.reviewNotes && (
          <>
            <Text style={styles.reasonTitle}>审核备注：</Text>
            <Text style={styles.reasonText}>{item.reviewNotes}</Text>
          </>
        )}
        {item.status === "active" && (
          <Button
            mode="outlined"
            onPress={onCancelPress}
            style={styles.cancelButton}
            color="#d32f2f"
          >
            取消申请
          </Button>
        )}
      </View>
    </TouchableOpacity>
  );
});

const MyAdoptionsScreen = ({ navigation }) => {
  const { user, cancelAdoption } = React.useContext(UserContext);
  const [adoptions, setAdoptions] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [selectedAdoption, setSelectedAdoption] = React.useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  const fetchAdoptions = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("登录已过期");
      }

      const response = await fetch("http://192.168.31.232:5001/api/adoptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取申请记录失败");
      }

      const { data } = await response.json();
      console.log("获取到的领养记录:", data);
      setAdoptions(data || []);
    } catch (error) {
      console.error("获取申请记录失败:", error);
      Alert.alert("错误", "获取申请记录失败，请重试");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchAdoptions();
  }, [fetchAdoptions]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAdoptions();
  }, [fetchAdoptions]);

  const handleCancelAdoption = async () => {
    if (!selectedAdoption) return;

    try {
      setCancelling(true);
      await cancelAdoption(selectedAdoption._id);
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

  const renderItem = ({ item }) => {
    if (!item) return null;

    return (
      <AdoptionItem
        item={item}
        onPress={() => {
          if (item.pet?._id) {
            navigation.navigate("PetDetail", {
              petId: item.pet._id,
              pet: item.pet,
              adoption: item,
            });
          }
        }}
        onCancelPress={() => {
          setSelectedAdoption(item);
          setShowConfirmDialog(true);
        }}
      />
    );
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>请先登录</Text>
      </View>
    );
  }

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
        data={adoptions}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item?._id?.toString() || Math.random().toString()
        }
        contentContainerStyle={[
          styles.listContent,
          adoptions.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  itemContainer: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
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
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 16,
    borderColor: "#d32f2f",
  },
});

export default MyAdoptionsScreen;
