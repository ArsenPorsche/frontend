import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "./screens/Login";
import BookLesson from "./screens/BookLesson";
import { authService } from "./services/api";

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
        const storedUser = await AsyncStorage.getItem("user");
        if (storedToken && storedRefreshToken && storedUser) {
          const response = await authService.refreshToken(storedRefreshToken);
          const { token: newToken, refreshToken: newRefreshToken, user: newUser } = response;
          await AsyncStorage.setItem("token", newToken);
          await AsyncStorage.setItem("refreshToken", newRefreshToken);
          await AsyncStorage.setItem("user", JSON.stringify(newUser));
          setToken(newToken);
          setRefreshToken(newRefreshToken);
          setUser(newUser);
        }
      } catch (error) {
        console.log("Token check failed:", error.message);
        await handleLogout();
      }
    };
    checkAndRefreshToken();
  }, []);

  const handleLogin = async ({ token, user, refreshToken }) => {
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
    } catch (error) {
      console.log("Error saving to AsyncStorage:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");
      setToken(null);
      setRefreshToken(null);
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
            {() => (
              <BookLesson
                token={token}
                user={user}
                setToken={setToken}
                setUser={setUser}
                refreshToken={refreshToken}
                setRefreshToken={setRefreshToken}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
