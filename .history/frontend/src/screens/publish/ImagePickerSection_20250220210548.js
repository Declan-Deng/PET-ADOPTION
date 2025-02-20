import * as React from "react";
import { View, StyleSheet, Image, Alert, Platform } from "react-native";
import {
  IconButton,
  useTheme,
  Text,
  ActivityIndicator,
  Snackbar,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ImagePickerSection = React.memo(
  ({ images, setImages, loading, setLoading }) => {
    const theme = useTheme();
    const [uploadProgress, setUploadProgress] = React.useState({});
    const [uploadStatus, setUploadStatus] = React.useState({});
    const [localImages, setLocalImages] = React.useState([]);
    const [snackbarVisible, setSnackbarVisible] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");

    const showSnackbar = (message) => {
      setSnackbarMessage(message);
      setSnackbarVisible(true);
    };

    // 验证图片URL是否可访问
    const verifyImageUrl = async (url) => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("图片URL可以正常访问:", url);
        return true;
      } catch (error) {
        console.error("图片URL无法访问:", url, error);
        showSnackbar("警告：图片URL可能无法正常访问");
        return false;
      }
    };

    // 上传单张图片
    const uploadImage = async (localUri) => {
      try {
        console.log("开始上传图片:", localUri);
        showSnackbar("开始上传图片...");

        const formData = new FormData();
        const imageFile = {
          uri: localUri,
          type: "image/jpeg",
          name: `pet-image-${Date.now()}.jpg`,
        };
        formData.append("image", imageFile);

        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          throw new Error("未登录");
        }

        const xhr = new XMLHttpRequest();
        const promise = new Promise((resolve, reject) => {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setUploadProgress((prev) => ({
                ...prev,
                [localUri]: percentComplete,
              }));
              if (percentComplete === 100) {
                showSnackbar("图片处理中...");
              }
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              if (response.url) {
                console.log("图片上传成功，服务器返回URL:", response.url);
                const fullUrl = response.url.startsWith("http")
                  ? response.url
                  : `http://192.168.3.74:5001${response.url}`;
                console.log("处理后的完整URL:", fullUrl);
                setUploadStatus((prev) => ({
                  ...prev,
                  [localUri]: "success",
                }));
                showSnackbar("图片上传成功！");
                resolve(fullUrl);
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

        setUploadStatus((prev) => ({
          ...prev,
          [localUri]: "uploading",
        }));

        const serverUrl = await promise;

        // 验证上传后的URL是否可访问
        await verifyImageUrl(serverUrl);

        return serverUrl;
      } catch (error) {
        console.error("图片上传失败:", error);
        setUploadStatus((prev) => ({
          ...prev,
          [localUri]: "error",
        }));
        showSnackbar(`上传失败：${error.message}`);
        throw error;
      }
    };

    const pickImage = async () => {
      try {
        if (localImages.length >= 5) {
          Alert.alert("提示", "最多只能上传5张图片");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
          const localUri = result.assets[0].uri;
          console.log("选择的本地图片URI:", localUri);

          // 先添加本地图片用于预览
          setLocalImages((prev) => [...prev, localUri]);

          try {
            setLoading(true);
            // 开始上传
            const serverUrl = await uploadImage(localUri);
            console.log("获取到服务器URL:", serverUrl);

            // 上传成功后，将服务器URL添加到images数组
            setImages((prev) => [...prev, serverUrl]);
          } catch (error) {
            // 上传失败，从本地预览中移除
            setLocalImages((prev) => prev.filter((uri) => uri !== localUri));
            Alert.alert("错误", error.message || "上传图片失败");
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("选择图片失败:", error);
        Alert.alert("错误", "选择图片失败");
      }
    };

    const takePhoto = async () => {
      try {
        if (localImages.length >= 5) {
          Alert.alert("提示", "最多只能上传5张图片");
          return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("提示", "需要相机权限才能拍照");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
          const localUri = result.assets[0].uri;
          console.log("拍摄的照片URI:", localUri);

          // 先添加本地图片用于预览
          setLocalImages((prev) => [...prev, localUri]);

          try {
            setLoading(true);
            // 开始上传
            const serverUrl = await uploadImage(localUri);
            console.log("获取到服务器URL:", serverUrl);

            // 上传成功后，将服务器URL添加到images数组
            setImages((prev) => [...prev, serverUrl]);
          } catch (error) {
            // 上传失败，从本地预览中移除
            setLocalImages((prev) => prev.filter((uri) => uri !== localUri));
            Alert.alert("错误", error.message || "上传图片失败");
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("拍照失败:", error);
        Alert.alert("错误", "拍照失败");
      }
    };

    const removeImage = React.useCallback(
      (index) => {
        // 同时移除本地预览和服务器图片
        const newLocalImages = [...localImages];
        const newImages = [...images];
        newLocalImages.splice(index, 1);
        newImages.splice(index, 1);
        setLocalImages(newLocalImages);
        setImages(newImages);
        showSnackbar("已删除图片");
      },
      [localImages, images, setImages]
    );

    return (
      <View style={styles.container}>
        <View style={styles.imageGrid}>
          {localImages.map((uri, index) => (
            <View key={uri} style={styles.imageWrapper}>
              <Image
                source={{ uri }}
                style={styles.image}
                onError={(e) => {
                  console.error("图片加载错误:", e.nativeEvent.error);
                  showSnackbar("图片加载失败");
                }}
              />
              <IconButton
                icon="close-circle"
                size={20}
                iconColor={theme.colors.error}
                onPress={() => removeImage(index)}
                style={styles.removeButton}
              />
              {uploadStatus[uri] === "uploading" && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                  <Text style={styles.uploadProgressText}>
                    {Math.round(uploadProgress[uri] || 0)}%
                  </Text>
                </View>
              )}
              {uploadStatus[uri] === "success" && (
                <View style={[styles.uploadOverlay, styles.successOverlay]}>
                  <IconButton icon="check-circle" size={30} color="#4CAF50" />
                </View>
              )}
              {uploadStatus[uri] === "error" && (
                <View style={[styles.uploadOverlay, styles.errorOverlay]}>
                  <IconButton icon="alert-circle" size={30} color="#f44336" />
                </View>
              )}
            </View>
          ))}
          {localImages.length < 5 && (
            <View style={styles.buttonContainer}>
              <IconButton
                icon="camera"
                size={30}
                onPress={takePhoto}
                mode="contained"
                style={styles.addButton}
                disabled={loading}
              />
              <IconButton
                icon="image-multiple"
                size={30}
                onPress={pickImage}
                mode="contained"
                style={styles.addButton}
                disabled={loading}
              />
            </View>
          )}
        </View>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageWrapper: {
    position: "relative",
    width: 100,
    height: 100,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
  snackbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

ImagePickerSection.displayName = "ImagePickerSection";

export default ImagePickerSection;
