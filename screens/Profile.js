import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import NavBar from "../components/NavBar";
import { profileStyles } from "../styles/ProfileStyles";

const Profile = ({ navigation, tokenRole, handleLogout }) => (
  <View style={profileStyles.container}>
    <View style={profileStyles.header}>
      <Text style={profileStyles.headerText}>My profile</Text>
    </View>
    {/* <TouchableOpacity
      style={profileStyles.menuItem}
      onPress={() => navigation.navigate("EditProfile")}
    >
      <Text style={profileStyles.menuText}>Edit profile</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={profileStyles.menuItem}
      onPress={() => navigation.navigate("RideHistory")}
    >
      <Text style={profileStyles.menuText}>Ride history</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={profileStyles.menuItem}
      onPress={() => navigation.navigate("Tests")}
    >
      <Text style={profileStyles.menuText}>Tests</Text>
    </TouchableOpacity> */}
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