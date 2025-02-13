import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { auth, provider,requestForToken, onMessageListener } from "../firebase.config.js";
import { signInWithPopup } from "firebase/auth";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket:null,
  fcmToken: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();

      // Request FCM token after authentication check
      const token = await requestForToken();
      if (token) set({ fcmToken: token });

    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  googleLogin: async () => {
    try {
      // Setting custom parameters for account selection
      provider.setCustomParameters({
        prompt: 'select_account',
      });
  
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken(); // Firebase ID token
  
      // Sending the ID token to the backend
      const response = await axiosInstance.post("/auth/google-login", { token: idToken });
  
      set({ authUser: response.data });
      toast.success("Logged in with Google successfully");
  
      get().connectSocket();

      const token = await requestForToken();
      if (token) {
        set({ fcmToken: token });

        // Sending token to backend to store
        await axiosInstance.post("/user/update-fcm-token", { token });
      }

    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error("Google login failed");
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
    // Listen for push notifications
    onMessageListener().then((payload) => {
      console.log("Notification received:", payload);
      toast.success(payload.notification.title);
    }).catch((err) => console.log("FCM Message Error:", err));
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

}));
