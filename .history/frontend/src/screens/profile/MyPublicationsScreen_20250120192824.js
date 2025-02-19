import * as React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
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
  Avatar,
  useTheme,
  Button,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const MyPublicationsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = React.useContext(UserContext);
  const [publications, setPublications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchPublications = React.useCallback(async () => {
    try {
      console.log("开始获取发布列表...");

      // 检查用户登录状态
      if (!user) {
        console.log("用户未登录");
        setError("请先登录");
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log("未找到用户令牌");
        setError("登录已过期，请重新登录");
        return;
      }

      console.log("发起API请求...");
      const response = await fetch("http://192.168.3.74:5001/api/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("API响应状态:", response.status);
      console.log("获取到的数据数量:", data.length);

      if (response.ok) {
        // 过滤出当前用户的发布
        const userPubs = data.filter((pub) => {
          const ownerId = pub.owner?._id || pub.owner?.id;
          const userId = user?._id || user?.id;
          const isOwner =
            ownerId && userId && ownerId.toString() === userId.toString();
          console.log(
            `比较发布 ${pub._id}: ownerId=${ownerId}, userId=${userId}, isOwner=${isOwner}`
          );
          return isOwner;
        });

        console.log("用户发布数量:", userPubs.length);
        setPublications(userPubs);
        setError(null);
      } else {
        throw new Error(data.message || "获取发布列表失败");
      }
    } catch (error) {
      console.error("获取发布列表失败:", error);
      setError(error.message || "获取发布列表失败，请检查网络连接");
    }
  }, [user]);

  // 首次加载和用户变化时获取数据
  React.useEffect(() => {
    console.log("useEffect触发, user:", user);
    setLoading(true);
    fetchPublications().finally(() => {
      setLoading(false);
      console.log("数据加载完成");
    });
  }, [user, fetchPublications]);

  // 监听路由参数变化，用于发布成功后刷新列表
  React.useEffect(() => {
    if (route.params?.refresh) {
      console.log("检测到刷新参数，重新获取数据");
      fetchPublications();
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh, fetchPublications, navigation]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPublications();
    setRefreshing(false);
  }, [fetchPublications]);

  const renderItem = ({ item, index }) => {
    const petTypeIcon =
      {
        cat: "cat",
        dog: "dog",
        other: "paw",
      }[item.type] || "paw";

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 200)}
        style={styles.cardContainer}
      >
        <View style={styles.cardWrapper}>
          <Card style={styles.card}>
            <View style={styles.imageContainer}>
              <Card.Cover
                source={{
                  uri:
                    item.images[0] ||
                    "https://via.placeholder.com/300x200?text=No+Image",
                }}
                style={styles.cardImage}
              />
              <View style={styles.statusBadge}>
                <MaterialCommunityIcons
                  name={petTypeIcon}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.applicantsCount}>
                  {item.applicants || 0} 人申请
                </Text>
              </View>
            </View>
            <Card.Content style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Text variant="titleLarge" style={styles.petName}>
                  {item.petName}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                variant="bodyMedium"
                style={styles.description}
                numberOfLines={2}
              >
                {item.description}
              </Text>
              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.breed}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.age}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.gender}</Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() =>
                  navigation.navigate("PetDetail", { petId: item._id })
                }
                style={styles.viewButton}
              >
                查看详情
              </Button>
            </Card.Content>
          </Card>
        </View>
      </Animated.View>
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "我的发布",
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            mode="contained"
            onPress={onRefresh}
            style={styles.retryButton}
          >
            重试
          </Button>
        </View>
      ) : !publications || publications.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="publish" size={64} color="#6200ee" />
          <Text style={styles.emptyText}>您还没有发布任何宠物信息</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("PublishTab")}
            style={styles.publishButton}
          >
            去发布
          </Button>
        </View>
      ) : (
        <FlatList
          data={publications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  publishButton: {
    marginTop: 20,
  },
  retryButton: {
    marginTop: 16,
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  card: {
    borderRadius: 16,
  },
  imageContainer: {
    position: "relative",
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  petName: {
    fontSize: 20,
    fontWeight: "600",
  },
  date: {
    color: "#666",
    fontSize: 14,
  },
  description: {
    color: "#666",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#666",
    fontSize: 14,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  applicantsCount: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  viewButton: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default MyPublicationsScreen;
