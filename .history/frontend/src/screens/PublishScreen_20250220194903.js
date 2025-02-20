import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
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
  const [uploadProgress, setUploadProgress] = React.useState({});
  const [uploadStatus, setUploadStatus] = React.useState({});

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

  const uploadImage = async (imageUri, index) => {
    try {
      // 如果已经是网络URL，直接返回
      if (imageUri.startsWith("http")) {
        return imageUri;
      }

      // 更新上传状态
      setUploadStatus((prev) => ({
        ...prev,
        [index]: "uploading",
      }));
      setUploadProgress((prev) => ({
        ...prev,
        [index]: 0,
      }));

      const formData = new FormData();
      const imageFile = {
        uri: imageUri,
        type: "image/jpeg",
        name: `pet-image-${index + 1}.jpg`,
      };
      formData.append("image", imageFile);

      const token = await AsyncStorage.getItem("userToken");
      console.log(`开始上传第 ${index + 1} 张图片...`);

      const xhr = new XMLHttpRequest();
      const promise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress((prev) => ({
              ...prev,
              [index]: percentComplete,
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.url) {
              setUploadStatus((prev) => ({
                ...prev,
                [index]: "success",
              }));
              resolve(response.url);
            } else {
              reject(new Error("上传失败：服务器返回的URL无效"));
            }
          } else {
            reject(new Error(`上传失败：${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("网络错误"));
        };
      });

      xhr.open("POST", "http://192.168.3.74:5001/api/upload/image");
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);

      const url = await promise;
      return url;
    } catch (error) {
      setUploadStatus((prev) => ({
        ...prev,
        [index]: "error",
      }));
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setSubmitting(true);
      console.log("开始上传图片...");

      // 上传所有图片
      const uploadedImageUrls = await Promise.all(
        images.map((imageUri, index) => uploadImage(imageUri, index))
      );

      console.log("所有图片上传完成，URLs:", uploadedImageUrls);

      // 验证所有图片URL是否有效
      if (uploadedImageUrls.some((url) => !url || !url.startsWith("http"))) {
        throw new Error("存在无效的图片URL");
      }

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

      console.log("准备提交宠物数据:", petData);
      const result = await addPublication(petData);
      console.log("发布成功，返回数据:", result);

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

  const renderImageItem = (uri, index) => (
    <View key={index} style={styles.imageWrapper}>
      <Image source={{ uri }} style={styles.image} />
      <IconButton
        icon="close-circle"
        size={20}
        style={styles.removeButton}
        onPress={() => removeImage(index)}
      />
      {uploadStatus[index] === "uploading" && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.uploadProgressText}>
            {Math.round(uploadProgress[index])}%
          </Text>
        </View>
      )}
      {uploadStatus[index] === "success" && (
        <View style={[styles.uploadOverlay, styles.successOverlay]}>
          <IconButton icon="check-circle" size={30} color="#4CAF50" />
        </View>
      )}
      {uploadStatus[index] === "error" && (
        <View style={[styles.uploadOverlay, styles.errorOverlay]}>
          <IconButton icon="alert-circle" size={30} color="#f44336" />
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.imageSection} elevation={1}>
        <Text style={styles.sectionTitle}>上传图片</Text>
        <View style={styles.imageContainer}>
          {images.map((uri, index) => renderImageItem(uri, index))}
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
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  successOverlay: {
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  errorOverlay: {
    backgroundColor: "rgba(255,0,0,0.2)",
  },
  uploadProgressText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PublishScreen;
