import * as React from "react";
import { View, StyleSheet, Image, Alert, Platform } from "react-native";
import {
  IconButton,
  ActivityIndicator,
  useTheme,
  Text,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ImagePickerSection = React.memo(
  ({ images, setImages, loading, setLoading }) => {
    const theme = useTheme();
    const [uploadProgress, setUploadProgress] = React.useState({});
    const [uploadStatus, setUploadStatus] = React.useState({});

    const uploadImage = async (imageUri) => {
      try {
        if (imageUri.startsWith("http")) {
          return imageUri;
        }

        const formData = new FormData();
        const imageFile = {
          uri: imageUri,
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
                [imageUri]: percentComplete,
              }));
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              if (response.url) {
                setUploadStatus((prev) => ({
                  ...prev,
                  [imageUri]: "success",
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

        setUploadStatus((prev) => ({
          ...prev,
          [imageUri]: "uploading",
        }));

        const url = await promise;
        return url;
      } catch (error) {
        setUploadStatus((prev) => ({
          ...prev,
          [imageUri]: "error",
        }));
        throw error;
      }
    };

    const pickImage = async () => {
      try {
        if (images.length >= 5) {
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
          setLoading(true);
          try {
            const uploadedUrl = await uploadImage(result.assets[0].uri);
            setImages([...images, uploadedUrl]);
          } catch (error) {
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
        if (images.length >= 5) {
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
          setLoading(true);
          try {
            const uploadedUrl = await uploadImage(result.assets[0].uri);
            setImages([...images, uploadedUrl]);
          } catch (error) {
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
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
      },
      [images, setImages]
    );

    return (
      <View style={styles.container}>
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={uri} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
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
          {images.length < 5 && (
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  successOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  errorOverlay: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
  },
  uploadProgressText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
});

ImagePickerSection.displayName = "ImagePickerSection";

export default ImagePickerSection;
