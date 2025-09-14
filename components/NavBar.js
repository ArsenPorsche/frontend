import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { navBarStyles } from "../styles/NavBarStyles";

const NavBar = ({ role, navigation }) => (
  <View style={navBarStyles.container}>
    <TouchableOpacity onPress={() => navigation.navigate("Home")}>
      <Ionicons name="home-outline" size={28} />
    </TouchableOpacity>
    {role === "student" && (
      <>
        <TouchableOpacity onPress={() => navigation.navigate("BookLesson")}>
          <Ionicons name="calendar-outline" size={28} />
        </TouchableOpacity>
        <TouchableOpacity>
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
    <TouchableOpacity>
      <Ionicons name="chatbubble-outline" size={28} />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
      <Ionicons name="person-outline" size={28} />
    </TouchableOpacity>
  </View>
);

export default NavBar;
