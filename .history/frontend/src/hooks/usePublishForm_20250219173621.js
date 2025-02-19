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
  });

  const [loading, setLoading] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState({});

  const updateField = React.useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = React.useCallback(() => {
    const { petName, breed, age, description, requirements, images } = formData;

    if (
      !petName ||
      !breed ||
      !age ||
      !description ||
      !requirements ||
      images.length === 0
    ) {
      Alert.alert("提示", "请填写所有必填项");
      return false;
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
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
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

      // 发布宠物信息
      await addPublication(publicationData);

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
