import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { editProfileStyles } from "../styles/EditProfileStyles";
import { userService } from "../services/api";

const EditProfile = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await userService.getProfile();
      setPhoneNumber(userData.phoneNumber || "");
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const validateInputs = () => {
    if (newPassword && newPassword.trim()) {
      if (!currentPassword || !currentPassword.trim()) {
        Alert.alert("Error", "Current password is required to set new password");
        return false;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "New passwords do not match");
        return false;
      }
    }

    const hasPhoneNumber = phoneNumber && phoneNumber.trim();
    const hasNewPassword = newPassword && newPassword.trim();
    
    if (!hasPhoneNumber && !hasNewPassword) {
      Alert.alert("No Changes", "Please enter a phone number or password to update");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const updates = {};
      
      if (phoneNumber && phoneNumber.trim()) {
        updates.phoneNumber = phoneNumber.trim();
      }
      
      if (newPassword && newPassword.trim()) {
        updates.currentPassword = currentPassword;
        updates.newPassword = newPassword;
      }

      await userService.updateProfile(updates);
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        
        if (message?.includes("password")) {
          Alert.alert("Password Error", message.replace(/"/g, ''));
        } else if (message?.includes("Phone")) {
          Alert.alert("Phone Number Error", message.replace(/"/g, ''));
        } else {
          Alert.alert("Error", message || "Please check your input and try again");
        }
      } else {
        Alert.alert("Error", error.response?.data?.message || error.message || "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={editProfileStyles.container}>
      <ScrollView style={editProfileStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={editProfileStyles.title}>Edit Profile</Text>
        
        <View style={editProfileStyles.section}>
          <Text style={editProfileStyles.sectionTitle}>Phone Number</Text>
          <TextInput
            style={editProfileStyles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>

        <View style={editProfileStyles.section}>
          <Text style={editProfileStyles.sectionTitle}>Change Password</Text>
          <TextInput
            style={editProfileStyles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            secureTextEntry
          />
          <TextInput
            style={editProfileStyles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
          />
          <TextInput
            style={editProfileStyles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[editProfileStyles.saveButton, loading && editProfileStyles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={editProfileStyles.saveButtonText}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={editProfileStyles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={editProfileStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
      
    </View>
  );
};

export default EditProfile;