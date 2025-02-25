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
  const { petId, pet: routePet, adoption: routeAdoption } = route.params || {};
  const { petList, user, addAdoption, cancelAdoption } =
    React.useContext(UserContext);
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [petData, setPetData] = React.useState(null);
  const [hasApplied, setHasApplied] = React.useState(false);

  // 查找用户是否已经申请过这只宠物
  const userAdoption = React.useMemo(() => {
    console.log("检查用户申请状态：", {
      adoptions: user?.adoptions,
      petId: petId,
      routePet: routePet,
      routeAdoption: routeAdoption,
    });

    // 如果有传入的申请记录，直接使用
    if (routeAdoption) {
      console.log("使用传入的申请记录:", routeAdoption);
      return routeAdoption;
    }

    // 否则从用户的申请记录中查找
    if (!user?.adoptions) {
      console.log("用户没有申请记录");
      return null;
    }

    const adoption = user.adoptions.find((adoption) => {
      const adoptionPetId = adoption.pet?._id || adoption.petId;
      const targetPetId = petId;
      console.log("比对申请记录：", {
        adoptionPetId,
        targetPetId,
        match: adoptionPetId === targetPetId,
      });
      return adoptionPetId === targetPetId;
    });

    console.log("找到的申请记录：", adoption);
    return adoption;
  }, [user, petId, routePet, routeAdoption]);

  // 判断是否是宠物主人
  const isOwner = React.useMemo(() => {
    if (!user || !petData?.owner) return false;
    const userId = user.id || user._id;
    const ownerId = petData.owner.id || petData.owner._id;
    return userId?.toString() === ownerId?.toString();
  }, [user, petData]);

  // 判断是否可以申请领养
  const canAdopt = React.useMemo(() => {
    console.log("判断是否可以申请：", {
      isOwner,
      hasAdoption: !!userAdoption,
      adoptionStatus: userAdoption?.status,
      petStatus: petData?.status,
    });
    return (
      !isOwner &&
      (!userAdoption || userAdoption.status === "cancelled") &&
      petData?.status !== "adopted"
    );
  }, [isOwner, userAdoption, petData]);

  // 从后端获取完整的宠物信息
  const fetchPetDetail = React.useCallback(async () => {
    try {
      let finalPetData = null;

      // 优先从API获取最新数据
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
        // API请求失败时，尝试使用路由传递的数据或列表中的数据
        if (routePet) {
          console.log("使用路由传递的宠物数据:", routePet);
          finalPetData = routePet;
        } else {
          // 如果没有完整对象，尝试从列表中查找
          const foundPet = petList.find((p) => p._id === petId);
          if (foundPet) {
            console.log("从列表中找到宠物数据:", foundPet);
            finalPetData = foundPet;
          }
        }
      } else {
        finalPetData = data.data || data;
      }

      // 确保数据完整性
      if (finalPetData) {
        // 如果数据是从申请记录来的，可能需要从pet字段获取
        const actualPetData = finalPetData.pet || finalPetData;
        console.log("处理前的实际宠物数据:", actualPetData);

        // 标准化数据结构
        const standardizedData = {
          _id: actualPetData._id || petId,
          petName: actualPetData.petName || "未命名宠物",
          description: actualPetData.description || "暂无描述",
          requirements: actualPetData.requirements || "暂无特殊要求",
          breed: actualPetData.breed || "未知品种",
          age: actualPetData.age || "未知年龄",
          gender: actualPetData.gender || "unknown",
          medical: {
            vaccinated: actualPetData.medical?.vaccinated ?? false,
            sterilized: actualPetData.medical?.sterilized ?? false,
            healthStatus: actualPetData.medical?.healthStatus || "暂无信息",
          },
          images: Array.isArray(actualPetData.images)
            ? actualPetData.images
            : [actualPetData.image],
          owner: actualPetData.owner || {},
          status: actualPetData.status || "available",
        };

        console.log("标准化后的宠物数据:", standardizedData);
        setPetData(standardizedData);
      }
    } catch (error) {
      console.error("获取宠物详情失败:", error);
      setLoading(false);
    }
  }, [petId, routePet, petList]);

  // 处理宠物数据和图片加载
  const pet = React.useMemo(() => {
    if (!petData) {
      return null;
    }

    console.log("开始处理最终显示数据:", petData);

    // 预加载图片
    Promise.all(
      petData.images.map((img) =>
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

  // 监听路由参数变化，用于刷新数据
  React.useEffect(() => {
    if (route.params?.refresh) {
      console.log("检测到刷新标记，重新获取数据");
      fetchPetDetail();
      // 清除刷新标记
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh, fetchPetDetail, navigation]);

  // 首次加载时获取宠物详情
  React.useEffect(() => {
    console.log("首次加载，获取宠物详情");
    fetchPetDetail();
  }, [fetchPetDetail]);

  // 检查是否已申请
  const checkApplicationStatus = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch("http://192.168.3.74:5001/api/adoptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        const hasActiveApplication = data.some(
          (adoption) =>
            adoption.pet?._id === route.params.petId &&
            (adoption.status === "active" || adoption.status === "pending")
        );
        setHasApplied(hasActiveApplication);
        console.log("申请状态检查:", {
          petId: route.params.petId,
          hasActiveApplication,
          applications: data.filter((a) => a.pet?._id === route.params.petId),
        });
      }
    } catch (error) {
      console.error("检查申请状态失败:", error);
    }
  }, [route.params.petId]);

  // 在组件加载和路由参数变化时检查申请状态
  React.useEffect(() => {
    checkApplicationStatus();
  }, [checkApplicationStatus]);

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
      petInfo: {
        ...pet,
        description: pet.description,
        requirements: pet.requirements,
      },
      ownerInfo: pet.owner,
    });
  };

  const handleCancelAdoption = async () => {
    try {
      setSubmitting(true);

      // 确保有申请ID
      if (!userAdoption?._id) {
        console.error("找不到申请记录:", userAdoption);
        throw new Error("找不到申请记录");
      }

      console.log("开始取消申请:", userAdoption._id);
      const result = await cancelAdoption(userAdoption._id);
      console.log("取消申请结果:", result);

      // 显示成功消息并返回主页
      Alert.alert("成功", "已取消申请", [
        {
          text: "确定",
          onPress: () => {
            // 返回主页
            navigation.navigate("Main", {
              screen: "Home",
              params: { refresh: true },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("取消申请失败:", error);
      Alert.alert("错误", error.message || "取消申请失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

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

  // 修改渲染按钮的逻辑
  const renderActionButton = () => {
    if (isOwner) {
      return null;
    }

    // 检查是否有活跃的申请（包括 pending 和 active 状态）
    const hasActiveAdoption =
      userAdoption &&
      (userAdoption.status === "active" || userAdoption.status === "pending");

    if (hasActiveAdoption || hasApplied) {
      return (
        <Button mode="contained" disabled={true} style={styles.actionButton}>
          已申请
        </Button>
      );
    }

    return (
      <Button
        mode="contained"
        onPress={handleAdopt}
        style={styles.actionButton}
      >
        申请领养
      </Button>
    );
  };

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
                    backgroundColor: getStatusColor(userAdoption.status).bg,
                  },
                ]}
                textColor={getStatusColor(userAdoption.status).text}
              >
                {getStatusText(userAdoption.status)}
              </Chip>
              <Text style={styles.adoptionDate}>
                申请日期：
                {new Date(userAdoption.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.sectionSubtitle}>申请理由：</Text>
              <Text style={styles.description}>{userAdoption.reason}</Text>
            </Surface>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>性格特征</Text>
          <Surface style={styles.contentCard}>
            <Text style={styles.description}>
              {pet.description || "暂无描述"}
            </Text>
          </Surface>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>领养要求</Text>
          <Surface style={styles.contentCard}>
            <Text style={styles.description}>
              {pet.requirements || "暂无特殊要求"}
            </Text>
          </Surface>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>健康状况</Text>
        <List.Item
          title="疫苗接种"
          left={(props) => (
            <List.Icon
              {...props}
              icon={pet.medical?.vaccinated ? "check-circle" : "close-circle"}
              color={pet.medical?.vaccinated ? "#4CAF50" : "#f44336"}
            />
          )}
          description={pet.medical?.vaccinated ? "已接种" : "未接种"}
        />
        <List.Item
          title="绝育情况"
          left={(props) => (
            <List.Icon
              {...props}
              icon={pet.medical?.sterilized ? "check-circle" : "close-circle"}
              color={pet.medical?.sterilized ? "#4CAF50" : "#f44336"}
            />
          )}
          description={pet.medical?.sterilized ? "已绝育" : "未绝育"}
        />
        <List.Item
          title="健康状态"
          description={pet.medical?.healthStatus || "暂无信息"}
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

        {renderActionButton()}
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
  actionButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  ownerText: {
    marginTop: 24,
    paddingVertical: 8,
    color: "#666",
    textAlign: "center",
  },
  approvedText: {
    marginTop: 24,
    paddingVertical: 8,
    color: "#1565C0",
    textAlign: "center",
    fontSize: 14,
  },
  cancelledText: {
    marginTop: 24,
    paddingVertical: 8,
    color: "#C62828",
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
