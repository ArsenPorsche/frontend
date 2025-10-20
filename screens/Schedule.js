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
import NavBar from "../components/NavBar";
import { styles } from "../styles/AppStyles";
import moment from "moment";

const Schedule = ({ navigation, token, userRole }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTimeInfo, setSelectedTimeInfo] = useState(null);
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
      console.log("Loading lessons for role:", userRole);
      let lessonsData;
      if (userRole === "instructor") {
        lessonsData = await lessonService.getInstructorsLessons();
      } else if (userRole === "student") {
        lessonsData = await lessonService.getStudentLessons();
      }
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

  const handleTimeSelect = (timeValue, lessonId, timeInfo = null) => {
    setSelectedTime(timeValue);
    setSelectedLesson(lessonId);
    setSelectedTimeForMenu(timeValue);
    setSelectedTimeInfo(timeInfo);
    setIsTimeMenuVisible(true);
  };

  const handleGenerateAction = async () => {
    try {
      if (userRole === "instructor") {
        const lessonsDate = await lessonService.getLessonOffer();
        setDateOffer(lessonsDate);
        if (lessonsDate === null) {
          Alert.alert("Error", "You have not free hours.");
        }
      } else if (userRole === "student") {
        handleCancelLesson();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate lesson offer.");
    }
  };

  const handleCancelLesson = async () => {
    try {
      const response = await lessonService.cancelLesson(selectedLesson);
      
      setLessons((prevLessons) => 
        prevLessons.filter((l) => l._id !== selectedLesson)
      );
      
      const refundMessage = response.refunded 
        ? `Lesson cancelled and refunded (cancelled ${response.hoursBefore}h before)`
        : `Lesson cancelled (cancelled ${response.hoursBefore}h before - no refund)`;
        
      Alert.alert("Success", refundMessage);
      setIsTimeMenuVisible(false);
      setSelectedTime(null);
      setSelectedTimeInfo(null);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to cancel lesson");
    }
  };

  const handleAcceptAction = async () => {
    const lessonData = await lessonService.changeLesson(
      selectedLesson,
      dateOffer
    );
    const { newLesson, oldLesson } = lessonData;
    setLessons((prevLessons) => {
      const updatedLessons = prevLessons.filter(
        (l) => l._id !== selectedLesson
      );
      return [...updatedLessons, newLesson].sort(
        (a, b) => moment(a.date) - moment(b.date)
      );
    });
    Alert.alert("Lesson has canceled", selectedTimeForMenu);
    setSelectedTime(null);
    setIsTimeMenuVisible(false);
    setDateOffer(null);
  };

  const handleCloseAction = () => {
    setSelectedTime(null);
    setSelectedTimeInfo(null);
    setIsTimeMenuVisible(false);
    setDateOffer(null);
  };

  const renderData = createRenderData(null, selectedDate, null, userRole, "schedule");

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
      <NavBar role={userRole} navigation={navigation} />

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
                Selected Time: {formatDate(selectedTimeForMenu)}
              </Text>
              {selectedTimeInfo && (
                <>
                  <Text style={styles.modalText}>
                    Type: {selectedTimeInfo.lessonType === "exam" ? "Exam" : "Lesson"}
                  </Text>
                  {userRole === "instructor" && selectedTimeInfo.studentName && (
                    <Text style={styles.modalText}>
                      Student: {selectedTimeInfo.studentName}
                    </Text>
                  )}
                  {userRole === "student" && selectedTimeInfo.instructorName && (
                    <Text style={styles.modalText}>
                      Instructor: {selectedTimeInfo.instructorName}
                    </Text>
                  )}
                </>
              )}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleGenerateAction}
              >
                <Text style={styles.modalButtonText}>Cancel lesson</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCloseAction}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Old Time: {formatDate(selectedTimeForMenu)}
              </Text>
              <Text style={styles.modalText}>
                Time Proposal: {formatDate(dateOffer)}
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
                onPress={handleGenerateAction}
              >
                <Text style={styles.modalButtonText}>
                  Generate another Time
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCloseAction}
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
