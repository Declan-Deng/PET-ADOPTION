import * as React from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { IconButton, ActivityIndicator, useTheme } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

const ImagePickerSection = React.memo(
  ({ images, setImages, loading, setLoading }) => {
    const theme = useTheme();

    const handleImagePickerError = React.useCallback(
      (error) => {
        console.error("Image picker error:", error);
        Alert.alert("出错了", "选择图片时出现错误，请重试。", [
          { text: "确定" },
        ]);
        setLoading(false);
      },
      [setLoading]
    );

    const requestPermissions = React.useCallback(async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "需要权限",
          "请在设置中允许访问相机和相册，以便上传宠物照片。",
          [{ text: "确定" }]
        );
        return false;
      }
      return true;
    }, []);

    const pickImage = React.useCallback(async () => {
      try {
        if (!(await requestPermissions())) return;

        setLoading(true);
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.8,
          selectionLimit: 5,
          allowsEditing: false,
        });

        if (!result.canceled) {
          const newImages = [...images];
          result.assets.forEach((asset) => {
            if (newImages.length < 5) {
              const uri = asset.uri.startsWith("file://")
                ? asset.uri
                : `file://${asset.uri}`;
              newImages.push(uri);
            }
          });
          setImages(newImages);
        }
      } catch (error) {
        handleImagePickerError(error);
      } finally {
        setLoading(false);
      }
    }, [
      images,
      setImages,
      setLoading,
      handleImagePickerError,
      requestPermissions,
    ]);

    const takePhoto = React.useCallback(async () => {
      try {
        if (!(await requestPermissions())) return;

        setLoading(true);
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
          aspect: [4, 3],
        });

        if (!result.canceled && images.length < 5) {
          const uri = result.assets[0].uri.startsWith("file://")
            ? result.assets[0].uri
            : `file://${result.assets[0].uri}`;
          setImages([...images, uri]);
        }
      } catch (error) {
        handleImagePickerError(error);
      } finally {
        setLoading(false);
      }
    }, [
      images,
      setImages,
      setLoading,
      handleImagePickerError,
      requestPermissions,
    ]);

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
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
});

ImagePickerSection.displayName = "ImagePickerSection";

export default ImagePickerSection;
