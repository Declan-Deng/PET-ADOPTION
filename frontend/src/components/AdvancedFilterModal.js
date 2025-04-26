import * as React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  RadioButton,
  Checkbox,
  Divider,
  Chip,
  TextInput,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AdvancedFilterModal = ({
  visible,
  onDismiss,
  onApply,
  initialFilters = {},
}) => {
  // 确保初始值不为 undefined
  const safeInitialFilters = initialFilters || {};

  const [filters, setFilters] = React.useState({
    type: safeInitialFilters.type || "all",
    gender: safeInitialFilters.gender || "all",
    healthStatus: safeInitialFilters.healthStatus || "all",
    vaccinated: safeInitialFilters.vaccinated,
    sterilized: safeInitialFilters.sterilized,
    breed: safeInitialFilters.breed || "",
    age: safeInitialFilters.age || "",
    // 不包含时间范围筛选，因为移动端UI复杂度考虑
  });

  const resetFilters = () => {
    setFilters({
      type: "all",
      gender: "all",
      healthStatus: "all",
      vaccinated: undefined,
      sterilized: undefined,
      breed: "",
      age: "",
    });
  };

  const handleApply = () => {
    // 移除值为 "all" 或空字符串的筛选条件
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) =>
          value !== "all" &&
          value !== "" &&
          value !== undefined &&
          value !== null
      )
    );
    onApply(cleanedFilters);
  };

  // 安全地获取值的字符串表示
  const getValueString = (value) => {
    if (value === undefined || value === null) {
      return "all";
    }
    return String(value);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">高级筛选</Text>
          <IconButton icon="close" onPress={onDismiss} size={24} />
        </View>
        <Divider />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 宠物类型 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              宠物类型
            </Text>
            <View style={styles.optionRow}>
              <RadioButton.Group
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
                value={filters.type || "all"}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item label="全部" value="all" />
                  <RadioButton.Item label="猫咪" value="cat" />
                  <RadioButton.Item label="狗狗" value="dog" />
                  <RadioButton.Item label="其他" value="other" />
                </View>
              </RadioButton.Group>
            </View>
          </View>

          <Divider />

          {/* 品种 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              品种
            </Text>
            <TextInput
              value={filters.breed || ""}
              onChangeText={(text) => setFilters({ ...filters, breed: text })}
              placeholder="输入品种关键词"
              style={styles.textInput}
            />
          </View>

          <Divider />

          {/* 年龄 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              年龄
            </Text>
            <TextInput
              value={filters.age || ""}
              onChangeText={(text) => setFilters({ ...filters, age: text })}
              placeholder="输入数字，如：2"
              style={styles.textInput}
              keyboardType="numeric"
              right={<TextInput.Affix text="岁" />}
            />
          </View>

          <Divider />

          {/* 性别 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              性别
            </Text>
            <View style={styles.optionRow}>
              <RadioButton.Group
                onValueChange={(value) =>
                  setFilters({ ...filters, gender: value })
                }
                value={filters.gender || "all"}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item label="全部" value="all" />
                  <RadioButton.Item label="公" value="male" />
                  <RadioButton.Item label="母" value="female" />
                  <RadioButton.Item label="未知" value="unknown" />
                </View>
              </RadioButton.Group>
            </View>
          </View>

          <Divider />

          {/* 健康状况 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              健康状况
            </Text>
            <View style={styles.optionRow}>
              <RadioButton.Group
                onValueChange={(value) =>
                  setFilters({ ...filters, healthStatus: value })
                }
                value={filters.healthStatus || "all"}
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item label="全部" value="all" />
                  <RadioButton.Item label="健康" value="健康" />
                  <RadioButton.Item label="亚健康" value="亚健康" />
                  <RadioButton.Item label="需要治疗" value="需要治疗" />
                </View>
              </RadioButton.Group>
            </View>
          </View>

          <Divider />

          {/* 疫苗接种 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              疫苗接种
            </Text>
            <View style={styles.optionRow}>
              <RadioButton.Group
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    vaccinated: value === "all" ? undefined : value === "true",
                  })
                }
                value={
                  filters.vaccinated === undefined
                    ? "all"
                    : getValueString(filters.vaccinated)
                }
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item label="全部" value="all" />
                  <RadioButton.Item label="已接种" value="true" />
                  <RadioButton.Item label="未接种" value="false" />
                </View>
              </RadioButton.Group>
            </View>
          </View>

          <Divider />

          {/* 绝育情况 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              绝育情况
            </Text>
            <View style={styles.optionRow}>
              <RadioButton.Group
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    sterilized: value === "all" ? undefined : value === "true",
                  })
                }
                value={
                  filters.sterilized === undefined
                    ? "all"
                    : getValueString(filters.sterilized)
                }
              >
                <View style={styles.radioRow}>
                  <RadioButton.Item label="全部" value="all" />
                  <RadioButton.Item label="已绝育" value="true" />
                  <RadioButton.Item label="未绝育" value="false" />
                </View>
              </RadioButton.Group>
            </View>
          </View>
        </ScrollView>

        <Divider />

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={resetFilters}
            style={styles.footerButton}
          >
            重置筛选
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.footerButton}
          >
            应用筛选
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    maxHeight: "80%",
    width: "90%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  optionRow: {
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  textInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
    height: 45,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default AdvancedFilterModal;
