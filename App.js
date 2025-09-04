import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "./screens/Login";
import BookLesson from "./screens/BookLesson";

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Error loading from AsyncStorage:", error.message);
      }
    };
    checkToken();
  }, []);

  
const handleLogin = async ({ token, user }) => {
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);
    } catch (error) {
      console.log("Error saving to AsyncStorage:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } catch (error) {
      console.log("Error logging out:", error.message);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Login">
            {() => <Login onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Book">
            {() => <BookLesson token={token} user={user} setToken={setToken} setUser={setUser} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );

  
}
