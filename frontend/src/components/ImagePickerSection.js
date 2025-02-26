import React, { useState } from "react";
import { View, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Text, ActivityIndicator, ProgressBar } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "../config";

const ImagePickerSection = ({ images, onImagesChange }) => {
  const [uploadStatus, setUploadStatus] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  const uploadImage = async (uri) => {
    const formData = new FormData();
    const filename = uri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";

    formData.append("image", {
      uri,
      name: filename,
      type,
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = event.loaded / event.total;
          setUploadProgress((prev) => ({
            ...prev,
            [uri]: progress,
          }));
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } else {
            reject(new Error("上传失败"));
          }
        }
      };

      xhr.open("POST", `${API_URL}/upload`);
      xhr.send(formData);
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setUploadStatus((prev) => ({ ...prev, [uri]: "uploading" }));

        try {
          const url = await uploadImage(uri);
          onImagesChange([...images, url]);
          setUploadStatus((prev) => ({ ...prev, [uri]: "success" }));
        } catch (error) {
          setUploadStatus((prev) => ({ ...prev, [uri]: "error" }));
          Alert.alert("错误", "图片上传失败，请重试");
        }
      }
    } catch (error) {
      Alert.alert("错误", "选择图片失败，请重试");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("错误", "需要相机权限才能拍照");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setUploadStatus((prev) => ({ ...prev, [uri]: "uploading" }));

        try {
          const url = await uploadImage(uri);
          onImagesChange([...images, url]);
          setUploadStatus((prev) => ({ ...prev, [uri]: "success" }));
        } catch (error) {
          setUploadStatus((prev) => ({ ...prev, [uri]: "error" }));
          Alert.alert("错误", "图片上传失败，请重试");
        }
      }
    } catch (error) {
      Alert.alert("错误", "拍照失败，请重试");
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageGrid}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
            {uploadStatus[image] === "uploading" && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="white" />
                <Text style={styles.uploadText}>上传中...</Text>
                <ProgressBar
                  progress={uploadProgress[image] || 0}
                  color="white"
                  style={styles.progressBar}
                />
              </View>
            )}
          </View>
        ))}
        {images.length < 4 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={24} color="#666" />
              <Text style={styles.buttonText}>从相册选择</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={takePhoto}>
              <MaterialIcons name="camera-alt" size={24} color="#666" />
              <Text style={styles.buttonText}>拍照</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
  },
  buttonContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  addButton: {
    alignItems: "center",
    marginVertical: 4,
  },
  buttonText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    color: "white",
    marginTop: 8,
    fontSize: 12,
  },
  progressBar: {
    width: "80%",
    height: 2,
    marginTop: 8,
  },
});
