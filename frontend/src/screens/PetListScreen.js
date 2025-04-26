import * as React from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Searchbar,
  Card,
  Text,
  Chip,
  ActivityIndicator,
  Button,
  IconButton,
} from "react-native-paper";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../config";
import AdvancedFilterModal from "../components/AdvancedFilterModal";
import ActiveFiltersBar from "../components/ActiveFiltersBar";

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

  // 高级筛选相关状态
  const [filterModalVisible, setFilterModalVisible] = React.useState(false);
  const [advancedFilters, setAdvancedFilters] = React.useState({});

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    // 只有当类型不是"all"时才添加到查询参数
    if (selectedType !== "all") {
      params.append("type", selectedType);
    }

    // 添加其他高级筛选条件
    Object.entries(advancedFilters).forEach(([key, value]) => {
      // 跳过 undefined 和 null 值
      if (value === undefined || value === null) {
        return;
      }

      // 处理嵌套对象路径，如 medical.healthStatus
      if (key === "healthStatus") {
        params.append("medical.healthStatus", value);
      } else if (key === "vaccinated") {
        params.append("medical.vaccinated", value.toString());
      } else if (key === "sterilized") {
        params.append("medical.sterilized", value.toString());
      } else {
        params.append(key, value);
      }
    });

    return params.toString();
  };

  const fetchPets = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("开始获取宠物列表, Token:", token ? "存在" : "不存在");

      // 构建查询参数
      const queryParams = buildQueryParams();
      const url = queryParams
        ? `${API_ENDPOINTS.PETS}?${queryParams}`
        : API_ENDPOINTS.PETS;

      console.log("请求URL:", url);

      const response = await fetch(url, {
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
  }, [selectedType, advancedFilters]);

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

  // 根据搜索词和状态过滤宠物列表（已经通过后端API筛选了类型和其他条件）
  const filteredPets = React.useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch =
        pet.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pet.description &&
          pet.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const isAvailable = pet.status === "available";

      return matchesSearch && isAvailable;
    });
  }, [pets, searchQuery]);

  React.useEffect(() => {
    if (route.params?.filterType) {
      setSelectedType(route.params.filterType);
    }
  }, [route.params?.filterType]);

  const handleApplyFilters = (filters) => {
    console.log("应用筛选条件:", filters);
    setAdvancedFilters(filters);
    setFilterModalVisible(false);
  };

  const handleRemoveFilter = (key) => {
    const newFilters = { ...advancedFilters };
    delete newFilters[key];
    setAdvancedFilters(newFilters);
  };

  const handleResetFilters = () => {
    setSelectedType("all");
    setAdvancedFilters({});
  };

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
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="搜索宠物名称、品种..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <IconButton
          icon="filter-variant"
          size={24}
          onPress={() => setFilterModalVisible(true)}
          style={styles.filterButton}
        />
      </View>

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

      {/* 显示当前激活的筛选条件 */}
      <ActiveFiltersBar
        filters={advancedFilters}
        onRemoveFilter={handleRemoveFilter}
      />

      {/* 如果有筛选条件，显示重置按钮 */}
      {(selectedType !== "all" || Object.keys(advancedFilters).length > 0) && (
        <Button
          mode="text"
          onPress={handleResetFilters}
          style={styles.resetButton}
        >
          重置所有筛选
        </Button>
      )}

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

      {/* 高级筛选模态框 */}
      <AdvancedFilterModal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={advancedFilters}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
    borderRadius: 12,
  },
  filterButton: {
    marginLeft: 8,
    backgroundColor: "#f0f0f0",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  resetButton: {
    alignSelf: "center",
    marginVertical: 4,
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
    fontWeight: "700",
    marginBottom: 4,
  },
  petInfo: {
    flexDirection: "row",
    marginBottom: 6,
  },
  breed: {
    marginRight: 8,
    color: "#666",
  },
  age: {
    color: "#666",
  },
  description: {
    color: "#444",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

export default PetListScreen;
