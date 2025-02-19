import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import MyPublicationsScreen from "../screens/profile/MyPublicationsScreen";
import MyAdoptionsScreen from "../screens/profile/MyAdoptionsScreen";
import AboutScreen from "../screens/about/AboutScreen";
import PetDetailScreen from "../screens/PetDetailScreen";

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "个人中心" }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "编辑资料" }}
      />
      <Stack.Screen
        name="MyPublications"
        component={MyPublicationsScreen}
        options={{ title: "我的发布" }}
      />
      <Stack.Screen
        name="MyAdoptions"
        component={MyAdoptionsScreen}
        options={{ title: "申请记录" }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: "关于我们" }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: "宠物详情" }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
