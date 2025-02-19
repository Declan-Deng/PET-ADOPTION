import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
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

  // 动画值
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  const [formErrors, setFormErrors] = React.useState({});

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

  // 获取当前宠物类型的品种列表
  const currentBreedList = React.useMemo(() => {
    if (formData.petType === "other") return [];
    return breedData[formData.petType] || [];
  }, [formData.petType]);

  // 处理其他宠物类型选择
  const handleOtherPetTypeSelect = React.useCallback(
    (type) => {
      updateField("otherType", type.label);
      setShowOtherPetTypeMenu(false);
    },
    [updateField]
  );

  // 处理品种选择
  const handleBreedSelect = React.useCallback(
    (breed) => {
      updateField("breed", breed.value);
      setShowBreedMenu(false);
      if (breed.value.includes("其他")) {
        updateField("customBreed", "");
      }
    },
    [updateField]
  );

  const validateForm = () => {
    const errors = {};

    if (!formData.petName?.trim()) errors.petName = "请填写宠物名称";
    if (!formData.petType) errors.type = "请选择宠物类型";
    if (!formData.breed?.trim()) errors.breed = "请填写品种";
    if (!formData.age?.trim()) errors.age = "请填写年龄";
    if (!formData.gender) errors.gender = "请选择性别";
    if (!formData.description?.trim()) errors.description = "请填写描述";
    if (!formData.requirements?.trim()) errors.requirements = "请填写领养要求";
    if (!formData.images || formData.images.length === 0)
      errors.images = "请至少上传一张照片";
    if (!formData.healthStatus) errors.healthStatus = "请选择健康状况";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("提示", "请填写所有必填信息");
      return;
    }
    setLoading(true);
    try {
      await handlePublish();
      navigation.navigate("Main", {
        screen: "ProfileTab",
        params: { screen: "MyPublications", params: { refresh: Date.now() } },
      });
    } catch (error) {
      Alert.alert("发布失败", error.message);
    } finally {
      setLoading(false);
    }
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
                onChangeText={(text) => {
                  updateField("petName", text);
                  setFormErrors({ ...formErrors, petName: null });
                }}
                style={[styles.input, formErrors.petName && styles.inputError]}
                error={!!formErrors.petName}
              />
              {formErrors.petName && (
                <Text style={styles.errorText}>{formErrors.petName}</Text>
              )}

              <SegmentedButtons
                value={formData.petType}
                onValueChange={(value) => {
                  updateField("petType", value);
                  updateField("breed", "");
                  updateField("otherType", "");
                  updateField("customBreed", "");
                  setFormErrors({ ...formErrors, type: null });
                }}
                buttons={[
                  { value: "cat", label: "猫" },
                  { value: "dog", label: "狗" },
                  { value: "other", label: "其他" },
                ]}
                style={[
                  styles.segmentedButtons,
                  formErrors.type && styles.inputError,
                ]}
              />
              {formErrors.type && (
                <Text style={styles.errorText}>{formErrors.type}</Text>
              )}

              {formData.petType === "other" ? (
                <>
                  <Menu
                    visible={showOtherPetTypeMenu}
                    onDismiss={() => setShowOtherPetTypeMenu(false)}
                    anchor={
                      <TextInput
                        label="动物类型"
                        value={formData.otherType}
                        onPressIn={() => setShowOtherPetTypeMenu(true)}
                        style={[
                          styles.input,
                          formErrors.otherType && styles.inputError,
                        ]}
                        error={!!formErrors.otherType}
                        editable={false}
                      />
                    }
                    style={styles.breedMenu}
                  >
                    <ScrollView style={styles.breedMenuScroll}>
                      {otherPetTypes.map((type) => (
                        <Menu.Item
                          key={type.value}
                          onPress={() => {
                            updateField("otherType", type.label);
                            setFormErrors({ ...formErrors, otherType: null });
                          }}
                          title={type.label}
                        />
                      ))}
                    </ScrollView>
                  </Menu>
                  {formData.otherType && (
                    <TextInput
                      label="品种"
                      value={formData.customBreed}
                      onChangeText={(text) => {
                        updateField("customBreed", text);
                        setFormErrors({ ...formErrors, customBreed: null });
                      }}
                      style={[
                        styles.input,
                        formErrors.customBreed && styles.inputError,
                      ]}
                      error={!!formErrors.customBreed}
                      placeholder={`请输入${formData.otherType}的品种`}
                    />
                  )}
                </>
              ) : (
                <>
                  <Menu
                    visible={showBreedMenu}
                    onDismiss={() => setShowBreedMenu(false)}
                    anchor={
                      <TextInput
                        label="品种"
                        value={formData.breed}
                        onPressIn={() => setShowBreedMenu(true)}
                        style={[
                          styles.input,
                          formErrors.breed && styles.inputError,
                        ]}
                        error={!!formErrors.breed}
                      />
                    }
                    style={styles.breedMenu}
                  >
                    <ScrollView style={styles.breedMenuScroll}>
                      {currentBreedList.map((item) => (
                        <Menu.Item
                          key={item.value}
                          onPress={() => {
                            updateField("breed", item.value);
                            setFormErrors({ ...formErrors, breed: null });
                          }}
                          title={item.label}
                        />
                      ))}
                    </ScrollView>
                  </Menu>
                  {formData.breed?.includes("其他") && (
                    <TextInput
                      label="具体品种"
                      value={formData.customBreed}
                      onChangeText={(text) => {
                        updateField("customBreed", text);
                        setFormErrors({ ...formErrors, customBreed: null });
                      }}
                      style={[
                        styles.input,
                        formErrors.customBreed && styles.inputError,
                      ]}
                      error={!!formErrors.customBreed}
                      placeholder={`请输入具体的${
                        formData.petType === "cat" ? "猫" : "狗"
                      }品种`}
                    />
                  )}
                </>
              )}

              <TextInput
                label="年龄"
                value={formData.age}
                onChangeText={(text) => {
                  updateField("age", text);
                  setFormErrors({ ...formErrors, age: null });
                }}
                keyboardType="numeric"
                style={[styles.input, formErrors.age && styles.inputError]}
                error={!!formErrors.age}
              />
              {formErrors.age && (
                <Text style={styles.errorText}>{formErrors.age}</Text>
              )}

              <SegmentedButtons
                value={formData.gender}
                onValueChange={(value) => {
                  updateField("gender", value);
                  setFormErrors({ ...formErrors, gender: null });
                }}
                buttons={[
                  { value: "male", label: "公" },
                  { value: "female", label: "母" },
                ]}
                style={[
                  styles.segmentedButtons,
                  formErrors.gender && styles.inputError,
                ]}
              />
              {formErrors.gender && (
                <Text style={styles.errorText}>{formErrors.gender}</Text>
              )}

              <TextInput
                label="描述"
                value={formData.description}
                onChangeText={(text) => {
                  updateField("description", text);
                  setFormErrors({ ...formErrors, description: null });
                }}
                multiline
                numberOfLines={4}
                style={[
                  styles.input,
                  styles.textArea,
                  formErrors.description && styles.inputError,
                ]}
                error={!!formErrors.description}
              />
              {formErrors.description && (
                <Text style={styles.errorText}>{formErrors.description}</Text>
              )}

              <TextInput
                label="领养要求"
                value={formData.requirements}
                onChangeText={(text) => {
                  updateField("requirements", text);
                  setFormErrors({ ...formErrors, requirements: null });
                }}
                multiline
                numberOfLines={4}
                style={[
                  styles.input,
                  styles.textArea,
                  formErrors.requirements && styles.inputError,
                ]}
                error={!!formErrors.requirements}
              />
              {formErrors.requirements && (
                <Text style={styles.errorText}>{formErrors.requirements}</Text>
              )}

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
                  onValueChange={(value) => {
                    updateField("healthStatus", value);
                    setFormErrors({ ...formErrors, healthStatus: null });
                  }}
                  value={formData.healthStatus}
                >
                  <View style={styles.radioGroup}>
                    <RadioButton.Item label="健康" value="健康" />
                    <RadioButton.Item label="亚健康" value="亚健康" />
                    <RadioButton.Item label="需要治疗" value="需要治疗" />
                  </View>
                </RadioButton.Group>
              </View>
              {formErrors.healthStatus && (
                <Text style={styles.errorText}>{formErrors.healthStatus}</Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              disabled={loading}
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
  inputError: {
    borderColor: "#ff1744",
    borderWidth: 1,
  },
  errorText: {
    color: "#ff1744",
    fontSize: 12,
    marginLeft: 12,
    marginTop: 4,
  },
  textArea: {
    height: 100,
  },
});

export default PublishScreen;
