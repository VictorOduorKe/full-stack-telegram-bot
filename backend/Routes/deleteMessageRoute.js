import express from "express";
import { deleteMessage, verifyUserPhone, verifyUserPhoneDebug } from "../controllers/deleteController.js";

const router = express.Router();

// Route to verify phone and send Telegram code
router.post("/verify-phone", verifyUserPhone);

// DEBUG: No-auth test endpoint
router.post("/verify-phone-debug", verifyUserPhoneDebug);

// Route to delete messages after code verification
router.post("/delete", deleteMessage);

export default router;
