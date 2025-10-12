import moment from "moment";
import _ from "lodash";

export const processBookingData = (
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
        instructorName:
          `${instructorLessons[0].instructor.firstName} ${instructorLessons[0].instructor.lastName}`.trim(),
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

export const processScheduleData = (lessons, selectedDate) => {
  // Update marked dates
  const marked = {};

  const availableDates = lessons.map((lesson) =>
    moment(lesson.date).format("YYYY-MM-DD")
  );

  availableDates.forEach((date) => {
    const lessonsForDate = lessons.filter(
      (lesson) => moment(lesson.date).format("YYYY-MM-DD") === date
    );

    if (lessonsForDate.length > 0) {
      marked[date] = {
        marked: true,
        dotColor: "#50C878",
        selectedColor: "#50C878",
      };
      if (lessonsForDate.some((lesson) => lesson.status === "booked")) {
        marked[date] = {
          ...marked[date],
          dotColor: "#db4242ff",
          selectedColor: "#db4242ff",
        };
      }
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
    const lessonsForSelectedDate = lessons.filter(
      (lesson) => moment(lesson.date).format("YYYY-MM-DD") === selectedDate
    );

    const groupedByStatus = _.groupBy(lessonsForSelectedDate, "status");

    groupedTimes = Object.entries(groupedByStatus).map(
      ([statusName, statusLessons]) => ({
        statusName: toUpperCase(statusName),
        times: statusLessons
          .map((lesson) => ({
            label: `${moment(lesson.date).format("HH:mm")} - ${moment(
              lesson.date
            )
              .add(2, "hours")
              .format("HH:mm")}`,
            value: moment(lesson.date).format("YYYY-MM-DD HH:mm"),
            sortValue: moment(lesson.date).valueOf(),
            lessonId: lesson._id,
            lessonType: lesson.type,
            studentName: lesson.student ? `${lesson.student.firstName} ${lesson.student.lastName}` : null,
            instructorName: lesson.instructor ? `${lesson.instructor.firstName} ${lesson.instructor.lastName}` : null,
          }))
          .sort((a, b) => a.sortValue - b.sortValue),
      })
    );
  }
  return { marked, groupedTimes };
};

export const createRenderData = (
  selectedInstructor,
  selectedDate,
  selectedTime,
  userRole,
  lessonType = "lesson"
) => {
  let data = null;
  switch (userRole) {
    case "instructor":
      data = [
        { type: "scheduleHeader", id: "scheduleHeader", lessonType },
        { type: "calendar", id: "calendar" },
      ];

      if (selectedDate)
        data.push({ type: "instructorsTimes", id: "instructorsTimes" });

      break;
    case "student":
      // For student schedule view - show their booked lessons
      if (lessonType === "schedule") {
        data = [
          { type: "scheduleHeader", id: "scheduleHeader" },
          { type: "calendar", id: "calendar" },
        ];

        if (selectedDate)
          data.push({ type: "instructorsTimes", id: "instructorsTimes" });
      } else {
        // Original booking flow for students
        data = [
          { type: "header", id: "header", lessonType },
          { type: "instructor", id: "instructor" },
          { type: "calendar", id: "calendar" },
        ];

        if (selectedInstructor && selectedDate) {
          data.push({ type: "times", id: "times" });

          if (selectedTime) {
            data.push({ type: "button", id: "button", lessonType });
          }

          data.push({ type: "info", id: "info" });
        }
      }
      break;
    default:
      break;
  }

  return data;
};

function toUpperCase(word){
  let firstLetter = word[0].toUpperCase();
  return firstLetter + word.slice(1);
}

export function formatDate(dateIso){
  const d = new Date(dateIso);

    const date = d.toLocaleDateString("pl-PL"); 
    const time = d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`
}