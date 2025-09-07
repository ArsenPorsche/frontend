import React, { useState, useEffect } from "react";
import { View, FlatList, Alert } from "react-native";
import { instructorService, lessonService } from "../services/api";
import { processLessonsData, createRenderData } from "../utils/dataProcessing";
import { renderItem } from "../components/RenderItem";
import { styles } from "../styles/AppStyles";
import moment from "moment";

const BookLesson = ({ token, userId }) => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState("all");
  const [lessons, setLessons] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [openInstructorDropdown, setOpenInstructorDropdown] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadInitialData();
  }, [token]);

  useEffect(() => {
    const { marked, groupedTimes } = processLessonsData(lessons, selectedInstructor, selectedDate);
    setMarkedDates(marked);
    setAvailableTimes(groupedTimes);
  }, [lessons, selectedInstructor, selectedDate]);

  const loadInitialData = async () => {
    try {
      const instructorsData = await instructorService.getInstructors(token);
      if (Array.isArray(instructorsData)) {
        const instructorOptions = [
          { label: "All Instructors", value: "all" },
          ...instructorsData.map((instructor) => ({
            label: instructor.name || "Unknown",
            value: instructor._id || "unknown",
          })),
        ];
        setInstructors(instructorOptions);
      }
      const lessonsData = await lessonService.getLessons(token);
      setLessons(lessonsData);
    } catch (error) {
      Alert.alert("Error", "Failed to load data. Please try again.");
    }
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    const hasAvailableLessons = lessons.some(
      (lesson) => lesson.status === "available" && moment(lesson.date).format("YYYY-MM-DD") === dateString
    );
    if (hasAvailableLessons) {
      setSelectedDate(dateString);
      setSelectedTime(null);
      setSelectedInstructor("all");
    } else {
      Alert.alert("No lessons available", "Please select another date.");
    }
  };

  const handleTimeSelect = (timeValue, instructorId) => {
    setSelectedTime(timeValue);
    setSelectedInstructor(instructorId);
  };

  const handleBookLesson = async () => {
    if (selectedTime && selectedInstructor) {
      const lesson = lessons.find(
        (l) => l.instructor._id === selectedInstructor && moment(l.date).format("YYYY-MM-DD HH:mm") === selectedTime
      );
      if (lesson) {
        try {
          await lessonService.bookLesson(token, lesson._id, userId);
          Alert.alert("Success", "Lesson booked successfully!");
          setLessons((prev) => prev.filter((l) => l._id !== lesson._id));
          setSelectedTime(null);
          setSelectedDate(null);
          setSelectedInstructor("all");
        } catch (error) {
          Alert.alert("Error", error.message || "Failed to book lesson");
        }
      }
    } else {
      Alert.alert("Error", "Please select a time or log in again.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setToken(null);
    } catch (error) {
      console.log("Error logging out:", error.message);
    }
  };

  const renderData = createRenderData(selectedInstructor, selectedDate, selectedTime);

  const itemRenderer = (item) =>
    renderItem(item, {
      instructors,
      openInstructorDropdown,
      setOpenInstructorDropdown,
      selectedInstructor,
      setSelectedInstructor,
      markedDates,
      handleDayPress,
      availableTimes,
      selectedTime,
      handleTimeSelect,
      handleBookLesson,
      selectedDate,
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
    </View>
  );
};

export default BookLesson;