import * as React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Card, Title, Text, Chip, List, Surface } from "react-native-paper";
import { UserContext } from "../../context/UserContext";

const MyPublicationsScreen = ({ navigation }) => {
  const { user } = React.useContext(UserContext);

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>请先登录</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Surface style={styles.itemContainer} elevation={1}>
      <List.Item
        title={item.petName}
        description={`发布日期: ${item.date}`}
        left={(props) => (
          <List.Icon {...props} icon={item.type === "cat" ? "cat" : "dog"} />
        )}
        right={(props) => (
          <View style={styles.rightContent}>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    item.status === "已通过" ? "#E8F5E9" : "#FFF3E0",
                },
              ]}
            >
              {item.status}
            </Chip>
            <Text style={styles.applicants}>{item.applicants}人申请</Text>
          </View>
        )}
        onPress={() =>
          navigation.navigate("PetDetail", {
            petId: item.petId,
            pet: item,
          })
        }
      />
    </Surface>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={user.publications || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无发布记录</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 16,
  },
  itemContainer: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  rightContent: {
    alignItems: "flex-end",
  },
  statusChip: {
    marginBottom: 4,
  },
  applicants: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#666",
  },
});

export default MyPublicationsScreen;
