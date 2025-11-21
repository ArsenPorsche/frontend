import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { chatService } from "../services/api";
import { getSocket } from "../services/socket";
import * as SecureStore from "expo-secure-store";
import { styles } from "../styles/NotificationsStyles";
import { Ionicons } from "@expo/vector-icons";

export default function ChatThread({ route, navigation, tokenRole }) {
  const { chatId, partnerId, partnerName } = route.params;
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [oldestDate, setOldestDate] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const messageIdsRef = useRef(new Set());
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  const fetchMessages = async (params = {}) => {
    try {
      const { before } = params;
      if (!before) setLoading(true);
      const data = await chatService.getMessages(chatId, { limit: 50, ...(before ? { before } : {}) });
      const fetchedDesc = data.messages || [];
      const fetched = fetchedDesc.slice().reverse();

      if (before) {
        // prepend older
        setMessages((prev) => {
          const combined = [...fetched, ...prev];
          const ids = new Set();
          const unique = [];
          for (const m of combined) {
            const id = m._id ? String(m._id) : null;
            if (id && !ids.has(id)) { ids.add(id); unique.push(m); }
          }
          return unique;
        });
      } else {
        setMessages(fetched);
        const ids = new Set();
        for (const m of fetched) {
          if (m._id) ids.add(String(m._id));
        }
        messageIdsRef.current = ids;

        if (fetched.length > 0) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      }

      if (fetched.length > 0) {
        setOldestDate(fetched[0].createdAt);
      }
      setHasMore(fetchedDesc.length >= 50);

      try { await chatService.markChatRead(chatId); } catch (e) {}
    } catch (error) {
      console.log("Error fetching chat messages:", error.message);
      Alert.alert("Error", "Failed to load chat");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadEarlier = async () => {
    if (!hasMore || !oldestDate) return;
    await fetchMessages({ before: oldestDate });
  };

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const setup = async () => {
        await fetchMessages();
        try {
          const token = await SecureStore.getItemAsync("token");
          const socket = getSocket(token);
          socketRef.current = socket;
          socket.emit("chat:join", { chatId });
          const onNewMessage = async (payload) => {
            if (!isMounted) return;
            const id = payload?._id ? String(payload._id) : null;
            if (id && messageIdsRef.current.has(id)) {
              return;
            }
            if (id) messageIdsRef.current.add(id);
            setMessages((prev) => [...prev, payload]);
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
            const senderId = payload.sender?._id || payload.sender;
            if (senderId === partnerId) {
              try { await chatService.markChatRead(chatId); } catch {}
            }
          };
          socket.on("message:new", onNewMessage);
        } catch (e) {
          console.log('Socket setup error:', e);
        }
      };

      setup();

      return () => {
        isMounted = false;
        if (socketRef.current) {
          socketRef.current.off("message:new");
          socketRef.current.emit("chat:leave", { chatId });
        }
      };
    }, [chatId, partnerId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    try {
      await chatService.sendMessage(partnerId, text);
      setInputText("");
    } catch (e) {
      console.log("Error sending message:", e.message);
      Alert.alert("Error", "Failed to send message");
    }
  };
  const handleInputChange = (t) => setInputText(t);

  const renderMessage = ({ item }) => {
    const date = new Date(item.createdAt).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const isSystem = item.type === 'system';
    const senderRole = item.data?.sender || null;
    const isCurrentInstructor = tokenRole === 'instructor';
    let sentByCurrentUser = false;
    if (senderRole) {
      sentByCurrentUser = (isCurrentInstructor && senderRole === 'instructor') || (!isCurrentInstructor && senderRole === 'student');
    } else {
      const senderId = item.sender?._id || item.sender;
      sentByCurrentUser = senderId !== partnerId;
    }

    // System messages are centered and styled differently
    if (isSystem) {
      return (
        <View style={{ paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: '#f3f4f6', 
            paddingVertical: 8, 
            paddingHorizontal: 14, 
            borderRadius: 12,
            maxWidth: '90%',
          }}>
            <Text style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 18 }}>
              {item.text || item.body}
            </Text>
            <Text style={[styles.notificationDate, { marginTop: 4, textAlign: 'center' }]}>{date}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.messageRow}>
        <TouchableOpacity
          style={[
            styles.messageBubble,
            sentByCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
          ]}
          activeOpacity={0.9}
        >
          <Text style={styles.messageText}>{item.text || item.body}</Text>
          <Text style={[styles.notificationDate, { marginTop: 6 }]}>{date}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#2d4150" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{partnerName}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, idx) => item._id || String(idx)}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={hasMore ? (
          <TouchableOpacity style={{ padding: 12, alignItems: 'center' }} onPress={loadEarlier}>
            <Text style={{ color: '#2563eb' }}>Load earlier messages</Text>
          </TouchableOpacity>
        ) : null}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages</Text>
            </View>
          )
        }
        contentContainerStyle={[messages.length === 0 && styles.emptyList, { paddingBottom: 100 }]}
      />

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#fff' }}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={inputText}
          onChangeText={handleInputChange}
          placeholderTextColor="#6b7280"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </View>
    </KeyboardAvoidingView>
  );
}
