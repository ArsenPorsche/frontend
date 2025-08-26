import React, { useState, useEffect } from "react";
import { View, FlatList } from "react-native";
import { instructorService, lessonService } from "./services/api";
import { processLessonsData, createRenderData } from "./utils/dataProcessing";
import { renderItem } from "./components/RenderItem";
import { styles } from "./styles/AppStyles";
import moment from "moment";

export default function App() {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState("all");
  const [lessons, setLessons] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [studentEmail] = useState("volodymyr@example.com");
  const [openInstructorDropdown, setOpenInstructorDropdown] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedButton, setSelectedButton] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const { marked, groupedTimes } = processLessonsData(
      lessons,
      selectedInstructor,
      selectedDate
    );
    setMarkedDates(marked);
    setAvailableTimes(groupedTimes);
  }, [lessons, selectedInstructor, selectedDate]);

  const loadInitialData = async () => {
    try {
      // Load instructors
      const instructorsData = await instructorService.getInstructors();
      if (Array.isArray(instructorsData)) {
        const instructorOptions = [
          { label: "All Instructors", value: "all" },
          ...instructorsData.map((instructor) => ({
            label: instructor.name || "Unknown",
            value: instructor._id || instructor.id || "unknown",
          })),
        ];
        setInstructors(instructorOptions);
      }

      // Load lessons
      const lessonsData = await lessonService.getLessons();
      setLessons(lessonsData);
    } catch (error) {
      console.log("Error loading initial data:", error.message);
    }
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;

    const hasAvailableLessons = lessons.some(
      (lesson) =>
        lesson.status === "available" &&
        moment(lesson.date).format("YYYY-MM-DD") === dateString
    );

    if (hasAvailableLessons) {
      setSelectedDate(dateString);
      setSelectedTime(null);
      setSelectedInstructor("all");
    }
  };

  const handleTimeSelect = (timeValue, buttonIndex, instructorId) => {
    setSelectedTime(timeValue);
    setSelectedButton(buttonIndex);
    setSelectedInstructor(instructorId);
  };

  const handleBookLesson = async () => {
    if (selectedInstructor && selectedTime) {
      const lesson = lessons.find(
        (l) =>
          l.instructor._id === selectedInstructor &&
          moment(l.date).format("YYYY-MM-DD HH:mm") === selectedTime
      );

      if (lesson) {
        try {
          await lessonService.bookLesson(lesson._id, studentEmail);
          alert("Lesson booked successfully!");

          const updatedLessons = await lessonService.getLessons();
          setLessons(updatedLessons);
          setSelectedTime(null);
        } catch (error) {
          alert("Failed to book lesson");
        }
      }
    }
  };

  const renderData = createRenderData(
    selectedInstructor,
    selectedDate,
    selectedTime
  );

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
      selectedButton,
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
}
