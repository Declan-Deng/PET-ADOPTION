import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Linking,
} from "react-native";
import {
  Surface,
  Text,
  Chip,
  Button,
  Portal,
  Dialog,
  Divider,
  List,
  Avatar,
  useTheme,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const PetDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { user } = React.useContext(UserContext);
  const { petId } = route.params;
  const [pet, setPet] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showContactDialog, setShowContactDialog] = React.useState(false);

  // 获取宠物详情
  const fetchPetDetail = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `http://192.168.3.74:5001/api/pets/${petId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPet(data.data);
        setError(null);
      } else {
        setError(data.message || "获取宠物详情失败");
      }
    } catch (error) {
      console.error("获取宠物详情失败:", error);
      setError("获取宠物详情失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  React.useEffect(() => {
    fetchPetDetail();
  }, [fetchPetDetail]);

  const handleCall = () => {
    if (pet?.owner?.profile?.phone) {
      Linking.openURL(`tel:${pet.owner.profile.phone}`);
    }
  };

  const handleMessage = () => {
    if (pet?.owner?.profile?.phone) {
      Linking.openURL(`sms:${pet.owner.profile.phone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.errorContainer}>
        <Text>未找到宠物信息</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 宠物图片 */}
      <Image
        source={{ uri: pet.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* 基本信息 */}
      <Surface style={styles.infoContainer} elevation={1}>
        <Text style={styles.name}>{pet.petName}</Text>
        <View style={styles.tagsContainer}>
          <Chip mode="outlined" style={styles.tag}>
            {pet.type === "cat" ? "猫" : "狗"}
          </Chip>
          <Chip mode="outlined" style={styles.tag}>
            {pet.breed}
          </Chip>
          <Chip mode="outlined" style={styles.tag}>
            {pet.gender === "male" ? "公" : "母"}
          </Chip>
          <Chip mode="outlined" style={styles.tag}>
            {pet.age}岁
          </Chip>
        </View>

        <Divider style={styles.divider} />

        {/* 健康状况 */}
        <Text style={styles.sectionTitle}>健康状况</Text>
        <View style={styles.healthContainer}>
          <Chip
            mode="outlined"
            icon={pet.medical.vaccinated ? "check" : "close"}
            style={[
              styles.healthChip,
              {
                backgroundColor: pet.medical.vaccinated ? "#E8F5E9" : "#FFEBEE",
              },
            ]}
          >
            疫苗接种
          </Chip>
          <Chip
            mode="outlined"
            icon={pet.medical.sterilized ? "check" : "close"}
            style={[
              styles.healthChip,
              {
                backgroundColor: pet.medical.sterilized ? "#E8F5E9" : "#FFEBEE",
              },
            ]}
          >
            绝育情况
          </Chip>
          <Chip
            mode="outlined"
            style={[
              styles.healthChip,
              {
                backgroundColor: "#E3F2FD",
              },
            ]}
          >
            {pet.medical.healthStatus}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        {/* 详细描述 */}
        <Text style={styles.sectionTitle}>详细描述</Text>
        <Text style={styles.description}>{pet.description}</Text>

        <Divider style={styles.divider} />

        {/* 领养要求 */}
        <Text style={styles.sectionTitle}>领养要求</Text>
        <Text style={styles.description}>{pet.requirements}</Text>

        <Divider style={styles.divider} />

        {/* 发布者信息 */}
        <Text style={styles.sectionTitle}>发布者信息</Text>
        <List.Item
          title={pet.owner.profile.name}
          description={`联系电话: ${
            pet.owner.profile.phone || "未设置"
          }\n地址: ${pet.owner.profile.address || "未设置"}`}
          left={(props) => (
            <Avatar.Image
              {...props}
              size={50}
              source={
                pet.owner.profile.avatar
                  ? { uri: pet.owner.profile.avatar }
                  : require("../../assets/default-avatar.png")
              }
            />
          )}
        />

        {/* 联系按钮 */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleCall}
            style={[styles.button, { marginRight: 8 }]}
            disabled={!pet.owner.profile.phone}
          >
            打电话
          </Button>
          <Button
            mode="contained"
            onPress={handleMessage}
            style={styles.button}
            disabled={!pet.owner.profile.phone}
          >
            发短信
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: width,
    height: width * 0.75,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  healthContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  healthChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "#B00020",
    textAlign: "center",
  },
});

export default PetDetailScreen;
