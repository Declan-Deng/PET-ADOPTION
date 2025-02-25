import * as React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Text,
  Surface,
  List,
  Chip,
  Divider,
  ActivityIndicator,
  Button,
  Portal,
  Dialog,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ApplicationListScreen = ({ route, navigation }) => {
  const { petId, petName } = route.params;
  const [applications, setApplications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [approving, setApproving] = React.useState(false);
  const [selectedApplication, setSelectedApplication] = React.useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const fetchApplications = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("登录已过期");
      }

      const response = await fetch(
        `http://192.168.31.232:5001/api/adoptions/pet/${petId}`,
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
        return "申请中";
      case "approved":
        return "已通过";
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("登录已过期");
      }

      const response = await fetch(
        `http://192.168.31.232:5001/api/adoptions/${selectedApplication._id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("通过申请失败");
      }

      // 刷新申请列表
      await fetchApplications();
      setShowConfirmDialog(false);
      setSelectedApplication(null);

      // 显示成功提示
      Alert.alert("成功", "已通过该申请");
    } catch (error) {
      console.error("通过申请失败:", error);
      Alert.alert("错误", error.message || "通过申请失败，请重试");
    } finally {
      setApproving(false);
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

        {item.status === "active" && (
          <Button
            mode="contained"
            onPress={() => {
              setSelectedApplication(item);
              setShowConfirmDialog(true);
            }}
            style={styles.approveButton}
          >
            通过申请
          </Button>
        )}
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

      <Portal>
        <Dialog
          visible={showConfirmDialog}
          onDismiss={() => setShowConfirmDialog(false)}
        >
          <Dialog.Title>确认通过申请</Dialog.Title>
          <Dialog.Content>
            <Text>
              确定要通过{" "}
              {selectedApplication?.applicant?.profile?.name || "该用户"}{" "}
              的申请吗？ 通过后其他申请将自动被取消。
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>取消</Button>
            <Button
              mode="contained"
              onPress={handleApprove}
              loading={approving}
              disabled={approving}
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
  approveButton: {
    marginTop: 16,
  },
});

export default ApplicationListScreen;
