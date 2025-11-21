import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Login from "./screens/Login";
import Schedule from "./screens/Schedule";
import Home from "./screens/Home";
import Booking from "./screens/Booking";
import BookLesson from "./screens/BookLesson";
import Profile from "./screens/Profile";
import Store from "./screens/Store";
import Checkout from "./screens/Checkout";
import EditProfile from "./screens/EditProfile";
import Chats from "./screens/Chats";
import ChatThread from "./screens/ChatThread";
import AdminHome from "./screens/AdminHome";
import UserManagement from "./screens/UserManagement";
import ProductManagement from "./screens/ProductManagement";
import LessonHistory from "./screens/LessonHistory";
import InstructorHistory from "./screens/InstructorHistory";
import { authService, userService } from "./services/api";
import { CartProvider } from "./context/CartContext";
import { getSocket, disconnectSocket } from "./services/socket";

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
    if (!Device.isDevice) return null;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "1fdd220b-4a71-47a8-a6e9-c665a56d6b2d"
    });
    return tokenData?.data || null;
  } catch (e) {
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

          } catch (validationError) {

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

            } catch (refreshError) {
              console.log("Token refresh failed:", refreshError.message);
              await handleLogout();
            }
          }
        } else {
          await handleLogout();
        }
      } catch (error) {
        await handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAndRefreshToken();
  }, []);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const expoToken = await getExpoPushToken();
      if (expoToken) {
        try {
          await userService.registerPushToken(expoToken);
        } catch (e) {
        }
      }
      getSocket(token);
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


      try {
        const expoToken = await getExpoPushToken();
        if (expoToken) {
          await userService.registerPushToken(expoToken);
        }
      } catch (e) {
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

    disconnectSocket();

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
            <>
              <Stack.Screen name="AdminHome">
                {(props) => <AdminHome {...props} handleLogout={handleLogout} />}
              </Stack.Screen>
              <Stack.Screen name="UserManagement">
                {(props) => <UserManagement {...props} />}
              </Stack.Screen>
              <Stack.Screen name="ProductManagement">
                {(props) => <ProductManagement {...props} />}
              </Stack.Screen>
        
            </>
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
              <Stack.Screen name="LessonHistory">
                {(props) => (
                  <LessonHistory
                    {...props}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Chats">
                {(props) => (
                  <Chats
                    {...props}
                    tokenRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="ChatThread">
                {(props) => (
                  <ChatThread
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
              <Stack.Screen name="InstructorHistory">
                {(props) => (
                  <InstructorHistory
                    {...props}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Chats">
                {(props) => (
                  <Chats
                    {...props}
                    tokenRole={tokenRole}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="ChatThread">
                {(props) => (
                  <ChatThread
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
