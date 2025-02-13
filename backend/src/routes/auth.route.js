import express from "express";
import {
  signup,
  googleLogin,
  login,
  logout,
  updateProfile,
  checkAuth,
  saveFcmTokenInDB,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google-login", googleLogin);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

router.post("/user/update-fcm-token", protectRoute, saveFcmTokenInDB);

export default router;
