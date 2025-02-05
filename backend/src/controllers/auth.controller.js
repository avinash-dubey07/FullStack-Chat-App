import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import admin from "../firebaseAdmin.js";


export const signup = async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.send(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .send(400)
        .json({ message: "Password must be of 6 Characters" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });

    if (newUser) {
      //Generate JWT token
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup Controller", error.message);
    res.status(500).json({ message: "Interenal Server Error" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // Token from frontend

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, picture, uid } = decodedToken;

    let user = await User.findOne({ email });
    // let user = await User.findOne({ firebaseUid: uid});     To link users to Firebase authentication directly

    if (!user) {
      // Create a new user if they don't exist
      user = new User({
        email,
        fullName: name || "Google User",
        profilePic: picture || "",
        password: null,      // No password for Google user
        //firebaseUid: uid,    // Store Firebase UID
      });
      await user.save();
    }

    // Generate JWT token for session
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in Google Login:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login Controller", error.message);
    res.status(500).json({ message: "Interenal Server Error" });
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout Controller", error.message);
    res.status(500).json({ message: "Interenal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Interenal Server Error" });
  }
};

export const saveFcmTokenInDB = async (req, res) => {
  try {
    const userId = req.user._id;    // Extract user ID from authentication middleware
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "FCM token is required" });
    }

    // Finding user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Prevent duplicate tokens
    if (!user.fcmToken.includes(token)) {
      user.fcmToken.push(token);
      await user.save();
    }

    res.json({ success: true, message: "FCM token updated successfully!" });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
