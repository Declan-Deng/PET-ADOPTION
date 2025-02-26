import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStack from "./AuthStack";
import TabNavigator from "./TabNavigator";
import { UserContext } from "../context/UserContext";
import AdoptionFormScreen from "../screens/adoption/AdoptionFormScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = React.useContext(UserContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen
              name="AdoptionForm"
              component={AdoptionFormScreen}
              options={{
                headerShown: true,
                headerTitle: "领养申请",
                presentation: "modal",
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="AdoptionForm"
              component={AdoptionFormScreen}
              options={{
                headerShown: true,
                headerTitle: "领养申请",
                presentation: "modal",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
