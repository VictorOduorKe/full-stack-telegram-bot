import { registerUser,authUser,getUserProfile,logoutUser } from "../controllers/userController.js";
import express from "express";
const router=express.Router();

router.post('/',registerUser);
router.post('/login',authUser);
router.get('/profile',getUserProfile);
router.post('/logout',logoutUser);

export default router;