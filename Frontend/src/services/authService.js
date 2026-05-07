import api from "./api";

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        const userData = response.data.user || { 
          role: response.data.role,
          id: response.data.id
        };
        if (userData.role) {
          userData.role = userData.role.toUpperCase().replace("ROLE_", "");
        }
        localStorage.setItem("user", JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data || "Login failed. Please check your connection.";
      console.error("Login error:", message);
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;
