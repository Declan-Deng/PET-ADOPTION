import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  HomeScreen,
  PetListScreen,
  PetDetailScreen,
  AdoptionFormScreen,
  AdoptionSuccessScreen,
} from "../screens";

const Stack = createNativeStackNavigator();

const AdoptionStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "宠物领养",
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="PetList"
        component={PetListScreen}
        options={{ title: "可领养宠物" }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: "宠物详情" }}
      />
      <Stack.Screen
        name="AdoptionForm"
        component={AdoptionFormScreen}
        options={{
          title: "申请领养",
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="AdoptionSuccess"
        component={AdoptionSuccessScreen}
        options={{
          title: "申请成功",
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  );
};

export default AdoptionStack;
