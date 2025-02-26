import * as React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import PropTypes from "prop-types";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

// 自定义Hook处理图片加载
const useImageLoading = () => {
  const [imageLoading, setImageLoading] = React.useState(true);

  const handleLoadStart = React.useCallback(() => {
    setImageLoading(true);
  }, []);

  const handleLoadEnd = React.useCallback(() => {
    setImageLoading(false);
  }, []);

  return { imageLoading, handleLoadStart, handleLoadEnd };
};

// 样式定义移到组件外部
const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginHorizontal: width * 0.05,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    height: CARD_WIDTH * 0.6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    marginRight: 8,
    fontSize: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

const PetCard = React.memo(({ pet, onPress }) => {
  const theme = useTheme();
  const { imageLoading, handleLoadStart, handleLoadEnd } = useImageLoading();

  const renderGenderIcon = React.useMemo(() => {
    const iconName = pet.gender === "male" ? "gender-male" : "gender-female";
    const iconColor =
      pet.gender === "male" ? theme.colors.primary : theme.colors.error;
    return (
      <MaterialCommunityIcons name={iconName} size={16} color={iconColor} />
    );
  }, [pet.gender, theme.colors]);

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Card.Cover
          source={{ uri: pet.image }}
          style={styles.image}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
        />
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </View>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>{pet.name}</Title>
          {renderGenderIcon}
        </View>
        <View style={styles.tagsContainer}>
          <Chip
            style={[
              styles.chip,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            textStyle={styles.chipText}
          >
            {pet.breed}
          </Chip>
          <Chip
            style={[
              styles.chip,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
            textStyle={styles.chipText}
          >
            {pet.age}
          </Chip>
        </View>
        <Paragraph
          numberOfLines={2}
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {pet.description}
        </Paragraph>
      </Card.Content>
    </Card>
  );
});

PetCard.propTypes = {
  pet: PropTypes.shape({
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    gender: PropTypes.oneOf(["male", "female"]).isRequired,
    breed: PropTypes.string.isRequired,
    age: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

PetCard.displayName = "PetCard";

export default PetCard;
