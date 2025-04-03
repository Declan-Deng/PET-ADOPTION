import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";

export const usePublishForm = (
  user,
  submitFunction,
  navigation,
  initialData = null
) => {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const initialFormData = {
    images: [],
    petName: "",
    type: "cat",
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

  const [formData, setFormData] = useState(initialData || initialFormData);

  // 当初始数据加载完成后更新表单
  useEffect(() => {
    if (initialData) {
      console.log("初始化表单数据:", initialData);
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = () => {
    const errors = {};

    if (formData.images.length === 0) {
      errors.images = "请至少上传一张图片";
    }

    if (!formData.petName.trim()) {
      errors.petName = "请输入宠物名称";
    }

    if (!formData.type) {
      errors.type = "请选择宠物类型";
    }

    if (!formData.breed) {
      errors.breed = "请选择品种";
    }

    // 检查自定义品种
    if (
      (formData.type === "cat" && formData.breed === "其他猫咪") ||
      (formData.type === "dog" && formData.breed === "其他狗狗") ||
      (formData.type === "other" && formData.breed === "其他")
    ) {
      if (!formData.customBreed.trim()) {
        errors.customBreed = "请输入具体品种";
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
    console.log("更新表单字段:", field, value);
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

      // 确定最终的品种值
      let finalBreed = formData.breed;
      if (
        (formData.type === "cat" && formData.breed === "其他猫咪") ||
        (formData.type === "dog" && formData.breed === "其他狗狗") ||
        (formData.type === "other" && formData.breed === "其他")
      ) {
        finalBreed = formData.customBreed;
      }

      // 构建发布/更新数据
      const petData = {
        petName: formData.petName,
        type: formData.type,
        breed: finalBreed,
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

      // 提交表单数据（发布或更新）
      await submitFunction(petData);

      // 如果是发布模式，重置表单数据
      if (!initialData) {
        resetForm();
      }

      // 导航逻辑由调用者处理
    } catch (error) {
      console.error("操作失败:", error);
      Alert.alert("操作失败", error.message || "请稍后重试");
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
