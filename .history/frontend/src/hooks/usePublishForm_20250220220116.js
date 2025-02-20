import { useState, useCallback } from "react";
import { Alert } from "react-native";

export const usePublishForm = (user, addPublication, navigation) => {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const initialFormData = {
    images: [],
    petName: "",
    petType: "",
    breed: "",
    customBreed: "",
    otherType: "",
    age: "",
    gender: "",
    description: "",
    requirements: "",
    vaccinated: false,
    sterilized: false,
    healthStatus: "健康",
  };

  const [formData, setFormData] = useState(initialFormData);

  const validateForm = () => {
    const errors = {};

    if (formData.images.length === 0) {
      errors.images = "请至少上传一张图片";
    }

    if (!formData.petName.trim()) {
      errors.petName = "请输入宠物名称";
    }

    if (!formData.petType) {
      errors.petType = "请选择宠物类型";
    }

    if (formData.petType === "other") {
      if (!formData.otherType) {
        errors.otherType = "请选择其他宠物类型";
      }
      if (!formData.customBreed.trim()) {
        errors.customBreed = "请输入品种";
      }
    } else {
      if (!formData.breed) {
        errors.breed = "请选择品种";
      }
    }

    if (
      !formData.age.trim() ||
      isNaN(formData.age) ||
      Number(formData.age) <= 0
    ) {
      errors.age = "请输入有效的年龄";
    }

    if (!formData.gender) {
      errors.gender = "请选择性别";
    }

    if (!formData.description.trim()) {
      errors.description = "请输入描述";
    }

    if (!formData.requirements.trim()) {
      errors.requirements = "请输入领养要求";
    }

    if (Object.keys(errors).length > 0) {
      setShowDialog(true);
    }

    return errors;
  };

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // 清除相关字段的错误
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setFormErrors({});
    setShowDialog(false);
  }, []);

  const handleSubmit = async () => {
    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setLoading(true);

      // 构建发布数据
      const publicationData = {
        petName: formData.petName,
        type: formData.petType,
        breed:
          formData.petType === "other" ? formData.customBreed : formData.breed,
        age: parseInt(formData.age),
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

      // 重置表单数据
      resetForm();

      // 修改导航逻辑，确保正确跳转到"我的发布"页面
      navigation.reset({
        index: 1,
        routes: [
          {
            name: "Main",
            params: {
              screen: "ProfileTab",
              params: {
                screen: "Profile",
              },
            },
          },
          {
            name: "MyPublications",
            params: { refresh: true },
          },
        ],
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
    resetForm,
  };
};
