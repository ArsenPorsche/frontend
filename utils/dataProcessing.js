import moment from "moment";
import _ from "lodash";

export const processLessonsData = (
  lessons,
  selectedInstructor,
  selectedDate
) => {
  // Update marked dates
  const marked = {};

  const availableDates = lessons
    .filter((lesson) => lesson.status === "available")
    .map((lesson) => moment(lesson.date).format("YYYY-MM-DD"));

  availableDates.forEach((date) => {
    const lessonsForDate = lessons.filter(
      (lesson) =>
        lesson.status === "available" &&
        moment(lesson.date).format("YYYY-MM-DD") === date
    );

    if (lessonsForDate.length > 0) {
      marked[date] = {
        marked: true,
        dotColor: "#50C878",
        selectedColor: "#50C878",
      };
    }
  });

  if (selectedDate) {
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: "#007AFF",
    };
  }

  let groupedTimes = [];
  if (selectedDate) {
    const availableLessons = lessons.filter(
      (lesson) =>
        (selectedInstructor === "all" ||
          selectedInstructor === null ||
          lesson.instructor._id === selectedInstructor) &&
        lesson.status === "available" &&
        moment(lesson.date).format("YYYY-MM-DD") === selectedDate
    );

    const groupedByInstructor = _.groupBy(availableLessons, "instructor._id");

    groupedTimes = Object.entries(groupedByInstructor).map(
      ([instructorId, instructorLessons]) => ({
        instructorId,
        instructorName: `${instructorLessons[0].instructor.firstName} ${instructorLessons[0].instructor.lastName}`.trim(),
        times: instructorLessons
          .map((lesson) => ({
            label: `${moment(lesson.date).format("HH:mm")} - ${moment(
              lesson.date
            )
              .add(2, "hours")
              .format("HH:mm")}`,
            value: moment(lesson.date).format("YYYY-MM-DD HH:mm"),
            sortValue: moment(lesson.date).valueOf(),
            lessonId: lesson._id,
          }))
          .sort((a, b) => a.sortValue - b.sortValue),
      })
    );

    groupedTimes.sort((a, b) =>
      a.instructorName.localeCompare(b.instructorName)
    );
  }

  return { marked, groupedTimes };
};

export const createRenderData = (
  selectedInstructor,
  selectedDate,
  selectedTime
) => {
  const data = [
    { type: "header", id: "header" },
    { type: "instructor", id: "instructor" },
    { type: "calendar", id: "calendar" },
  ];

  if (selectedInstructor && selectedDate) {
    data.push({ type: "times", id: "times" });

    if (selectedTime) {
      data.push({ type: "button", id: "button" });
    }

    data.push({ type: "info", id: "info" });
  }

  return data;
};
