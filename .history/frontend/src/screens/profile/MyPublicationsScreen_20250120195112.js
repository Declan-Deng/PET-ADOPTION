import * as React from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Card, Text, ActivityIndicator, Button } from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MyPublicationsScreen = ({ navigation, route }) => {
  const { user } = React.useContext(UserContext);
  const [publications, setPublications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchPublications = React.useCallback(async () => {
    if (!user) {
      setError("请先登录");
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setError("登录已过期，请重新登录");
        setLoading(false);
        return;
      }

      const response = await fetch("http://192.168.3.74:5001/api/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "获取发布列表失败");
      }

      const userPubs = data.filter((pub) => {
        const ownerId = pub.owner?._id || pub.owner?.id;
        const userId = user?._id || user?.id;
        return ownerId && userId && ownerId.toString() === userId.toString();
      });

      setPublications(userPubs);
      setError(null);
    } catch (error) {
      setError(error.message || "获取发布列表失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  React.useEffect(() => {
    if (route.params?.refresh) {
      fetchPublications();
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh, fetchPublications, navigation]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPublications();
    setRefreshing(false);
  }, [fetchPublications]);

  const renderItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate("PetDetail", { petId: item._id })}
    >
      <Card.Cover
        source={{
          uri:
            item.images[0] ||
            "https://via.placeholder.com/300x200?text=No+Image",
        }}
        style={styles.cardImage}
      />
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleLarge">{item.petName}</Text>
          <Text variant="bodyMedium" style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name={
              item.type === "cat" ? "cat" : item.type === "dog" ? "dog" : "paw"
            }
            size={20}
            color="#666"
          />
          <Text style={styles.applicants}>{item.applicants || 0} 人申请</Text>
        </View>
      </Card.Content>
    </Card>
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "我的发布",
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.message}>加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchPublications}
          style={styles.button}
        >
          重试
        </Button>
      </View>
    );
  }

  if (!publications.length) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="publish" size={64} color="#6200ee" />
        <Text style={styles.message}>您还没有发布任何宠物信息</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("PublishTab")}
          style={styles.button}
        >
          去发布
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      data={publications}
      renderItem={renderItem}
      keyExtractor={(item) => item._id.toString()}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
  },
  list: {
    padding: 16,
    backgroundColor: "#fff",
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
  },
  cardImage: {
    height: 200,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  date: {
    color: "#666",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  applicants: {
    marginLeft: 8,
    color: "#666",
  },
});

export default MyPublicationsScreen;
