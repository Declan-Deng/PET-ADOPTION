import * as React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Chip, Text, useTheme } from "react-native-paper";

const ActiveFiltersBar = ({ filters, onRemoveFilter }) => {
  const theme = useTheme();

  // 如果没有激活的筛选条件，则不显示组件
  if (Object.keys(filters).length === 0) {
    return null;
  }

  // 筛选条件的用户友好显示名称映射
  const filterDisplayNames = {
    type: "类型",
    gender: "性别",
    healthStatus: "健康状况",
    vaccinated: "疫苗接种",
    sterilized: "绝育情况",
    breed: "品种",
    age: "年龄",
  };

  // 筛选条件值的用户友好显示名称映射
  const valueDisplayNames = {
    // 宠物类型
    cat: "猫咪",
    dog: "狗狗",
    other: "其他",

    // 性别
    male: "公",
    female: "母",
    unknown: "未知",

    // 布尔值
    true: "是",
    false: "否",
  };

  const renderFilterChip = (key, value) => {
    // 防御性检查，确保 value 不是 undefined 或 null
    if (value === undefined || value === null) {
      return null;
    }

    // 安全地处理 toString 转换
    const valueStr =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    let displayValue = valueDisplayNames[valueStr] || value;

    // 处理布尔值的特殊情况
    if (key === "vaccinated") {
      displayValue = value ? "已接种" : "未接种";
    } else if (key === "sterilized") {
      displayValue = value ? "已绝育" : "未绝育";
    }

    return (
      <Chip
        key={key}
        onClose={() => onRemoveFilter(key)}
        style={styles.chip}
        closeIconAccessibilityLabel="移除筛选"
      >
        {`${filterDisplayNames[key]}: ${displayValue}`}
      </Chip>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(filters).map(([key, value]) =>
          renderFilterChip(key, value)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 16,
    flexDirection: "row",
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
});

export default ActiveFiltersBar;
