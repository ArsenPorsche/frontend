import axios from "axios";

const BASE_URL = "http://192.168.0.73:3000";

// Instructor service
export const instructorService = {
  async getInstructors() {
    try {
      const response = await axios.get(`${BASE_URL}/instructors`);
      console.log("Instructors response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching instructors:", error.message);
      throw error;
    }
  },
};

// Lesson service
export const lessonService = {
  async getLessons() {
    try {
      const response = await axios.get(`${BASE_URL}/lessons`);
      console.log("Lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching lessons:", error.message);
      throw error;
    }
  },

  async bookLesson(lessonId, studentEmail) {
    try {
      const response = await axios.post(`${BASE_URL}/lessons/book`, {
        lessonId,
        studentEmail,
      });
      return response.data;
    } catch (error) {
      console.log("Error booking lesson:", error.message);
      throw error;
    }
  },
};
