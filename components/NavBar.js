import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { navBarStyles } from "../styles/NavBarStyles";
import { notificationService } from "../services/api";

const NavBar = ({ role, navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUnreadCount = async () => {
        try {
          const data = await notificationService.getNotifications({ unreadOnly: true });
          setUnreadCount(data.unreadCount || 0);
        } catch (error) {
          console.log("Error fetching unread count:", error.message);
        }
      };
      fetchUnreadCount();
    }, [])
  );

  return (
  <View style={navBarStyles.container}>
    <TouchableOpacity onPress={() => navigation.navigate("Home")}>
      <Ionicons name="home-outline" size={28} />
    </TouchableOpacity>
    {role === "student" && (
      <>
        <TouchableOpacity onPress={() => navigation.navigate("Booking")}>
          <Ionicons name="calendar-outline" size={28} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Store")}>
          <Ionicons name="bag-outline" size={28} />
        </TouchableOpacity>
      </>
    )}
    {role === "instructor" && (
      <>
        <TouchableOpacity onPress={() => navigation.navigate("Schedule")}>
          <Ionicons name="calendar-outline" size={28} />
        </TouchableOpacity>
      </>
    )}
    <TouchableOpacity
      onPress={() => navigation.navigate("InstructorChats")}
      style={navBarStyles.notificationButton}
    >
      <Ionicons name="chatbubble-outline" size={28} />
      {unreadCount > 0 && (
        <View style={navBarStyles.badge}>
          <Text style={navBarStyles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
      <Ionicons name="person-outline" size={28} />
    </TouchableOpacity>
  </View>
  );
};

export default NavBar;
