import * as React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Card, Title, Text, Chip, List, Surface } from "react-native-paper";
import { UserContext } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyPublicationsScreen = ({ navigation }) => {
  const { user } = React.useContext(UserContext);
  const [publications, setPublications] = React.useState([]);

  // 获取发布列表
  React.useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await fetch("http://192.168.3.74:5001/api/pets", {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          // 只显示当前用户的发布
          const userPubs = data.data.filter(
            (pub) => pub.owner._id === user._id
          );
          setPublications(userPubs);
        }
      } catch (error) {
        console.error("获取发布列表失败:", error);
      }
    };

    if (user) {
      fetchPublications();
    }
  }, [user]);

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
        description={`发布日期: ${new Date(
          item.createdAt
        ).toLocaleDateString()}`}
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
            <Text style={styles.applicants}>{item.applicants || 0}人申请</Text>
          </View>
        )}
        onPress={() =>
          navigation.navigate("PetDetail", {
            petId: item._id,
            pet: item,
          })
        }
      />
    </Surface>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={publications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
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
