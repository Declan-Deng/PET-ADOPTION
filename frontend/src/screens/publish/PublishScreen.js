import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Surface,
  SegmentedButtons,
  Portal,
  Dialog,
  Divider,
  Switch,
  RadioButton,
  useTheme,
  Menu,
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import { usePublishForm } from "../../hooks/usePublishForm";
import ImagePickerSection from "./ImagePickerSection";
import { breedData, otherPetTypes } from "../../constants/breedData";

const { width } = Dimensions.get("window");

const PublishScreen = ({ navigation }) => {
  const theme = useTheme();
  const { addPublication, user } = React.useContext(UserContext);
  const {
    formData,
    loading,
    showDialog,
    setShowDialog,
    updateField,
    handleSubmit,
    setLoading,
  } = usePublishForm(user, addPublication, navigation);

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

  // 设置初始宠物类型
  React.useEffect(() => {
    if (!formData.type) {
      console.log("设置初始宠物类型为 cat");
      updateField("type", "cat");
    }
  }, []);

  // 每次类型改变时更新品种列表
  React.useEffect(() => {
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
      updateField("breed", type.label);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, animatedStyle]}>
          <Surface style={styles.surface} elevation={2}>
            <Text variant="titleLarge" style={styles.title}>
              发布宠物信息
            </Text>

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
                    error={!!breedError}
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
                  placeholder={`请输入具体的${
                    formData.type === "cat"
                      ? "猫"
                      : formData.type === "dog"
                      ? "狗"
                      : "宠物"
                  }品种`}
                />
              )}

              <TextInput
                label="年龄"
                value={formData.age}
                onChangeText={(text) => updateField("age", text)}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />

              <SegmentedButtons
                value={formData.gender}
                onValueChange={(value) => updateField("gender", value)}
                buttons={[
                  { value: "male", label: "公" },
                  { value: "female", label: "母" },
                ]}
                style={styles.segmentedButtons}
              />

              <TextInput
                label="描述"
                value={formData.description}
                onChangeText={(text) => updateField("description", text)}
                multiline
                numberOfLines={4}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="领养要求"
                value={formData.requirements}
                onChangeText={(text) => updateField("requirements", text)}
                multiline
                numberOfLines={4}
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.medicalSection}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  医疗信息
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
                  <View style={styles.radioGroup}>
                    <RadioButton.Item label="健康" value="健康" />
                    <RadioButton.Item label="亚健康" value="亚健康" />
                    <RadioButton.Item label="需要治疗" value="需要治疗" />
                  </View>
                </RadioButton.Group>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            >
              发布
            </Button>
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  surface: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  formSection: {
    gap: 16,
  },
  input: {
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  medicalSection: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioGroup: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
  },
  breedMenu: {
    maxWidth: width - 32,
  },
  breedMenuScroll: {
    maxHeight: 300,
  },
});

export default PublishScreen;
