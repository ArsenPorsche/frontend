import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import { lessonService } from "../services/api";
import {
  processScheduleData,
  createRenderData,
  formatDate,
} from "../utils/dataProcessing";
import { renderItem } from "../components/RenderItem";
import { styles } from "../styles/AppStyles";
import moment from "moment";

const Schedule = ({ token, userId, userRole }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [isTimeMenuVisible, setIsTimeMenuVisible] = useState(false);
  const [selectedTimeForMenu, setSelectedTimeForMenu] = useState(null);
  const [dateOffer, setDateOffer] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, [token]);

  useEffect(() => {
    const { marked, groupedTimes } = processScheduleData(lessons, selectedDate);
    setMarkedDates(marked);
    setAvailableTimes(groupedTimes);
  }, [lessons, selectedDate]);

  const loadInitialData = async () => {
    try {
      console.log("Loading lessons for instructorId:", userId);
      const lessonsData = await lessonService.getInstructorsLessons(
        token,
        userId
      );
      setLessons(lessonsData);
    } catch (error) {
      Alert.alert("Error", "Failed to load data. Please try again.");
    }
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    const hasAvailableLessons = lessons.some(
      (lesson) => moment(lesson.date).format("YYYY-MM-DD") === dateString
    );
    if (hasAvailableLessons) {
      setSelectedDate(dateString);
    } else {
      Alert.alert("No lessons available", "Please select another date.");
    }
  };

  const handleTimeSelect = (timeValue, lessonId) => {
    setSelectedTime(timeValue);
    setSelectedLesson(lessonId);
    setSelectedTimeForMenu(timeValue);
    setIsTimeMenuVisible(true);
  };

  const handleMenuAction = async () => {
    const lessonsDate = await lessonService.getLessonOffer(token, userId);
    setDateOffer(lessonsDate);
  };

  const handleAcceptAction = async () => {
    const lessonData = await lessonService.changeLesson(
      token,
      selectedLesson,
      dateOffer
    );
    setLessons((prevLessons) => {
      const updatedLessons = prevLessons.filter(
        (l) => l._id !== selectedLesson
      );
      return [...updatedLessons, lessonData].sort(
        (a, b) => moment(a.date) - moment(b.date)
      );
    });
    Alert.alert("Lesson has canceled", selectedTimeForMenu);
    setSelectedTime(null);
    setIsTimeMenuVisible(false);
  };

  const handleCancelButton = () => {
    setSelectedTime(null);
    setIsTimeMenuVisible(false);
    setDateOffer(null);
  };

  const renderData = createRenderData(null, selectedDate, null, userRole);

  const itemRenderer = (item) =>
    renderItem(item, {
      markedDates,
      handleDayPress,
      availableTimes,
      selectedDate,
      selectedTime,
      handleTimeSelect,
    });

  return (
    <View style={styles.container}>
      <FlatList
        data={renderData}
        renderItem={({ item }) => itemRenderer(item)}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />

      <Modal
        transparent={true}
        visible={isTimeMenuVisible}
        animationType="fade"
        onRequestClose={() => setIsTimeMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {!dateOffer ? (
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Selected Time: {selectedTimeForMenu}
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleMenuAction}
              >
                <Text style={styles.modalButtonText}>Cancel lesson</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCancelButton}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Time Proposal : {formatDate(dateOffer)}
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAcceptAction}
              >
                <Text style={styles.modalButtonText}>
                  Accept Lesson & Cancel old One
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleMenuAction}
              >
                <Text style={styles.modalButtonText}>
                  Generate another Time
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCancelButton}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default Schedule;
