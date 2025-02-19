import * as React from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import {
  Searchbar,
  Card,
  Text,
  Chip,
  Title,
  Paragraph,
} from "react-native-paper";
import { UserContext } from "../context/UserContext";

const PetListScreen = ({ route, navigation }) => {
  const { petList } = React.useContext(UserContext);
  const { filterType } = route.params || {};
  const [refreshing, setRefreshing] = React.useState(false);
  const [imageLoadingStates, setImageLoadingStates] = React.useState({});

  const filteredPets = React.useMemo(() => {
    if (!filterType) return petList;
    return petList.filter((pet) => pet.type === filterType);
  }, [petList, filterType]);

  const handleImageLoadStart = (petId) => {
    setImageLoadingStates((prev) => ({ ...prev, [petId]: true }));
  };

  const handleImageLoadEnd = (petId) => {
    setImageLoadingStates((prev) => ({ ...prev, [petId]: false }));
  };

  const renderItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate("PetDetail", {
          petId: item._id,
          pet: item,
        })
      }
    >
      <View style={styles.imageContainer}>
        <Card.Cover
          source={{ uri: item.image }}
          style={styles.image}
          onLoadStart={() => handleImageLoadStart(item._id)}
          onLoadEnd={() => handleImageLoadEnd(item._id)}
        />
        {imageLoadingStates[item._id] && (
          <View style={styles.imageLoadingContainer}>
            <ActivityIndicator size="large" color="#1a237e" />
          </View>
        )}
      </View>
      <Card.Content>
        <Title>{item.name}</Title>
        <View style={styles.infoRow}>
          <Text>{item.breed}</Text>
          <Text>{item.age}</Text>
        </View>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPets}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          // 模拟刷新
          setTimeout(() => setRefreshing(false), 1000);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    height: 200,
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
});

export default PetListScreen;
