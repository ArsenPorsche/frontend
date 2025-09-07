import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";
import Login from "./screens/Login";
import BookLesson from "./screens/BookLesson";
import Register from "./screens/Register";
import { authService } from "./services/api";

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenRole, setTokenRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        const storedToken = await SecureStore.getItem("token");
        const storedRefreshToken = await SecureStore.getItem("refreshToken");
        if (storedToken && storedRefreshToken) {
          try {
            const response = await authService.refreshToken(storedRefreshToken);
            const { token: newToken, refreshToken: newRefreshToken } = response;
            await SecureStore.setItem("token", newToken);
            await SecureStore.setItem("refreshToken", newRefreshToken);
            setToken(newToken);
            setRefreshToken(newRefreshToken);
          } catch (error) {
            await handleLogout();
          }
        }

        if (storedToken) {
          try {
            const validation = await authService.validateToken(storedToken);
            setTokenRole(validation.role);
            setUserId(validation.id);
          } catch (error) {
            console.log("Token validation failed:", error);
            setTokenRole(null);
            setUserId(null);
          }
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
      await SecureStore.setItem("token", token);
      await SecureStore.setItem("refreshToken", refreshToken);
      await SecureStore.setItem("user", JSON.stringify(user));
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      const validation = await authService.validateToken(token);
      setTokenRole(validation.role);
      setUserId(validation.id);
    } catch (error) {
      console.log("Error saving to SecureStore:", error.message);
    }
  };

  const handleLogout = async () => {
    await SecureStore.removeItem("token");
    await SecureStore.removeItem("refreshToken");
    await SecureStore.removeItem("user");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setTokenRole(null);
    setUserId(null);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {tokenRole === "admin" ? (
          <Stack.Screen name="Register">{() => <Register />}</Stack.Screen>
        ) : tokenRole === "student" ? (
          <Stack.Screen name="Book">
            {() => <BookLesson token={token} userId={userId} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {() => <Login onLogin={handleLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
