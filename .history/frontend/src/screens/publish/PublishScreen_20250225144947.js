import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TouchableOpacity,
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
  const [showBreedDialog, setShowBreedDialog] = React.useState(false);
  const [showOtherPetTypeDialog, setShowOtherPetTypeDialog] =
    React.useState(false);

  // 动画值
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

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
      setShowOtherPetTypeDialog(false);
    },
    [updateField]
  );

  // 处理品种选择
  const handleBreedSelect = React.useCallback(
    (breed) => {
      updateField("breed", breed.value);
      setShowBreedDialog(false);
      if (breed.value.includes("其他")) {
        updateField("customBreed", "");
      }
    },
    [updateField]
  );

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
                value={formData.petType}
                onValueChange={(value) => {
                  updateField("petType", value);
                  updateField("breed", "");
                  updateField("otherType", "");
                  updateField("customBreed", "");
                }}
                buttons={[
                  { value: "cat", label: "猫" },
                  { value: "dog", label: "狗" },
                  { value: "other", label: "其他" },
                ]}
                style={styles.segmentedButtons}
              />

              {formData.petType === "other" ? (
                <>
                  <TouchableOpacity
                    onPress={() => setShowOtherPetTypeDialog(true)}
                    activeOpacity={0.7}
                  >
                    <TextInput
                      label="动物类型"
                      value={formData.otherType}
                      style={styles.input}
                      mode="outlined"
                      right={<TextInput.Icon icon="menu-down" />}
                      editable={false}
                      pointerEvents="none"
                    />
                  </TouchableOpacity>
                  <Portal>
                    <Dialog
                      visible={showOtherPetTypeDialog}
                      onDismiss={() => setShowOtherPetTypeDialog(false)}
                      style={styles.dialog}
                    >
                      <Dialog.Title>选择动物类型</Dialog.Title>
                      <Dialog.ScrollArea style={styles.dialogScroll}>
                        <RadioButton.Group
                          value={formData.otherType}
                          onValueChange={(value) => {
                            updateField("otherType", value);
                            setShowOtherPetTypeDialog(false);
                          }}
                        >
                          {otherPetTypes.map((type) => (
                            <RadioButton.Item
                              key={type.value}
                              label={type.label}
                              value={type.label}
                            />
                          ))}
                        </RadioButton.Group>
                      </Dialog.ScrollArea>
                    </Dialog>
                  </Portal>
                  {formData.otherType && (
                    <TextInput
                      label="品种"
                      value={formData.customBreed}
                      onChangeText={(text) => updateField("customBreed", text)}
                      style={styles.input}
                      mode="outlined"
                      placeholder={`请输入${formData.otherType}的品种`}
                    />
                  )}
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowBreedDialog(true)}
                    activeOpacity={0.7}
                  >
                    <TextInput
                      label="品种"
                      value={formData.breed}
                      style={styles.input}
                      mode="outlined"
                      right={<TextInput.Icon icon="menu-down" />}
                      editable={false}
                      pointerEvents="none"
                    />
                  </TouchableOpacity>
                  <Portal>
                    <Dialog
                      visible={showBreedDialog}
                      onDismiss={() => setShowBreedDialog(false)}
                      style={styles.dialog}
                    >
                      <Dialog.Title>选择品种</Dialog.Title>
                      <Dialog.ScrollArea style={styles.dialogScroll}>
                        <RadioButton.Group
                          value={formData.breed}
                          onValueChange={(value) => {
                            handleBreedSelect({ value });
                            setShowBreedDialog(false);
                          }}
                        >
                          {currentBreedList.map((item) => (
                            <RadioButton.Item
                              key={item.value}
                              label={item.label}
                              value={item.value}
                            />
                          ))}
                        </RadioButton.Group>
                      </Dialog.ScrollArea>
                    </Dialog>
                  </Portal>
                  {formData.breed?.includes("其他") && (
                    <TextInput
                      label="具体品种"
                      value={formData.customBreed}
                      onChangeText={(text) => updateField("customBreed", text)}
                      style={styles.input}
                      mode="outlined"
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
  dialog: {
    maxHeight: "80%",
  },
  dialogScroll: {
    paddingHorizontal: 0,
  },
});

export default PublishScreen;
