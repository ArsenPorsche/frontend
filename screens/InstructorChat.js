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

export default function InstructorChat({ route, navigation }) {
  const { instructorId, instructorName } = route.params;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getInstructorNotifications(instructorId);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.log("Error fetching notifications:", error.message);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [instructorId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.log("Error marking as read:", error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markInstructorAsRead(instructorId);
      fetchNotifications();
    } catch (error) {
      console.log("Error marking all as read:", error.message);
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notificationId);
              fetchNotifications();
            } catch (error) {
              console.log("Error deleting notification:", error.message);
              Alert.alert("Error", "Failed to delete message");
            }
          },
        },
      ]
    );
  };

  const renderNotification = ({ item }) => {
    const date = new Date(item.createdAt).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => !item.read && handleMarkAsRead(item._id)}
        onLongPress={() => handleDelete(item._id)}
      >
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationDate}>{date}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{instructorName}</Text>
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages</Text>
            </View>
          )
        }
        contentContainerStyle={notifications.length === 0 && styles.emptyList}
      />
    </View>
  );
}
