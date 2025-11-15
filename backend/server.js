import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./Routes/UserRoute.js";
import deleteRoutes from "./Routes/deleteMessageRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";

dotenv.config();

const app=express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: 'http://localhost:5173', // adjust as needed
    credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || "some-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true if using HTTPS
}));

app.use('/api/users', userRoutes);
app.use('/api', deleteRoutes);
const PORT=process.env.PORT || 5000;

app.listen(PORT,console.log(`Server running on port ${PORT}`));