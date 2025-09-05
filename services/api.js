import axios from "axios";

const BASE_URL = "http://192.168.0.73:3000";

//Auth service
export const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.log("Error logining:", error.message);
      throw error;
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refreshToken
      });
      return response.data;
    } catch (error) {
      console.log("Error refreshing token:", error.message);
      throw error;
    }
  },
};

// Instructor service
export const instructorService = {
  async getInstructors(token) {
    try {
      const response = await axios.get(`${BASE_URL}/instructors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
  async getLessons(token) {
    try {
      const response = await axios.get(`${BASE_URL}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching lessons:", error.message);
      throw error;
    }
  },

  async bookLesson(token, lessonId, studentEmail) {
    try {
      const response = await axios.post(
        `${BASE_URL}/lessons/book`,
        {
          lessonId,
          studentEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Error booking lesson:", error.message);
      throw error;
    }
  },
};
