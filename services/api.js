import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const { BASE_URL } = Constants.expoConfig.extra;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  if (config.skipAuth) return config;
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuth 
    ) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          const newToken = res.data.token;
          const newRefreshToken = res.data.refreshToken;
          await SecureStore.setItemAsync("token", newToken);
          await SecureStore.setItemAsync("refreshToken", newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // handleLogout();
        }
      }
    }
    return Promise.reject(error);
  }
);

//Auth service
export const authService = {
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      }, { skipAuth: true });
      return response.data;
    } catch (error) {
      console.log("Error logining:", error.message);
      throw error;
    }
  },

  async register(firstName, lastName, role, phoneNumber, email, password) {
    try {
      const response = await api.post("/auth/register", {
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
      const response = await api.post("/auth/validate-token", {
        token,
      }, { skipAuth: true });
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
      const response = await api.post("/auth/refresh-token", {
        refreshToken,
      }, { skipAuth: true });
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
      const response = await api.get("/instructors");
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
      const response = await api.get("/lessons");
      console.log("Lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching lessons:", error.message);
      throw error;
    }
  },

  async bookLesson(token, lessonId, studentId) {
    try {
      const response = await api.post(
        "/lessons/book",
        {
          lessonId,
          studentId,
        },
      );
      return response.data;
    } catch (error) {
      console.log("Error booking lesson:", error.message);
      throw error;
    }
  },

  async getInstructorsLessons(token, instructorId) {
    try {
      const response = await api.get(
        "/lessons/instructors",
        {
          params: { instructorId },
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
      const response = await api.get(
        "/lessons/offer",
        {
          params: { instructorId },
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
      const response = await api.post(
        "/lessons/change",
        {
          oldLessonId,
          newDate,
        },
      );
      return response.data;
    } catch (error) {
      console.log("Error changing lesson:", error.message);
      throw error;
    }
  },
};
