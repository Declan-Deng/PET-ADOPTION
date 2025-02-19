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

  const validateForm = () => {
    const errors = [];

    if (!formData.petName?.trim()) {
      errors.push("请填写宠物昵称");
    }

    // 处理品种验证逻辑
    if (formData.petType === "other") {
      if (!formData.otherType?.trim()) {
        errors.push("请填写其他宠物类型");
      }
    } else if (!formData.breed?.trim()) {
      errors.push("请填写宠物品种");
    }

    if (!formData.age?.trim()) {
      errors.push("请填写宠物年龄");
    }
    if (!formData.gender) {
      errors.push("请选择宠物性别");
    }
    if (!formData.petType) {
      errors.push("请选择宠物类型");
    }
    if (!formData.description?.trim()) {
      errors.push("请填写宠物描述");
    }
    if (!formData.requirements?.trim()) {
      errors.push("请填写领养要求");
    }
    if (!formData.images || formData.images.length === 0) {
      errors.push("请至少上传一张宠物照片");
    }

    if (errors.length > 0) {
      Alert.alert("提交失败", errors.join("\n"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 构建发布数据
      const publicationData = {
        petName: formData.petName,
        type: formData.petType,
        breed:
          formData.petType === "other" ? formData.otherType : formData.breed,
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

      console.log("准备发布的数据:", publicationData);

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
