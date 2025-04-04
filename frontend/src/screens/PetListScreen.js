import * as React from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Searchbar,
  Card,
  Text,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../config";

const PetListScreen = ({ navigation, route }) => {
  const { user } = React.useContext(UserContext);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState(
    route.params?.filterType || "all"
  );
  const [pets, setPets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchPets = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("开始获取宠物列表, Token:", token ? "存在" : "不存在");

      const response = await fetch(API_ENDPOINTS.PETS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        console.log("获取到的宠物列表:", data);
        if (Array.isArray(data)) {
          setPets(data);
          setError(null);
        } else {
          console.error("返回的数据不是数组:", data);
          setError("获取宠物列表失败：数据格式错误");
        }
      } else {
        console.error("获取宠物列表失败:", data.message);
        setError(data.message || "获取宠物列表失败");
      }
    } catch (error) {
      console.error("获取宠物列表失败:", error);
      setError("获取宠物列表失败，请检查网络连接");
    }
  }, []);

  // 首次加载时获取数据
  React.useEffect(() => {
    setLoading(true);
    fetchPets().finally(() => setLoading(false));
  }, [fetchPets]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  }, [fetchPets]);

  // 根据搜索词和类型过滤宠物列表
  const filteredPets = React.useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch =
        pet.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "all" || pet.type === selectedType;

      const isAvailable = pet.status === "available";

      return matchesSearch && matchesType && isAvailable;
    });
  }, [pets, searchQuery, selectedType]);

  React.useEffect(() => {
    if (route.params?.filterType) {
      setSelectedType(route.params.filterType);
    }
  }, [route.params?.filterType]);

  const renderPetCard = ({ item }) => {
    // 检查图片URL
    const imageUrl =
      item.images && item.images.length > 0
        ? item.images[0]
        : "https://via.placeholder.com/300x200?text=No+Image";
    console.log("宠物图片URL:", imageUrl);
    console.log("宠物数据:", item);

    return (
      <Card
        style={styles.card}
        onPress={() => {
          console.log("点击宠物卡片:", item._id);
          navigation.navigate("PetDetail", {
            petId: item._id,
            pet: item,
          });
        }}
      >
        <Card.Cover
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          onError={(e) => {
            console.log("图片加载错误:", e.nativeEvent.error);
            // 如果图片加载失败，使用占位图片
            e.target.src =
              "https://via.placeholder.com/300x200?text=Error+Loading+Image";
          }}
        />
        <Card.Content style={styles.cardContent}>
          <Text variant="titleLarge" style={styles.petName}>
            {item.petName || "未命名宠物"}
          </Text>
          <View style={styles.petInfo}>
            <Text variant="bodyMedium" style={styles.breed}>
              {item.breed || "未知品种"}
            </Text>
            <Text variant="bodyMedium" style={styles.age}>
              {item.age ? `${item.age}岁` : "年龄未知"}
            </Text>
          </View>
          <Text
            variant="bodyMedium"
            numberOfLines={2}
            style={styles.description}
          >
            {item.description || "暂无描述"}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索宠物名称、品种..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <Chip
          selected={selectedType === "all"}
          onPress={() => setSelectedType("all")}
          style={styles.filterChip}
        >
          全部
        </Chip>
        <Chip
          selected={selectedType === "cat"}
          onPress={() => setSelectedType("cat")}
          style={styles.filterChip}
        >
          猫咪
        </Chip>
        <Chip
          selected={selectedType === "dog"}
          onPress={() => setSelectedType("dog")}
          style={styles.filterChip}
        >
          狗狗
        </Chip>
        <Chip
          selected={selectedType === "other"}
          onPress={() => setSelectedType("other")}
          style={styles.filterChip}
        >
          其他
        </Chip>
      </View>

      <FlatList
        data={filteredPets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  searchBar: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  petName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  petInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breed: {
    color: "#666",
  },
  age: {
    color: "#666",
  },
  description: {
    color: "#333",
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#B00020",
    textAlign: "center",
  },
});

export default PetListScreen;
