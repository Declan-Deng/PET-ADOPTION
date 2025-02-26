import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AdoptionStack from "./AdoptionStack";
import PublishStack from "./PublishStack";
import ProfileStack from "./ProfileStack";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 90,
          paddingBottom: 25,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 15,
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="AdoptionTab"
        component={AdoptionStack}
        options={{
          title: "领养",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="paw" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PublishTab"
        component={PublishStack}
        options={{
          title: "发布",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: "我的",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
