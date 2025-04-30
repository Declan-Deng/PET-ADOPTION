import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
  RefreshControl,
  FlatList,
} from "react-native";
import {
  Surface,
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../config";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

const HomeScreen = ({ navigation, route }) => {
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [featuredPets, setFeaturedPets] = React.useState([]);
  const [imageLoadingStates, setImageLoadingStates] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [pets, setPets] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeSlide, setActiveSlide] = React.useState(0);
  const flatListRef = React.useRef(null);

  // 获取宠物列表
  const fetchPets = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(API_ENDPOINTS.PETS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setPets(data);
        // 只从可领养的宠物中随机选择3个作为推荐
        const availablePets = data.filter((pet) => pet.status === "available");
        const shuffled = [...availablePets].sort(() => 0.5 - Math.random());
        setFeaturedPets(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error("获取宠物列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载和刷新时获取数据
  React.useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // 监听路由参数变化，用于发布成功后刷新列表
  React.useEffect(() => {
    if (route.params?.refresh) {
      fetchPets();
      // 清除刷新标记
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh, fetchPets, navigation]);

  // 下拉刷新处理
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  }, [fetchPets]);

  // 统计每种类型的可领养宠物数量
  const petCounts = React.useMemo(
    () => ({
      cat: pets.filter(
        (pet) => pet.type === "cat" && pet.status === "available"
      ).length,
      dog: pets.filter(
        (pet) => pet.type === "dog" && pet.status === "available"
      ).length,
      other: pets.filter(
        (pet) => pet.type === "other" && pet.status === "available"
      ).length,
    }),
    [pets]
  );

  // 动画值
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    // 启动入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [pets]);

  const handleImageLoadStart = (petId) => {
    setImageLoadingStates((prev) => ({ ...prev, [petId]: true }));
  };

  const handleImageLoadEnd = (petId) => {
    setImageLoadingStates((prev) => ({ ...prev, [petId]: false }));
  };

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const handleTypePress = (type) => {
    navigation.navigate("PetList", { filterType: type });
  };

  // 轮播自动滚动定时器
  React.useEffect(() => {
    let intervalId;

    if (featuredPets.length > 1) {
      intervalId = setInterval(() => {
        if (flatListRef.current) {
          const nextIndex = (activeSlide + 1) % featuredPets.length;
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          setActiveSlide(nextIndex);
        }
      }, 3000); // 每3秒轮播一次
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeSlide, featuredPets.length]);

  // 处理轮播滚动结束事件
  const handleViewableItemsChanged = React.useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveSlide(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderFeaturedItem = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateY }],
          },
        ]}
      >
        <Card
          style={[styles.featuredCard]}
          onPress={() =>
            navigation.navigate("PetDetail", {
              petId: item._id,
              pet: item,
            })
          }
        >
          <View style={styles.imageContainer}>
            <Card.Cover
              source={{
                uri:
                  item.images && item.images.length > 0
                    ? item.images[0]
                    : "https://via.placeholder.com/300x200?text=No+Image",
              }}
              style={styles.featuredImage}
              onLoadStart={() => handleImageLoadStart(item._id)}
              onLoadEnd={() => handleImageLoadEnd(item._id)}
            />
            {imageLoadingStates[item._id] && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#1a237e" />
              </View>
            )}
          </View>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.cardTitle}>
              {item.petName || "未命名宠物"}
            </Title>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoText}>{item.breed}</Text>
              <Text style={styles.cardInfoText}>
                {item.age ? `${item.age}岁` : "年龄未知"}
              </Text>
            </View>
            <Paragraph numberOfLines={2} style={styles.cardDescription}>
              {item.description}
            </Paragraph>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  // 渲染轮播指示器
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {featuredPets.map((_, i) => (
          <View
            key={i}
            style={[
              styles.paginationDot,
              i === activeSlide ? styles.paginationDotActive : null,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity,
            },
          ]}
        >
          <Text style={styles.welcomeText}>欢迎来到宠物领养平台</Text>
          <Text style={styles.subtitle}>让爱找到归宿</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: translateY }],
            },
          ]}
        >
          <TouchableOpacity onPress={() => handleTypePress("cat")}>
            <Surface style={styles.statCard} elevation={2}>
              <IconButton icon="cat" size={24} iconColor="#1a237e" />
              <Text style={styles.statNumber}>{petCounts.cat}</Text>
              <Text style={styles.statLabel}>猫咪</Text>
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleTypePress("dog")}>
            <Surface style={styles.statCard} elevation={2}>
              <IconButton icon="dog" size={24} iconColor="#1a237e" />
              <Text style={styles.statNumber}>{petCounts.dog}</Text>
              <Text style={styles.statLabel}>狗狗</Text>
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleTypePress("other")}>
            <Surface style={styles.statCard} elevation={2}>
              <IconButton icon="rabbit" size={24} iconColor="#1a237e" />
              <Text style={styles.statNumber}>{petCounts.other}</Text>
              <Text style={styles.statLabel}>其他</Text>
            </Surface>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>推荐领养</Text>
          {featuredPets.length > 0 ? (
            <View style={styles.carouselContainer}>
              <FlatList
                ref={flatListRef}
                data={featuredPets}
                renderItem={renderFeaturedItem}
                keyExtractor={(item) => item._id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                contentContainerStyle={styles.carouselList}
              />
              {renderPagination()}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无推荐宠物</Text>
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }],
            },
          ]}
        >
          <Button
            mode="contained"
            onPress={() => navigation.navigate("PetList")}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            查看全部待领养宠物
          </Button>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    width: width * 0.28,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a237e",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 16,
    color: "#1a237e",
  },
  carouselContainer: {
    position: "relative",
    paddingBottom: 30,
  },
  carouselList: {
    paddingHorizontal: 0,
  },
  featuredCard: {
    width: CARD_WIDTH,
    marginHorizontal: (width - CARD_WIDTH) / 2,
    borderRadius: 12,
    elevation: 4,
  },
  featuredImage: {
    height: 220,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  cardInfoText: {
    color: "#666",
    fontSize: 14,
  },
  cardDescription: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  button: {
    borderRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "#f0f0f0",
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#bbbbbb",
  },
  paginationDotActive: {
    backgroundColor: "#1a237e",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

export default HomeScreen;
