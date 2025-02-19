import * as React from "react";
import { Alert } from "react-native";

export const usePublishForm = (user, addPublication, navigation) => {
  const [formData, setFormData] = React.useState({
    images: [],
    petName: "",
    petType: "cat",
    otherType: "",
    breed: "",
    age: "",
    gender: "male",
    description: "",
    requirements: "",
    vaccinated: false,
    sterilized: false,
    healthStatus: "健康",
    customBreed: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState({});

  const updateField = React.useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = React.useCallback(() => {
    const {
      petName,
      breed,
      customBreed,
      age,
      description,
      requirements,
      images,
      petType,
      otherType,
    } = formData;

    // 检查基本必填项
    if (
      !petName ||
      !age ||
      !description ||
      !requirements ||
      images.length === 0
    ) {
      Alert.alert("提示", "请填写所有必填项");
      return false;
    }

    // 检查品种信息
    if (petType === "other") {
      if (!otherType) {
        Alert.alert("提示", "请选择动物类型");
        return false;
      }
      if (!customBreed) {
        Alert.alert("提示", "请输入品种");
        return false;
      }
    } else {
      if (!breed) {
        Alert.alert("提示", "请选择品种");
        return false;
      }
    }

    if (!user?.profile?.address) {
      Alert.alert("提示", "发布前请先设置您的地址", [
        {
          text: "取消",
          style: "cancel",
        },
        {
          text: "去设置",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "ProfileTab",
                  params: {
                    screen: "Profile",
                  },
                },
              ],
            });
          },
        },
      ]);
      return false;
    }

    return true;
  }, [formData, user?.profile?.address, navigation]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 验证表单
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // 构建发布数据
      const publicationData = {
        petName: formData.petName,
        type: formData.petType,
        breed:
          formData.petType === "other" ? formData.customBreed : formData.breed,
        age: formData.age,
        gender: formData.gender,
        description: formData.description,
        requirements: formData.requirements,
        images: formData.images,
        medical: {
          vaccinated: formData.vaccinated,
          sterilized: formData.sterilized,
          healthStatus: formData.healthStatus,
        },
      };

      // 如果是其他类型的宠物，添加具体类型
      if (formData.petType === "other") {
        publicationData.otherType = formData.otherType;
      }

      console.log("准备发布的数据:", publicationData);

      // 发布宠物信息
      await addPublication(publicationData);

      // 显示发布成功弹窗
      Alert.alert(
        "发布成功",
        "您的宠物信息已成功发布",
        [
          {
            text: "确定",
            onPress: () => {
              // 发布成功后跳转
              navigation.navigate("Main", {
                screen: "ProfileTab",
                params: {
                  screen: "MyPublications",
                  params: {
                    refresh: Date.now(),
                  },
                },
              });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("发布失败:", error);
      Alert.alert("发布失败", error.message || "请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    showDialog,
    setShowDialog,
    updateField,
    handleSubmit,
    setLoading,
    formErrors,
  };
};
