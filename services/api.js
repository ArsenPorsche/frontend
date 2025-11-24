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

  async getAllUsers() {
    try {
      const response = await api.get("/auth/users");
      console.log("All users response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching users:", error.message);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/auth/users/${userId}`);
      console.log("Delete user response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error deleting user:", error.message);
      throw error;
    }
  },

  async activateUser(userId) {
    try {
      const response = await api.patch(`/auth/users/${userId}/activate`);
      console.log("Activate user response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error activating user:", error.message);
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

  async getInstructorRating() {
    try {
      const response = await api.get("/instructors/rating");
      console.log("Instructor rating response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching instructor rating:", error.message);
      throw error;
    }
  },
};

// Product service
export const productService = {
  async getProducts() {
    try {
      const response = await api.get("/products");
      const payload = response.data;
      let list = Array.isArray(payload) ? payload : (payload?.data || []);
      list = list.filter((p) => p.active !== false);
      console.log("Products response (normalized, active only):", list.length);
      return list;
    } catch (error) {
      console.log("Error fetching products:", error.message);
      throw error;
    }
  },

  // Admin-only: get all products including inactive
  async getAllProductsAdmin() {
    try {
      const response = await api.get("/products/all");
      const payload = response.data;
      const list = Array.isArray(payload) ? payload : (payload?.data || []);
      console.log("Admin products response (all):", list.length);
      return list;
    } catch (error) {
      console.log("Error fetching all products:", error.message);
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

  async createProduct(productData) {
    try {
      const response = await api.post("/products", productData);
      console.log("Create product response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error creating product:", error.message);
      throw error;
    }
  },

  async updateProduct(productId, productData) {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      console.log("Update product response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error updating product:", error.message);
      throw error;
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/products/${productId}`);
      console.log("Deactivate product response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error deleting product:", error.message);
      throw error;
    }
  },

  async activateProduct(productId) {
    try {
      const response = await api.patch(`/products/${productId}/activate`);
      console.log("Activate product response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error activating product:", error.message);
      throw error;
    }
  },
};

export const userService = {
  async getProfile() {
    try {
      const response = await api.get("/auth/profile");
      console.log("Profile response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching profile:", error.message);
      throw error;
    }
  },

  async updateProfile(updates) {
    try {
      const response = await api.put("/auth/profile", updates);
      console.log("Update profile response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error updating profile:", error.message);
      throw error;
    }
  },

  async registerPushToken(token) {
    try {
      console.log("[registerPushToken] Sending token:", token);
      const response = await api.post("/auth/push-token", { token });
      console.log("[registerPushToken] Response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error registering push token:", error.message, error.response?.data);
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

  async getLessonHistory() {
    try {
      const response = await api.get("/lessons/history");
      console.log("Lesson history response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching lesson history:", error.message);
      throw error;
    }
  },

  async rateLesson(lessonId, rating) {
    try {
      const response = await api.post(`/lessons/${lessonId}/rate`, { rating });
      console.log("Rate lesson response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error rating lesson:", error.message);
      throw error;
    }
  },

  async getInstructorHistory() {
    try {
      const response = await api.get("/lessons/instructor-history");
      console.log("Instructor history response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching instructor history:", error.message);
      throw error;
    }
  },

  async setExamResult(lessonId, wynik) {
    try {
      const response = await api.post(`/lessons/${lessonId}/result`, { wynik });
      console.log("Set exam result response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error setting exam result:", error.message);
      throw error;
    }
  },
};

// Chat service
export const chatService = {
  async getChats() {
    try {
      const response = await api.get("/chats");
      console.log("Chats response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching chats:", error.message, error.response?.data);
      throw error;
    }
  },

  async getMessages(chatId, params = {}) {
    try {
      const response = await api.get(`/chats/${chatId}/messages`, { params });
      console.log("Chat messages response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching chat messages:", error.message, error.response?.data);
      throw error;
    }
  },

  async sendMessage(partnerId, text) {
    try {
      const response = await api.post(`/chats/send`, { partnerId, text });
      console.log("Send message response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error sending message:", error.message, error.response?.data);
      throw error;
    }
  },

  async markChatRead(chatId) {
    try {
      const response = await api.patch(`/chats/${chatId}/read`);
      return response.data;
    } catch (error) {
      console.log("Error marking chat read:", error.message, error.response?.data);
      throw error;
    }
  },
};

export const testService = {
  async getCategories() {
    try {
      const response = await api.get("/tests/categories");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getTest(topic) {
    try {
      const response = await api.get(`/tests/${topic}`);
      return response.data;
    } catch (error) {
      console.log("Error fetching test:", error.message);
      throw error;
    }
  },
};

