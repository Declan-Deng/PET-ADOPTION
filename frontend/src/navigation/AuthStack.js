import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import TermsScreen from "../screens/auth/TermsScreen";
import PrivacyScreen from "../screens/auth/PrivacyScreen";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "登录" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "注册" }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: "服务条款" }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: "隐私政策" }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
