import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ProfileScreen,
  MyPublicationsScreen,
  MyAdoptionsScreen,
  PetDetailScreen,
} from "../screens";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import AboutScreen from "../screens/profile/AboutScreen";
import ApplicationListScreen from "../screens/profile/ApplicationListScreen";

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "我的",
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "编辑资料" }}
      />
      <Stack.Screen
        name="MyPublications"
        component={MyPublicationsScreen}
        options={{
          title: "我的发布",
          headerBackTitle: "返回",
        }}
      />
      <Stack.Screen
        name="MyAdoptions"
        component={MyAdoptionsScreen}
        options={{
          title: "申请记录",
          headerBackTitle: "返回",
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: "关于我们" }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{
          title: "宠物详情",
          headerBackTitle: "返回",
        }}
      />
      <Stack.Screen
        name="ApplicationList"
        component={ApplicationListScreen}
        options={{ title: "申请列表" }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
