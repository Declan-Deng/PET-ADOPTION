import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import {
  Text,
  Button,
  Card,
  Chip,
  Divider,
  List,
  Surface,
  useTheme,
} from "react-native-paper";
import { UserContext } from "../context/UserContext";
import ImageCarousel from "../components/ImageCarousel";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const PetDetailScreen = ({ route, navigation }) => {
  const { petId, pet: routePet } = route.params || {};
  const { petList, user, addAdoption } = React.useContext(UserContext);
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [petData, setPetData] = React.useState(null);

  // 从后端获取完整的宠物信息
  const fetchPetDetail = React.useCallback(async () => {
    try {
      // 优先使用路由传递的完整宠物对象
      if (routePet) {
        console.log("使用路由传递的宠物数据:", routePet);
        setPetData(routePet);
        return;
      }

      // 如果没有完整对象，尝试从列表中查找
      const foundPet = petList.find((p) => p._id === petId);
      if (foundPet) {
        console.log("从列表中找到宠物数据:", foundPet);
        setPetData(foundPet);
        return;
      }

      // 如果都没有，则从API获取
      console.log("从API获取宠物数据, ID:", petId);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log("未找到用户令牌");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://192.168.3.74:5001/api/pets/${petId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("API响应:", data);

      if (!response.ok) {
        console.error("API请求失败:", data.message);
        setLoading(false);
        return;
      }

      setPetData(data);
    } catch (error) {
      console.error("获取宠物详情失败:", error);
      setLoading(false);
    }
  }, [petId, routePet, petList]);

  // 首次加载时获取宠物详情
  React.useEffect(() => {
    fetchPetDetail();
  }, [fetchPetDetail]);

  // 查找用户是否已经申请过这只宠物
  const userAdoption = React.useMemo(() => {
    if (!user?.adoptions) return null;
    return user.adoptions.find((adoption) => adoption.petId === petId);
  }, [user, petId]);

  const pet = React.useMemo(() => {
    if (!petData) {
      return null;
    }

    console.log("处理宠物数据:", petData);
    const images = Array.isArray(petData.images)
      ? petData.images
      : [petData.image];

    // 预加载图片
    console.log("开始预加载图片...");
    Promise.all(
      images.map((img) =>
        Image.prefetch(img).catch(() => {
          console.log("图片预加载失败:", img);
          return Promise.resolve();
        })
      )
    ).then(() => {
      console.log("所有图片预加载完成");
      setImagesLoaded(true);
      setLoading(false);
    });

    return petData;
  }, [petData]);

  if (loading || !imagesLoaded) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>未找到宠物信息</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        >
          返回
        </Button>
      </View>
    );
  }

  const handleAdopt = async () => {
    if (!user) {
      Alert.alert("提示", "请先登录", [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "去登录",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
      return;
    }

    navigation.navigate("AdoptionForm", {
      petId: pet._id,
      petName: pet.petName,
      petInfo: pet,
      ownerInfo: pet.owner,
    });
  };

  // 检查是否是宠物主人
  const isOwner = React.useMemo(() => {
    if (!user || !pet?.owner) return false;

    // 获取用户ID和宠物主人ID
    const userId = user._id || user.id;
    const ownerId = pet.owner._id || pet.owner.id;

    console.log("比较用户ID:", userId);
    console.log("宠物主人ID:", ownerId);

    return userId?.toString() === ownerId?.toString();
  }, [user, pet]);

  const canAdopt =
    !isOwner && !userAdoption && (!pet?.status || pet?.status === "available");

  return (
    <ScrollView style={styles.container}>
      <ImageCarousel
        images={Array.isArray(pet.images) ? pet.images : [pet.image]}
      />

      <Surface style={styles.infoContainer} elevation={2}>
        <Text style={styles.name}>{pet.petName || "未命名宠物"}</Text>
        <View style={styles.tags}>
          <Chip
            icon="paw"
            style={[styles.chip, { backgroundColor: "#F5E6E8" }]}
            textColor="#D4919A"
          >
            {pet.breed}
          </Chip>
          <Chip
            icon="calendar"
            style={[styles.chip, { backgroundColor: "#E8F4F5" }]}
            textColor="#88B7BC"
          >
            {pet.age ? `${pet.age}岁` : "年龄未知"}
          </Chip>
          <Chip
            icon={pet.gender === "male" ? "gender-male" : "gender-female"}
            style={[
              styles.chip,
              {
                backgroundColor: pet.gender === "male" ? "#E8EAF5" : "#F5E8F0",
              },
            ]}
            textColor={pet.gender === "male" ? "#8C97CB" : "#CB8DAF"}
          >
            {pet.gender === "male" ? "公" : "母"}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        {/* 如果是用户自己的申请，显示申请状态和理由 */}
        {userAdoption && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>申请状态</Text>
            <Surface style={styles.contentCard}>
              <Chip
                icon="information"
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      userAdoption.status === "待审核"
                        ? "#FFF3E0"
                        : userAdoption.status === "已通过"
                        ? "#E8F5E9"
                        : "#FFEBEE",
                  },
                ]}
                textColor={
                  userAdoption.status === "待审核"
                    ? "#F57C00"
                    : userAdoption.status === "已通过"
                    ? "#2E7D32"
                    : "#C62828"
                }
              >
                {userAdoption.status}
              </Chip>
              <Text style={styles.adoptionDate}>
                申请日期：{userAdoption.date}
              </Text>
              <Text style={styles.sectionSubtitle}>申请理由：</Text>
              <Text style={styles.description}>{userAdoption.reason}</Text>
            </Surface>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>性格特征</Text>
          <Surface style={styles.contentCard}>
            <Text style={styles.description}>{pet.description}</Text>
          </Surface>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>领养要求</Text>
          <Surface style={styles.contentCard}>
            <Text style={styles.description}>{pet.requirements}</Text>
          </Surface>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>健康状况</Text>
        <List.Item
          title="疫苗接种"
          left={(props) => (
            <List.Icon
              {...props}
              icon={pet.medical.vaccinated ? "check-circle" : "close-circle"}
              color={pet.medical.vaccinated ? "#4CAF50" : "#f44336"}
            />
          )}
        />
        <List.Item
          title="绝育情况"
          left={(props) => (
            <List.Icon
              {...props}
              icon={pet.medical.sterilized ? "check-circle" : "close-circle"}
              color={pet.medical.sterilized ? "#4CAF50" : "#f44336"}
            />
          )}
        />
        <List.Item
          title="健康状态"
          description={pet.medical.healthStatus}
          left={(props) => <List.Icon {...props} icon="heart-pulse" />}
        />

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>联系方式</Text>
        <Card style={styles.contactCard}>
          <Card.Content>
            <List.Item
              title={pet.owner?.profile?.name || pet.owner?.name || "未设置"}
              description="发布者"
              left={(props) => <List.Icon {...props} icon="account" />}
            />
            <Divider />
            <List.Item
              title={pet.owner?.profile?.phone || pet.owner?.phone || "未设置"}
              description="联系电话"
              left={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => {
                const phone = pet.owner?.profile?.phone || pet.owner?.phone;
                if (phone) {
                  Linking.openURL(`tel:${phone}`);
                }
              }}
            />
            <Divider />
            <List.Item
              title={
                pet.owner?.profile?.address || pet.owner?.address || "未设置"
              }
              description="所在地区"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
          </Card.Content>
        </Card>

        {/* 只有在不是自己发布的宠物且未申请过且宠物状态为可领养时才显示申请领养按钮 */}
        {canAdopt ? (
          <Button
            mode="contained"
            onPress={handleAdopt}
            style={styles.adoptButton}
            loading={submitting}
          >
            申请领养
          </Button>
        ) : isOwner ? (
          <Text style={styles.ownerText}>这是您发布的宠物</Text>
        ) : userAdoption ? (
          <Text style={styles.adoptedText}>您已申请过这只宠物</Text>
        ) : null}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1a237e",
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    color: "#333",
  },
  contentCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  adoptionDate: {
    fontSize: 14,
    color: "#666",
    marginVertical: 8,
  },
  contactCard: {
    marginTop: 8,
  },
  adoptButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  adoptButtonContent: {
    height: 48,
  },
  adoptButtonLabel: {
    fontSize: 18,
  },
  ownerText: {
    marginTop: 24,
    paddingVertical: 8,
    color: "#666",
    textAlign: "center",
  },
  adoptedText: {
    marginTop: 24,
    paddingVertical: 8,
    color: "#666",
    textAlign: "center",
  },
});

export default PetDetailScreen;
