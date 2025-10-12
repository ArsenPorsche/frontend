import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Schedule from "./screens/Schedule";
import Home from "./screens/Home";
import Booking from "./screens/Booking";
import BookLesson from "./screens/BookLesson";
import Profile from "./screens/Profile";
import Store from "./screens/Store";
import Checkout from "./screens/Checkout";
import { authService } from "./services/api";
import { CartProvider } from "./context/CartContext";

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenRole, setTokenRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      try {
        setIsLoading(true);

        const storedToken = await SecureStore.getItemAsync("token");
        const storedRefreshToken = await SecureStore.getItemAsync(
          "refreshToken"
        );
        const storedUser = await SecureStore.getItemAsync("user");

        console.log("Stored token:", storedToken ? "exists" : "not found");
        console.log(
          "Stored refresh token:",
          storedRefreshToken ? "exists" : "not found"
        );

        if (storedToken && storedRefreshToken) {
          try {
            setToken(storedToken);
            setRefreshToken(storedRefreshToken);

            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }

            const validation = await authService.validateToken(storedToken);
            setTokenRole(validation.role);
            setUserId(validation.id);

            console.log("Token validated successfully. Role:", validation.role);
          } catch (validationError) {
            console.log(
              "Token validation failed, trying to refresh:",
              validationError.message
            );

            try {
              const response = await authService.refreshToken(
                storedRefreshToken
              );
              const { token: newToken, refreshToken: newRefreshToken } =
                response;

              await SecureStore.setItemAsync("token", newToken);
              await SecureStore.setItemAsync("refreshToken", newRefreshToken);

              setToken(newToken);
              setRefreshToken(newRefreshToken);

              const newValidation = await authService.validateToken(newToken);
              setTokenRole(newValidation.role);
              setUserId(newValidation.id);

              console.log(
                "Token refreshed and validated. Role:",
                newValidation.role
              );
            } catch (refreshError) {
              console.log("Token refresh failed:", refreshError.message);
              await handleLogout();
            }
          }
        } else {
          console.log("No stored tokens found");
          await handleLogout();
        }
      } catch (error) {
        console.log("Token check failed:", error.message);
        await handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAndRefreshToken();
  }, []);

  const handleLogin = async ({ token, user, refreshToken }) => {
    try {
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("refreshToken", refreshToken);
      await SecureStore.setItemAsync("user", JSON.stringify(user));

      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);

      const validation = await authService.validateToken(token);
      setTokenRole(validation.role);
      setUserId(validation.id);

      console.log("Login successful. Role:", validation.role);
    } catch (error) {
      console.log("Error saving to SecureStore:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("user");
    } catch (error) {
      console.log("Error clearing SecureStore:", error.message);
    }

    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setTokenRole(null);
    setUserId(null);
  };

  if (isLoading) {
    return (
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Loading">
              {() => (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={{ marginTop: 20, fontSize: 16 }}>
                    Loading...
                  </Text>
                </View>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {tokenRole === "admin" ? (
            <Stack.Screen name="Register">{() => <Register />}</Stack.Screen>
          ) : tokenRole === "student" ? (
            <>
              <Stack.Screen name="Home">
                {(props) => (
                  <Home
                    {...props}
                    userId={userId}
                    tokenRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Store">
                {(props) => <Store {...props} tokenRole={tokenRole} />}
              </Stack.Screen>
              <Stack.Screen name="Checkout">
                {(props) => <Checkout {...props} tokenRole={tokenRole} />}
              </Stack.Screen>
              <Stack.Screen name="Booking">
                {(props) => <Booking {...props} tokenRole={tokenRole} />}
              </Stack.Screen>
              <Stack.Screen name="BookLesson">
                {(props) => (
                  <BookLesson
                    {...props}
                    token={token}
                    userRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Schedule">
                {(props) => (
                  <Schedule
                    {...props}
                    token={token}
                    userRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Profile">
                {(props) => (
                  <Profile
                    {...props}
                    tokenRole={tokenRole}
                    handleLogout={handleLogout}
                  />
                )}
              </Stack.Screen>
            </>
          ) : tokenRole === "instructor" ? (
            <>
              <Stack.Screen name="Home">
                {(props) => <Home {...props} tokenRole={tokenRole} />}
              </Stack.Screen>
              <Stack.Screen name="Schedule">
                {(props) => (
                  <Schedule
                    {...props}
                    token={token}
                    userRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Profile">
                {(props) => (
                  <Profile
                    {...props}
                    tokenRole={tokenRole}
                    handleLogout={handleLogout}
                  />
                )}
              </Stack.Screen>
            </>
          ) : (
            <Stack.Screen name="Login">
              {() => <Login onLogin={handleLogin} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
