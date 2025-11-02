import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Schedule from "./screens/Schedule";
import Home from "./screens/Home";
import Booking from "./screens/Booking";
import BookLesson from "./screens/BookLesson";
import Profile from "./screens/Profile";
import Store from "./screens/Store";
import Checkout from "./screens/Checkout";
import EditProfile from "./screens/EditProfile";
import Chat from "./screens/Chat";
import InstructorChats from "./screens/InstructorChats";
import InstructorChat from "./screens/InstructorChat";
import { authService, userService } from "./services/api";
import { CartProvider } from "./context/CartContext";

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function getExpoPushToken() {
  try {
    console.log("[getExpoPushToken] called");
    if (!Device.isDevice) {
      console.log("[getExpoPushToken] Not a physical device");
      return null;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("[getExpoPushToken] Existing status:", existingStatus);
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("[getExpoPushToken] Requested status:", status);
    }
    if (finalStatus !== "granted") {
      console.log("[getExpoPushToken] Permission not granted");
      return null;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "1fdd220b-4a71-47a8-a6e9-c665a56d6b2d"
    });
    console.log("[getExpoPushToken] Got tokenData:", tokenData);
    return tokenData?.data || null;
  } catch (e) {
    console.log("[getExpoPushToken] Error:", e.message);
    return null;
  }
}

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

  useEffect(() => {
    (async () => {
      console.log("[useEffect][pushToken] token:", token);
      if (!token) return;
      const expoToken = await getExpoPushToken();
      console.log("[useEffect][pushToken] expoToken:", expoToken);
      if (expoToken) {
        try {
          await userService.registerPushToken(expoToken);
        } catch (e) {
          console.log("[useEffect][pushToken] registerPushToken error:", e.message);
        }
      }
    })();
  }, [token]);

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

      try {
        const expoToken = await getExpoPushToken();
        console.log("[handleLogin] expoToken:", expoToken);
        if (expoToken) {
          await userService.registerPushToken(expoToken);
        }
      } catch (e) {
        console.log("[handleLogin] registerPushToken error:", e.message);
      }
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
              <Stack.Screen name="EditProfile">
                {(props) => (
                  <EditProfile
                    {...props}
                    tokenRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Chat">
                {(props) => (
                  <Chat
                    {...props}
                    tokenRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="InstructorChats">
                {(props) => (
                  <InstructorChats
                    {...props}
                    tokenRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="InstructorChat">
                {(props) => (
                  <InstructorChat
                    {...props}
                    tokenRole={tokenRole}
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
              <Stack.Screen name="EditProfile">
                {(props) => (
                  <EditProfile
                    {...props}
                    tokenRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Chat">
                {(props) => (
                  <Chat
                    {...props}
                    tokenRole={tokenRole}
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
