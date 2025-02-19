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
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

const HomeScreen = ({ navigation }) => {
  const { petList } = React.useContext(UserContext);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [featuredPets, setFeaturedPets] = React.useState([]);
  const [petCounts, setPetCounts] = React.useState({
    cat: 0,
    dog: 0,
    other: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [imageLoadingStates, setImageLoadingStates] = React.useState({});

  // 动画值
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;

  const fetchPets = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch("http://192.168.3.74:5001/api/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        // 统计每种类型的宠物数量
        const counts = {
          cat: data.filter((pet) => pet.type === "cat").length,
          dog: data.filter((pet) => pet.type === "dog").length,
          other: data.filter((pet) => pet.type === "other").length,
        };
        setPetCounts(counts);

        // 随机选择3个宠物作为推荐
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 3).map((pet) => ({
          _id: pet._id,
          petName: pet.petName,
          breed: pet.breed,
          age: pet.age,
          description: pet.description,
          images: pet.images,
          type: pet.type,
          gender: pet.gender,
          medical: {
            healthStatus: pet.medical?.healthStatus || "健康",
            vaccinated: pet.medical?.vaccinated || false,
            sterilized: pet.medical?.sterilized || false,
          },
          requirements: pet.requirements,
          owner: pet.owner,
          createdAt: pet.createdAt,
          updatedAt: pet.updatedAt,
        }));
        setFeaturedPets(featured);

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
      }
    } catch (error) {
      console.error("获取宠物列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, [fadeAnim, scaleAnim, translateY]);

  React.useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  }, [fetchPets]);

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

  // 添加格式化年龄的函数
  const formatAge = (age) => {
    if (!age) return "未知年龄";
    return age.includes("岁") ? age : `${age}岁`;
  };

  const renderFeaturedPet = (pet, index) => {
    return (
      <Animated.View
        key={pet._id}
        style={[
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateY }],
          },
        ]}
      >
        <Card
          style={[styles.featuredCard, { marginLeft: index === 0 ? 20 : 0 }]}
          onPress={() =>
            navigation.navigate("PetDetail", {
              pet: pet,
            })
          }
        >
          <View style={styles.imageContainer}>
            <Card.Cover
              source={{
                uri:
                  pet.images && pet.images.length > 0
                    ? pet.images[0]
                    : "https://via.placeholder.com/300x200?text=No+Image",
              }}
              style={styles.featuredImage}
              onLoadStart={() => handleImageLoadStart(pet._id)}
              onLoadEnd={() => handleImageLoadEnd(pet._id)}
              onError={(e) => {
                console.log("图片加载失败，使用默认图片");
                const updatedPets = featuredPets.map((p) =>
                  p._id === pet._id
                    ? {
                        ...p,
                        images: [
                          "https://via.placeholder.com/300x200?text=No+Image",
                        ],
                      }
                    : p
                );
                setFeaturedPets(updatedPets);
              }}
            />
            {imageLoadingStates[pet._id] && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#1a237e" />
              </View>
            )}
          </View>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.cardTitle}>{pet.petName}</Title>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoText}>{pet.breed}</Text>
              <Text style={styles.cardInfoText}>{formatAge(pet.age)}</Text>
            </View>
            <Paragraph numberOfLines={2} style={styles.cardDescription}>
              {pet.description}
            </Paragraph>
          </Card.Content>
        </Card>
      </Animated.View>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16}
          >
            {featuredPets.map((pet, index) => renderFeaturedPet(pet, index))}
          </ScrollView>
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
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
        </View>
      )}
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
  featuredScroll: {
    paddingRight: 20,
    paddingBottom: 8,
  },
  featuredCard: {
    width: CARD_WIDTH,
    marginRight: 16,
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
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

export default HomeScreen;
