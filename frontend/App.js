import * as React from "react";
import { PaperProvider } from "react-native-paper";
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <PaperProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </PaperProvider>
  );
}
