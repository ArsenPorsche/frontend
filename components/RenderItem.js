import React from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { styles } from "../styles/AppStyles";
import { calendarTheme } from "../config/calendarConfig";

export const renderItem = (item, props) => {
  const {
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
    navigation,
  } = props;

  switch (item.type) {
    case "header":
      const headerTitle = item.lessonType === "exam" ? "Book an Exam" : "Book a Lesson";
      return (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#2d4150" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{headerTitle}</Text>
          <View style={{ width: 24 }} />
        </View>
      );

    case "scheduleHeader":
      return (
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerText}>Check your Schedule</Text>
          <View style={{ width: 24 }} />
        </View>
      );

    case "instructor":
      return (
        <View style={[styles.pickerContainer, { zIndex: 1000 }]}>
          <Text style={styles.label}>Instructor:</Text>
          <DropDownPicker
            open={openInstructorDropdown}
            value={selectedInstructor}
            items={instructors}
            setOpen={setOpenInstructorDropdown}
            setValue={setSelectedInstructor}
            placeholder="Select instructor"
            style={styles.picker}
            dropDownContainerStyle={styles.dropDown}
          />
        </View>
      );

    case "calendar":
      return (
        <View style={styles.calendarContainer}>
          <Text style={styles.label}>Date:</Text>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={calendarTheme}
            minDate={moment().format("YYYY-MM-DD")}
            maxDate={moment().add(2, "weeks").format("YYYY-MM-DD")}
          />
        </View>
      );

    case "times":
      return (
        <View style={styles.timesContainer}>
          <Text style={styles.label}>Available Times:</Text>
          {availableTimes.length > 0 ? (
            availableTimes.map((instructorGroup, groupIndex) => (
              <View key={groupIndex} style={styles.instructorGroup}>
                <Text style={styles.instructorGroupTitle}>
                  {instructorGroup.instructorName}
                </Text>
                <View style={styles.timeGrid}>
                  {instructorGroup.times.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeButton,
                        selectedTime === time.value &&
                          styles.selectedTimeButton,
                      ]}
                      activeOpacity={1}
                      onPress={() =>
                        handleTimeSelect(
                          time.value,
                          instructorGroup.instructorId
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          selectedTime === time.value &&
                            styles.selectedTimeButtonText,
                        ]}
                      >
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noTimesText}>
              No available times on this date
            </Text>
          )}
        </View>
      );

    case "instructorsTimes":
      return (
        <View style={styles.timesContainer}>
          <Text style={styles.label}>Times:</Text>
          {availableTimes.length > 0 ? (
            availableTimes
              .filter((statusGroup) => statusGroup.statusName !== "Canceled")
              .map((statusGroup, groupIndex) => (
                <View key={groupIndex} style={styles.instructorGroup}>
                  <Text style={styles.instructorGroupTitle}>
                    {statusGroup.statusName}
                  </Text>
                  <View style={styles.timeGrid}>
                    {statusGroup.times.map((time, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeButton,
                          selectedTime === time.value &&
                            styles.selectedTimeButton,
                        ]}
                        activeOpacity={1}
                        onPress={() =>
                          handleTimeSelect(
                            time.value,
                            time.lessonId,
                            time
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            selectedTime === time.value &&
                              styles.selectedTimeButtonText,
                          ]}
                        >
                          {time.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
          ) : (
            <Text style={styles.noTimesText}>
              No available times on this date
            </Text>
          )}
        </View>
      );

    case "button":
      const buttonTitle = item.lessonType === "exam" ? "Book Exam" : "Book Lesson";
      return (
        <View style={styles.buttonContainer}>
          <Button
            title={buttonTitle}
            onPress={handleBookLesson}
            color="#007AFF"
          />
        </View>
      );

    case "info":
      return (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Instructor:{" "}
            {instructors.find((i) => i.value === selectedInstructor)?.label}
          </Text>
          <Text style={styles.infoText}>
            Date: {moment(selectedDate).format("D MMMM YYYY")}
          </Text>
          {selectedTime && (
            <Text style={styles.infoText}>
              Time:{" "}
              {(() => {
                for (const group of availableTimes) {
                  const foundTime = group.times.find(
                    (t) => t.value === selectedTime
                  );
                  if (foundTime) {
                    return foundTime.label;
                  }
                }
                return selectedTime;
              })()}
            </Text>
          )}
        </View>
      );

    default:
      return null;
  }
};
