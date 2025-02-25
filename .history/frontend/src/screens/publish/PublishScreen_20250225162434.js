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
  Modal,
  FlatList,
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
} from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import { usePublishForm } from "../../hooks/usePublishForm";
import ImagePickerSection from "./ImagePickerSection";
import { breedData, otherPetTypes } from "../../constants/breedData";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

const BreedSelector = React.memo(
  ({ label, value, items, onSelect, placeholder }) => {
    const [modalVisible, setModalVisible] = React.useState(false);

    const renderItem = ({ item }) => (
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => {
          onSelect(item.value);
          setModalVisible(false);
        }}
      >
        <Text
          style={[
            styles.optionText,
            value === item.value && styles.optionTextSelected,
          ]}
        >
          {item.label}
        </Text>
        {value === item.value && (
          <MaterialCommunityIcons name="check" size={20} color="#6200ee" />
        )}
      </TouchableOpacity>
    );

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.selectorButtonText}>
            {value
              ? items.find((item) => item.value === value)?.label
              : placeholder}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.value}
                ItemSeparatorComponent={() => <Divider />}
                contentContainerStyle={styles.modalList}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

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

  // 获取当前宠物类型的品种列表
  const currentBreedList = React.useMemo(() => {
    if (formData.petType === "other") return [];
    return (
      breedData[formData.petType]?.map((item) => ({
        label: item.label,
        value: item.value,
      })) || []
    );
  }, [formData.petType]);

  // 其他宠物类型列表
  const otherTypesList = React.useMemo(() => {
    return otherPetTypes.map((type) => ({
      label: type.label,
      value: type.label,
    }));
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content]}>
          <Surface style={styles.surface} elevation={2}>
            <ImagePickerSection
              images={formData.images}
              setImages={(images) => updateField("images", images)}
              loading={loading}
              setLoading={setLoading}
            />

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
                updateField("customBreed", "");
                updateField("otherType", "");
              }}
              style={styles.segmentedButtons}
              buttons={[
                { value: "cat", label: "猫咪" },
                { value: "dog", label: "狗狗" },
                { value: "other", label: "其他" },
              ]}
            />

            {formData.petType === "other" ? (
              <>
                <BreedSelector
                  label="动物类型"
                  value={formData.otherType}
                  items={otherTypesList}
                  onSelect={(value) => {
                    updateField("otherType", value);
                    updateField("customBreed", "");
                  }}
                  placeholder="请选择动物类型"
                />
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
                <BreedSelector
                  label="品种"
                  value={formData.breed}
                  items={currentBreedList}
                  onSelect={(value) => {
                    updateField("breed", value);
                    if (!value?.includes("其他")) {
                      updateField("customBreed", "");
                    }
                  }}
                  placeholder="请选择品种"
                />
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
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              placeholder="请输入宠物年龄（岁）"
            />

            <RadioButton.Group
              onValueChange={(value) => updateField("gender", value)}
              value={formData.gender}
            >
              <View style={styles.radioGroup}>
                <Text style={styles.radioLabel}>性别：</Text>
                <View style={styles.radioButtons}>
                  <View style={styles.radioButton}>
                    <RadioButton value="male" />
                    <Text>男孩</Text>
                  </View>
                  <View style={styles.radioButton}>
                    <RadioButton value="female" />
                    <Text>女孩</Text>
                  </View>
                  <View style={styles.radioButton}>
                    <RadioButton value="unknown" />
                    <Text>未知</Text>
                  </View>
                </View>
              </View>
            </RadioButton.Group>

            <TextInput
              label="描述"
              value={formData.description}
              onChangeText={(text) => updateField("description", text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="请描述宠物的性格、习性等特点"
            />

            <TextInput
              label="领养要求"
              value={formData.requirements}
              onChangeText={(text) => updateField("requirements", text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="请说明对领养人的要求，如居住条件、时间投入等"
            />

            <View style={styles.switchContainer}>
              <View style={styles.switchItem}>
                <Text>是否接种疫苗</Text>
                <Switch
                  value={formData.vaccinated}
                  onValueChange={(value) => updateField("vaccinated", value)}
                />
              </View>
              <View style={styles.switchItem}>
                <Text>是否绝育</Text>
                <Switch
                  value={formData.sterilized}
                  onValueChange={(value) => updateField("sterilized", value)}
                />
              </View>
            </View>

            <RadioButton.Group
              onValueChange={(value) => updateField("healthStatus", value)}
              value={formData.healthStatus}
            >
              <View style={styles.radioGroup}>
                <Text style={styles.radioLabel}>健康状况：</Text>
                <View style={styles.radioButtons}>
                  <View style={styles.radioButton}>
                    <RadioButton value="健康" />
                    <Text>健康</Text>
                  </View>
                  <View style={styles.radioButton}>
                    <RadioButton value="亚健康" />
                    <Text>亚健康</Text>
                  </View>
                  <View style={styles.radioButton}>
                    <RadioButton value="需要治疗" />
                    <Text>需要治疗</Text>
                  </View>
                </View>
              </View>
            </RadioButton.Group>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
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
  input: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioLabel: {
    marginBottom: 8,
  },
  radioButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    backgroundColor: "#fff",
  },
  selectorButtonText: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  modalList: {
    padding: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionTextSelected: {
    color: "#6200ee",
    fontWeight: "600",
  },
});

export default PublishScreen;
