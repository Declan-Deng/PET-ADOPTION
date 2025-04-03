import * as React from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  SegmentedButtons,
  Switch,
  Surface,
  Text,
  ActivityIndicator,
  Portal,
  Dialog,
  HelperText,
  Divider,
  Appbar,
  RadioButton,
  useTheme,
  Menu,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePickerSection from "./ImagePickerSection";
import { usePublishForm } from "../../hooks/usePublishForm";
import { breedData, otherPetTypes } from "../../constants/breedData";
import { API_ENDPOINTS } from "../../config";

const { width } = Dimensions.get("window");

const EditPetScreen = ({ navigation, route }) => {
  const { petId } = route.params || {};
  const theme = useTheme();
  const { user } = React.useContext(UserContext);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [petData, setPetData] = React.useState(null);
  const [error, setError] = React.useState("");

  // 在加载宠物详情后初始化表单
  const [initialFormData, setInitialFormData] = React.useState(null);

  // 品种选择器状态
  const [showBreedMenu, setShowBreedMenu] = React.useState(false);
  const [showOtherPetTypeMenu, setShowOtherPetTypeMenu] = React.useState(false);
  const [currentBreeds, setCurrentBreeds] = React.useState([]);
  const [breedError, setBreedError] = React.useState("");
  const [isLoadingBreeds, setIsLoadingBreeds] = React.useState(false);

  // 动画值
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  // 首先获取宠物详情
  React.useEffect(() => {
    const fetchPetDetails = async () => {
      if (!petId) {
        setError("缺少宠物ID");
        setInitialLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          throw new Error("登录已过期，请重新登录");
        }

        const response = await fetch(API_ENDPOINTS.PET_DETAIL(petId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`获取宠物详情失败: ${response.status}`);
        }

        const responseJson = await response.json();
        console.log("API响应:", responseJson);

        if (!responseJson.data) {
          throw new Error("服务器返回数据结构异常");
        }

        const data = responseJson.data;
        if (!data || !data.petName) {
          throw new Error("获取的宠物数据不完整");
        }

        setPetData(data);

        // 处理特殊品种（如果不在预设列表中）
        let finalBreed = data.breed;
        let customBreed = "";

        if (data.type === "cat") {
          const catBreedValues = breedData.cat.map((item) => item.value);
          if (!catBreedValues.includes(data.breed)) {
            finalBreed = "其他猫咪";
            customBreed = data.breed;
          }
        } else if (data.type === "dog") {
          const dogBreedValues = breedData.dog.map((item) => item.value);
          if (!dogBreedValues.includes(data.breed)) {
            finalBreed = "其他狗狗";
            customBreed = data.breed;
          }
        } else if (data.type === "other") {
          const otherTypeValues = otherPetTypes.map((item) => item.value);
          if (!otherTypeValues.includes(data.breed)) {
            finalBreed = "其他";
            customBreed = data.breed;
          }
        }

        // 设置初始表单数据
        const formInitData = {
          images: data.images || [],
          petName: data.petName || "",
          type: data.type || "cat",
          breed: finalBreed,
          customBreed: customBreed,
          otherType: data.type === "other" ? data.breed : "",
          age: data.age ? data.age.toString() : "",
          gender: data.gender || "",
          description: data.description || "",
          requirements: data.requirements || "",
          vaccinated: data.medical?.vaccinated || false,
          sterilized: data.medical?.sterilized || false,
          healthStatus: data.medical?.healthStatus || "健康",
        };

        setInitialFormData(formInitData);
      } catch (error) {
        console.error("获取宠物详情失败:", error);
        setError(error.message || "获取宠物详情失败");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPetDetails();
  }, [petId]);

  // 使用usePublishForm钩子，传入编辑模式参数
  const handleUpdatePet = async (petData) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("登录已过期，请重新登录");
      }

      const response = await fetch(API_ENDPOINTS.PET_DETAIL(petId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "更新失败");
      }

      const result = await response.json();
      console.log("更新结果:", result);

      Alert.alert("成功", "宠物信息已更新", [
        {
          text: "确定",
          onPress: () => {
            // 返回上一页并传递刷新标记
            navigation.navigate("MyPublications", { refresh: true });
          },
        },
      ]);
    } catch (error) {
      console.error("更新失败:", error);
      throw error;
    }
  };

  const {
    formData,
    loading,
    showDialog,
    setShowDialog,
    updateField,
    handleSubmit,
    setLoading,
    formErrors,
  } = usePublishForm(
    user,
    handleUpdatePet,
    navigation,
    initialFormData // 传入初始表单数据
  );

  // 每次类型改变时更新品种列表
  React.useEffect(() => {
    if (!formData.type) return;

    console.log("宠物类型改变:", formData.type);
    setBreedError("");
    setIsLoadingBreeds(true);

    try {
      if (formData.type === "cat" || formData.type === "dog") {
        const breeds = breedData[formData.type] || [];
        console.log("当前品种列表:", breeds);
        if (breeds.length === 0) {
          setBreedError("获取品种列表失败");
        } else {
          setCurrentBreeds(breeds);
        }
      } else if (formData.type === "other") {
        console.log("其他宠物类型，使用 otherPetTypes");
        setCurrentBreeds(otherPetTypes);
      }
    } catch (error) {
      console.error("获取品种列表错误:", error);
      setBreedError("获取品种列表时出错");
    } finally {
      setIsLoadingBreeds(false);
    }
  }, [formData.type]);

  // 处理品种选择菜单的显示
  const handleBreedMenuOpen = React.useCallback(() => {
    console.log("打开品种选择菜单");
    if (isLoadingBreeds) {
      console.log("品种列表加载中...");
      return;
    }
    if (breedError) {
      console.log("品种列表加载失败:", breedError);
      return;
    }
    if (!formData.type) {
      console.log("未选择宠物类型");
      setBreedError("请先选择宠物类型");
      return;
    }
    console.log("当前宠物类型:", formData.type);
    console.log("可用品种列表:", currentBreeds);
    setShowBreedMenu(true);
  }, [formData.type, currentBreeds, isLoadingBreeds, breedError]);

  // 处理品种选择
  const handleBreedSelect = React.useCallback(
    (breed) => {
      console.log("选择品种:", breed);
      updateField("breed", breed);
      updateField("customBreed", "");
      setShowBreedMenu(false);
    },
    [updateField]
  );

  // 处理其他宠物类型选择
  const handleOtherPetTypeSelect = React.useCallback(
    (type) => {
      console.log("选择其他宠物类型:", type);
      updateField("breed", type.value);
      updateField("customBreed", "");
      setShowOtherPetTypeMenu(false);
    },
    [updateField]
  );

  // 检查是否需要显示自定义品种输入框
  const shouldShowCustomBreed = React.useMemo(() => {
    if (!formData.breed) return false;
    if (formData.type === "cat" && formData.breed === "其他猫咪") return true;
    if (formData.type === "dog" && formData.breed === "其他狗狗") return true;
    if (formData.type === "other" && formData.breed === "其他") return true;
    return false;
  }, [formData.type, formData.breed]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY }, { scale: scaleAnim }],
  };

  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>加载宠物信息...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          返回
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="编辑宠物信息" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, animatedStyle]}>
          <Surface style={styles.surface} elevation={2}>
            <ImagePickerSection
              images={formData.images}
              setImages={(images) => updateField("images", images)}
              loading={loading}
              setLoading={setLoading}
            />

            <View style={styles.formSection}>
              <TextInput
                label="宠物名称"
                value={formData.petName}
                onChangeText={(text) => updateField("petName", text)}
                style={styles.input}
                mode="outlined"
                error={formErrors.petName}
              />

              <SegmentedButtons
                value={formData.type || "cat"}
                onValueChange={(value) => {
                  console.log("切换宠物类型:", value);
                  updateField("type", value);
                  updateField("breed", "");
                  setShowBreedMenu(false);
                }}
                style={styles.segmentedButtons}
                buttons={[
                  { value: "cat", label: "猫咪" },
                  { value: "dog", label: "狗狗" },
                  { value: "other", label: "其他" },
                ]}
              />

              <Menu
                visible={showBreedMenu}
                onDismiss={() => setShowBreedMenu(false)}
                anchor={
                  <TextInput
                    label="品种"
                    value={formData.breed}
                    onFocus={handleBreedMenuOpen}
                    style={styles.input}
                    mode="outlined"
                    editable={true}
                    error={!!breedError || formErrors.breed}
                    right={
                      <TextInput.Icon
                        icon={isLoadingBreeds ? "loading" : "menu-down"}
                        disabled={isLoadingBreeds}
                      />
                    }
                  />
                }
                style={styles.breedMenu}
              >
                <ScrollView style={styles.breedMenuScroll}>
                  {breedError ? (
                    <Menu.Item title={breedError} disabled />
                  ) : (
                    currentBreeds.map((breed) => (
                      <Menu.Item
                        key={breed.value}
                        onPress={() => handleBreedSelect(breed.value)}
                        title={breed.label}
                      />
                    ))
                  )}
                </ScrollView>
              </Menu>

              {shouldShowCustomBreed && (
                <TextInput
                  label="具体品种"
                  value={formData.customBreed}
                  onChangeText={(text) => updateField("customBreed", text)}
                  style={styles.input}
                  mode="outlined"
                  error={formErrors.customBreed}
                />
              )}

              <TextInput
                label="年龄"
                value={formData.age}
                onChangeText={(text) => updateField("age", text)}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                error={formErrors.age}
              />

              <SegmentedButtons
                value={formData.gender}
                onValueChange={(value) => updateField("gender", value)}
                buttons={[
                  { value: "male", label: "公" },
                  { value: "female", label: "母" },
                  { value: "unknown", label: "未知" },
                ]}
                style={styles.segmentedButtons}
                error={formErrors.gender}
              />

              <TextInput
                label="描述"
                value={formData.description}
                onChangeText={(text) => updateField("description", text)}
                multiline
                numberOfLines={4}
                style={styles.input}
                mode="outlined"
                error={formErrors.description}
              />

              <TextInput
                label="领养要求"
                value={formData.requirements}
                onChangeText={(text) => updateField("requirements", text)}
                multiline
                numberOfLines={4}
                style={styles.input}
                mode="outlined"
                error={formErrors.requirements}
              />

              <Divider style={styles.divider} />

              <Text variant="titleMedium" style={styles.sectionTitle}>
                健康信息
              </Text>

              <View style={styles.switchRow}>
                <Text>已接种疫苗</Text>
                <Switch
                  value={formData.vaccinated}
                  onValueChange={(value) => updateField("vaccinated", value)}
                />
              </View>

              <View style={styles.switchRow}>
                <Text>已绝育</Text>
                <Switch
                  value={formData.sterilized}
                  onValueChange={(value) => updateField("sterilized", value)}
                />
              </View>

              <RadioButton.Group
                onValueChange={(value) => updateField("healthStatus", value)}
                value={formData.healthStatus}
              >
                <Text style={styles.radioLabel}>健康状况</Text>
                <View style={styles.radioGroup}>
                  <View style={styles.radioItem}>
                    <RadioButton value="健康" />
                    <Text>健康</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="亚健康" />
                    <Text>亚健康</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="需要治疗" />
                    <Text>需要治疗</Text>
                  </View>
                </View>
              </RadioButton.Group>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={loading}
                loading={loading}
              >
                保存修改
              </Button>
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>提示</Dialog.Title>
          <Dialog.Content>
            <Text>请填写所有必填信息并至少上传一张图片。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    width: "100%",
  },
  surface: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  formSection: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  radioLabel: {
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  breedMenu: {
    width: width - 64,
    maxHeight: 300,
  },
  breedMenuScroll: {
    maxHeight: 250,
  },
});

export default EditPetScreen;
