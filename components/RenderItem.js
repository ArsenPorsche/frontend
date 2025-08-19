import React from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import DropDownPicker from "react-native-dropdown-picker";
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
    selectedButton,
  } = props;

  switch (item.type) {
    case "header":
      return <Text style={styles.header}>Choose Instructor and Date</Text>;

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
                        selectedTime === time.value && selectedButton == groupIndex &&
                          styles.selectedTimeButton,
                      ]}
                      onPress={() => handleTimeSelect(time.value, groupIndex, instructorGroup.instructorId)}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          selectedTime === time.value && selectedButton == groupIndex &&
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
      return (
        <View style={styles.buttonContainer}>
          <Button
            title="Book Lesson"
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
