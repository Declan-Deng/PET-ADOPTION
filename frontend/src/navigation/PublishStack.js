import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PublishScreen from "../screens/publish/PublishScreen";
import PublishSuccessScreen from "../screens/publish/PublishSuccessScreen";

const Stack = createNativeStackNavigator();

const PublishStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Publish"
        component={PublishScreen}
        options={{ title: "发布领养" }}
      />
      <Stack.Screen
        name="PublishSuccess"
        component={PublishSuccessScreen}
        options={{
          title: "发布成功",
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  );
};

export default PublishStack;
