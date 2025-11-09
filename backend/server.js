import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./Routes/UserRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app=express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: 'http://localhost:3000', // adjust as needed
    credentials: true,
}));

app.use('/api/users',userRoutes);

const PORT=process.env.PORT || 5000;

app.listen(PORT,console.log(`Server running on port ${PORT}`));