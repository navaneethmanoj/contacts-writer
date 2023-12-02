import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, Text } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import EditScreen from "./screens/EditScreen";
import ResultScreen from "./screens/ResultScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: "#1e1e1e" },
          headerTintColor: "#f5f5f5",
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "ContactsWriter" }}
        />
        <Stack.Screen
          name="Edit"
          component={EditScreen}
          options={{ title: "" }}
        />
        <Stack.Screen name="Result" component={ResultScreen} options={{title: ""}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
