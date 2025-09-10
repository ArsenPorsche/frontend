import axios from "axios";
import Constants from "expo-constants";

const { BASE_URL } = Constants.expoConfig.extra;

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

  async register(firstName, lastName, role, phoneNumber, email, password) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        firstName,
        lastName,
        role,
        phoneNumber,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.log("Error registering:", error.message);
      throw error;
    }
  },

  async validateToken(token) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/validate-token`, {
        token,
      });
      return response.data;
    } catch (error) {
      console.log(
        "Token validation error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refreshToken,
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

  async bookLesson(token, lessonId, studentId) {
    try {
      const response = await axios.post(
        `${BASE_URL}/lessons/book`,
        {
          lessonId,
          studentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Error booking lesson:", error.message);
      throw error;
    }
  },

  async getInstructorsLessons(token, instructorId) {
    try {
      const response = await axios.get(
        `${BASE_URL}/lessons/instructors`,
        {
          params: { instructorId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching lessons:", error.message, error.response?.status, error.response?.data, error.toJSON ? error.toJSON() : error);
      throw error;
    }
  },

  async getLessonOffer(token, instructorId) {
    try {
      const response = await axios.get(
        `${BASE_URL}/lessons/offer`,
        {
          params: { instructorId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching lessons:", error.message, error.response?.status, error.response?.data, error.toJSON ? error.toJSON() : error);
      throw error;
    }
  },

  async changeLesson(token, oldLessonId, newDate) {
    try {
      const response = await axios.post(
        `${BASE_URL}/lessons/change`,
        {
          oldLessonId,
          newDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Error changing lesson:", error.message);
      throw error;
    }
  },
};
