import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import NavBar from "../components/NavBar";
import { profileStyles } from "../styles/ProfileStyles";

const Profile = ({ navigation, tokenRole, handleLogout }) => (
  <View style={profileStyles.container}>
    <View style={profileStyles.header}>
      <Text style={profileStyles.headerText}>My profile</Text>
    </View>
    <TouchableOpacity
      style={profileStyles.menuItem}
      onPress={() => navigation.navigate("EditProfile")}
    >
      <Text style={profileStyles.menuText}>Edit profile</Text>
    </TouchableOpacity>
    {tokenRole === "student" && (
      <TouchableOpacity
        style={profileStyles.menuItem}
        onPress={() => navigation.navigate("LessonHistory")}
      >
        <Text style={profileStyles.menuText}>Lesson History</Text>
      </TouchableOpacity>
    )}
    {tokenRole === "student" && (
      <TouchableOpacity
        style={profileStyles.menuItem}
        onPress={() => navigation.navigate("TestCategories")}
      >
        <Text style={profileStyles.menuText}>Theory Tests</Text>
      </TouchableOpacity>
    )}
    {tokenRole === "instructor" && (
      <TouchableOpacity
        style={profileStyles.menuItem}
        onPress={() => navigation.navigate("InstructorHistory")}
      >
        <Text style={profileStyles.menuText}>Lesson History</Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity
      style={profileStyles.menuItem}
      onPress={handleLogout}
    >
      <Text style={profileStyles.menuText}>Logout</Text>
    </TouchableOpacity>
    <NavBar role={tokenRole} navigation={navigation} />
  </View>
);

export default Profile;