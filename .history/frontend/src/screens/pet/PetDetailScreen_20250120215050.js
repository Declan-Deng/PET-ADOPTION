import * as React from "react";
import { View, ScrollView, StyleSheet, Image, Dimensions } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { UserContext } from "../../context/UserContext";

const PetDetailScreen = ({ route, navigation }) => {
  const { pet } = route.params;
  const { user } = React.useContext(UserContext);

  const handleAdoptPress = () => {
    navigation.navigate("AdoptionForm", { pet });
  };

  // 处理年龄显示
  const formatAge = (age) => {
    if (!age) return "年龄未知";
    if (age.includes("岁")) return age;
    if (!isNaN(age)) return `${Number(age)}岁`;
    return age;
  };

  return (
    <ScrollView style={styles.container}>
      {pet.images && pet.images.length > 0 ? (
        <Image
          source={{ uri: pet.images[0] }}
          style={styles.image}
          defaultSource={{
            uri: "https://via.placeholder.com/300x200?text=No+Image",
          }}
        />
      ) : (
        <Image
          source={{ uri: "https://via.placeholder.com/300x200?text=No+Image" }}
          style={styles.image}
        />
      )}

      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.name}>
          {pet.petName}
        </Text>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="bodyLarge">品种：</Text>
              <Text variant="bodyLarge">{pet.breed || "未知"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyLarge">年龄：</Text>
              <Text variant="bodyLarge">{formatAge(pet.age)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyLarge">性别：</Text>
              <Text variant="bodyLarge">{pet.gender || "未知"}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              详细介绍
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {pet.description || "暂无详细介绍"}
            </Text>
          </Card.Content>
        </Card>

        {user && (
          <Button
            mode="contained"
            onPress={handleAdoptPress}
            style={styles.adoptButton}
          >
            申请领养
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: Dimensions.get("window").width,
    height: 300,
    resizeMode: "cover",
  },
  content: {
    padding: 16,
  },
  name: {
    marginBottom: 16,
    fontWeight: "bold",
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  descriptionCard: {
    marginBottom: 24,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  description: {
    lineHeight: 24,
  },
  adoptButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
});

export default PetDetailScreen;
