import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Switch,
  SegmentedButtons,
  Surface,
  IconButton,
  useTheme,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MAX_IMAGES = 5;

const PublishScreen = ({ navigation }) => {
  const theme = useTheme();
  const { addPublication } = React.useContext(UserContext);
  const [images, setImages] = React.useState([]);
  const [petName, setPetName] = React.useState("");
  const [type, setType] = React.useState("");
  const [breed, setBreed] = React.useState("");
  const [age, setAge] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [requirements, setRequirements] = React.useState("");
  const [vaccinated, setVaccinated] = React.useState(false);
  const [sterilized, setSterilized] = React.useState(false);
  const [healthStatus, setHealthStatus] = React.useState("健康");
  const [submitting, setSubmitting] = React.useState(false);

  // 请求相机权限
  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("提示", "需要相册权限才能选择图片");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        Alert.alert("提示", `最多只能上传${MAX_IMAGES}张图片`);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("选择图片失败:", error);
      Alert.alert("错误", "选择图片失败");
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (images.length === 0) {
      Alert.alert("提示", "请至少上传一张图片");
      return false;
    }
    if (!petName.trim()) {
      Alert.alert("提示", "请输入宠物名称");
      return false;
    }
    if (!type) {
      Alert.alert("提示", "请选择宠物类型");
      return false;
    }
    if (!breed.trim()) {
      Alert.alert("提示", "请输入品种");
      return false;
    }
    if (!age.trim() || isNaN(age) || parseInt(age) <= 0) {
      Alert.alert("提示", "请输入有效的年龄");
      return false;
    }
    if (!gender) {
      Alert.alert("提示", "请选择性别");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("提示", "请输入性格特征描述");
      return false;
    }
    if (!requirements.trim()) {
      Alert.alert("提示", "请输入领养要求");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setSubmitting(true);

      // 先上传所有图片
      const uploadedImageUrls = await Promise.all(
        images.map(async (image, index) => {
          try {
            if (image.startsWith("http")) {
              return image; // 如果已经是网络URL，直接使用
            }

            console.log(`准备上传图片 ${index}:`, image);

            const formData = new FormData();
            const imageInfo = {
              uri: image,
              type: "image/jpeg",
              name: `pet-image-${Date.now()}.jpg`,
            };
            formData.append("image", imageInfo);

            console.log(`图片 ${index} 的FormData:`, imageInfo);

            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(
              "http://192.168.3.74:5001/api/upload/image",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
                body: formData,
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || "图片上传失败");
            }

            const result = await response.json();
            console.log(`图片 ${index} 上传成功:`, result);
            return result.url;
          } catch (error) {
            console.error(`图片 ${index} 上传失败:`, error);
            throw error;
          }
        })
      );

      // 构建宠物数据
      const petData = {
        petName,
        type,
        breed,
        age: parseInt(age),
        gender,
        description,
        requirements,
        images: uploadedImageUrls,
        medical: {
          vaccinated,
          sterilized,
          healthStatus,
        },
      };

      // 发布宠物
      await addPublication(petData);

      Alert.alert("成功", "发布成功", [
        {
          text: "确定",
          onPress: () => {
            navigation.navigate("Main", {
              screen: "ProfileTab",
              params: {
                screen: "MyPublications",
                params: { refresh: true },
              },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("发布失败:", error);
      Alert.alert("错误", error.message || "发布失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.imageSection} elevation={1}>
        <Text style={styles.sectionTitle}>上传图片</Text>
        <View style={styles.imageContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{ uri }}
                style={styles.image}
                onError={(error) => {
                  console.error(
                    `图片 ${index} 加载失败:`,
                    error.nativeEvent.error
                  );
                  console.error(`图片URL:`, uri);
                }}
                onLoadStart={() => console.log(`图片 ${index} 开始加载:`, uri)}
                onLoad={() => console.log(`图片 ${index} 加载成功:`, uri)}
              />
              <IconButton
                icon="close-circle"
                size={20}
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              />
            </View>
          ))}
          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <IconButton icon="plus" size={40} />
              <Text>添加图片</Text>
            </TouchableOpacity>
          )}
        </View>
      </Surface>

      <Surface style={styles.formSection} elevation={1}>
        <Text style={styles.sectionTitle}>基本信息</Text>
        <TextInput
          label="宠物名称"
          value={petName}
          onChangeText={setPetName}
          style={styles.input}
        />

        <Text style={styles.label}>宠物类型</Text>
        <SegmentedButtons
          value={type}
          onValueChange={setType}
          buttons={[
            { value: "cat", label: "猫咪" },
            { value: "dog", label: "狗狗" },
            { value: "other", label: "其他" },
          ]}
          style={styles.segmentedButtons}
        />

        <TextInput
          label="品种"
          value={breed}
          onChangeText={setBreed}
          style={styles.input}
        />

        <TextInput
          label="年龄"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>性别</Text>
        <SegmentedButtons
          value={gender}
          onValueChange={setGender}
          buttons={[
            { value: "male", label: "公" },
            { value: "female", label: "母" },
            { value: "unknown", label: "未知" },
          ]}
          style={styles.segmentedButtons}
        />

        <TextInput
          label="性格特征"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <TextInput
          label="领养要求"
          value={requirements}
          onChangeText={setRequirements}
          multiline
          numberOfLines={4}
          style={styles.input}
        />
      </Surface>

      <Surface style={styles.formSection} elevation={1}>
        <Text style={styles.sectionTitle}>健康状况</Text>
        <View style={styles.switchRow}>
          <Text>是否接种疫苗</Text>
          <Switch value={vaccinated} onValueChange={setVaccinated} />
        </View>
        <View style={styles.switchRow}>
          <Text>是否绝育</Text>
          <Switch value={sterilized} onValueChange={setSterilized} />
        </View>
        <Text style={styles.label}>健康状态</Text>
        <SegmentedButtons
          value={healthStatus}
          onValueChange={setHealthStatus}
          buttons={[
            { value: "健康", label: "健康" },
            { value: "亚健康", label: "亚健康" },
            { value: "需要治疗", label: "需要治疗" },
          ]}
          style={styles.segmentedButtons}
        />
      </Surface>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={submitting}
        disabled={submitting}
      >
        发布
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  imageSection: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  formSection: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1a237e",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  submitButton: {
    margin: 16,
    marginBottom: 32,
  },
});

export default PublishScreen;
