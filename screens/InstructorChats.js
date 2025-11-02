import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { notificationService } from "../services/api";
import { styles } from "../styles/NotificationsStyles";
import NavBar from "../components/NavBar";

export default function InstructorChats({ navigation, tokenRole }) {
  const [instructors, setInstructors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getInstructorChats();
      setInstructors(data.instructors || []);
    } catch (error) {
      console.log("Error fetching instructor chats:", error.message);
      Alert.alert("Error", "Failed to load chats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchInstructors();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInstructors();
  };

  const renderInstructor = ({ item }) => {
    const instructor = item._id;
    const date = new Date(item.lastMessageDate).toLocaleString("pl-PL", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={[styles.notificationCard, item.unreadCount > 0 && styles.unreadCard]}
        onPress={() =>
          navigation.navigate("InstructorChat", {
            instructorId: instructor._id,
            instructorName: `${instructor.firstName} ${instructor.lastName}`,
          })
        }
      >
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>
            {instructor.firstName} {instructor.lastName}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {item.lastMessage}
        </Text>
        <Text style={styles.notificationDate}>{date}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={instructors}
        renderItem={renderInstructor}
        keyExtractor={(item) => item._id._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          )
        }
        contentContainerStyle={instructors.length === 0 && styles.emptyList}
      />
      <NavBar role={tokenRole} navigation={navigation} />
    </View>
  );
}
