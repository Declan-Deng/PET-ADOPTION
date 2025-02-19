import * as React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Searchbar, Card, Text, Chip } from "react-native-paper";
import { UserContext } from "../context/UserContext";

const PetListScreen = ({ navigation, route }) => {
  const { petList } = React.useContext(UserContext);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState(
    route.params?.filterType || "all"
  );

  // 根据搜索词和类型过滤宠物列表
  const filteredPets = React.useMemo(() => {
    return petList.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "all" || pet.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [petList, searchQuery, selectedType]);

  React.useEffect(() => {
    if (route.params?.filterType) {
      setSelectedType(route.params.filterType);
    }
  }, [route.params?.filterType]);

  const renderPetCard = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate("PetDetail", { petId: item._id })}
    >
      <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
      <Card.Content style={styles.cardContent}>
        <Text variant="titleLarge" style={styles.petName}>
          {item.name}
        </Text>
        <View style={styles.petInfo}>
          <Text variant="bodyMedium" style={styles.breed}>
            {item.breed}
          </Text>
          <Text variant="bodyMedium" style={styles.age}>
            {item.age}
          </Text>
        </View>
        <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索宠物名称、品种..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <Chip
          selected={selectedType === "all"}
          onPress={() => setSelectedType("all")}
          style={styles.filterChip}
        >
          全部
        </Chip>
        <Chip
          selected={selectedType === "cat"}
          onPress={() => setSelectedType("cat")}
          style={styles.filterChip}
        >
          猫咪
        </Chip>
        <Chip
          selected={selectedType === "dog"}
          onPress={() => setSelectedType("dog")}
          style={styles.filterChip}
        >
          狗狗
        </Chip>
        <Chip
          selected={selectedType === "other"}
          onPress={() => setSelectedType("other")}
          style={styles.filterChip}
        >
          其他
        </Chip>
      </View>

      <FlatList
        data={filteredPets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchBar: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  petName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  petInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breed: {
    color: "#666",
  },
  age: {
    color: "#666",
  },
  description: {
    color: "#333",
    lineHeight: 20,
  },
});

export default PetListScreen;
