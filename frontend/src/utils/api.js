const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Only redirect if not already on the login/signup page to prevent loops
    if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/signup") && window.location.pathname !== "/") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized access. Please login again.");
  }
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed");
  }
  
  return res.json();
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  post: async (endpoint, data) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
