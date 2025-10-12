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
      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        },
        { skipAuth: true }
      );
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
      const response = await api.post(
        "/auth/validate-token",
        {
          token,
        },
        { skipAuth: true }
      );
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
      const response = await api.post(
        "/auth/refresh-token",
        {
          refreshToken,
        },
        { skipAuth: true }
      );
      return response.data;
    } catch (error) {
      console.log("Error refreshing token:", error.message);
      throw error;
    }
  },
};

// Instructor service
export const instructorService = {
  async getInstructors() {
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

// Product service
export const productService = {
  async getProducts() {
    try {
      const response = await api.get("/products");
      console.log("Products response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching products:", error.message);
      throw error;
    }
  },

  async getProductByCode(code) {
    try {
      const response = await api.get(`/products/${code}`);
      console.log("Product response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching product:", error.message);
      throw error;
    }
  },

  async createOrder(items) {
    try {
      const orderItems = items.map((item) => ({
        productCode: item.id || item.code,
        quantity: item.qty || 1,
      }));

      console.log("Creating order with items:", orderItems);

      const response = await api.post("/products/orders", {
        items: orderItems,
      });

      console.log("Order response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error creating order:", error.message);
      throw error;
    }
  },

  async getUserOrders(page = 1, limit = 10) {
    try {
      const response = await api.get("/products/orders/my", {
        params: { page, limit },
      });
      console.log("Orders response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching orders:", error.message);
      throw error;
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await api.get(`/products/orders/${orderId}`);
      console.log("Order response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching order:", error.message);
      throw error;
    }
  },

  async getUserBalance() {
    try {
      const response = await api.get("/products/balance");
      console.log("Balance response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching balance:", error.message);
      throw error;
    }
  },
};

// Lesson service
export const lessonService = {
  async getLessons(params = {}) {
    try {
      const { type = "lesson", ...otherParams } = params;
      const response = await api.get("/lessons", { 
        params: { type, ...otherParams } 
      });
      console.log("Lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching lessons:", error.message);
      throw error;
    }
  },

  async bookLesson(lessonId) {
    try {
      const response = await api.post("/lessons/book", {
        lessonId,
      });
      return response.data;
    } catch (error) {
      console.log("Error booking lesson:", error.message);
      throw error;
    }
  },

  async getInstructorsLessons() {
    try {
      const response = await api.get("/lessons/instructors");
      console.log("Lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log(
        "Error fetching lessons:",
        error.message,
        error.response?.status,
        error.response?.data,
        error.toJSON ? error.toJSON() : error
      );
      throw error;
    }
  },

  async getStudentLessons() {
    try {
      const response = await api.get("/lessons/student");
      console.log("Student lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log(
        "Error fetching student lessons:",
        error.message,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  async cancelLesson(lessonId) {
    try {
      const response = await api.post("/lessons/cancel", { lessonId });
      console.log("Cancel lesson response:", response.data);
      return response.data;
    } catch (error) {
      console.log(
        "Error canceling lesson:",
        error.message,
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  async getLessonOffer() {
    try {
      const response = await api.get("/lessons/offer");
      console.log("Lessons response:", response.data);
      return response.data;
    } catch (error) {
      console.log(
        "Error fetching lessons:",
        error.message,
        error.response?.status,
        error.response?.data,
        error.toJSON ? error.toJSON() : error
      );
      throw error;
    }
  },

  async changeLesson(oldLessonId, newDate) {
    try {
      const response = await api.post("/lessons/change", {
        oldLessonId,
        newDate,
      });
      return response.data;
    } catch (error) {
      console.log("Error changing lesson:", error.message);
      throw error;
    }
  },
};
