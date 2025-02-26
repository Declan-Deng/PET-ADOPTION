import * as React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, Avatar, useTheme } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../../context/UserContext";

const EditProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, updateProfile } = React.useContext(UserContext);
  const [name, setName] = React.useState(user?.profile?.name || "");
  const [email, setEmail] = React.useState(user?.profile?.email || "");
  const [phone, setPhone] = React.useState(user?.profile?.phone || "");
  const [address, setAddress] = React.useState(user?.profile?.address || "");
  const [avatar, setAvatar] = React.useState(user?.profile?.avatar || null);
  const [loading, setLoading] = React.useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newAvatarUri = result.assets[0].uri;
        console.log("Selected avatar URI:", newAvatarUri);
        setAvatar(newAvatarUri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("错误", "选择图片时出现错误，请重试");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("提示", "请输入昵称");
      return;
    }

    setLoading(true);
    try {
      console.log("Current avatar before save:", avatar);
      const updatedProfile = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar: avatar,
      };

      console.log("Updating profile with:", updatedProfile);
      await updateProfile(updatedProfile);
      Alert.alert("成功", "个人资料已更新", [
        { text: "确定", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Save profile error:", error);
      Alert.alert("错误", "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Avatar.Image
            size={100}
            source={{ uri: avatar }}
            style={styles.avatar}
            onError={(e) => {
              console.log("头像加载失败，URL:", avatar);
              console.log("错误详情:", e.nativeEvent.error);
              // 如果是本地文件URL，保持显示
              if (!avatar.startsWith("file://")) {
                setAvatar(null);
              }
            }}
          />
        ) : (
          <Avatar.Text
            size={100}
            label={name.substring(0, 2).toUpperCase()}
            style={styles.avatar}
          />
        )}
        <Button
          mode="outlined"
          onPress={pickImage}
          style={styles.changeAvatarButton}
        >
          更换头像
        </Button>
      </View>

      <View style={styles.form}>
        <TextInput
          label="昵称"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="邮箱"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="手机号"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
        />

        <TextInput
          label="地址"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
          multiline
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          disabled={loading}
        >
          保存
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    marginBottom: 10,
  },
  changeAvatarButton: {
    marginTop: 10,
  },
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 10,
    paddingVertical: 6,
  },
});

export default EditProfileScreen;
