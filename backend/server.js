const express=require("express");
const cors=require("cors");
const connectDB = require("./config/db");
const authRoutes=require("./routes/authRoutes");
const userRoutes=require("./routes/userRoutes")
const roomRoutes = require("./routes/roomRoutes");
const studentRoutes = require("./routes/studentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

require("dotenv").config();

const app=express();

//connect Database
connectDB();

// middlewares
app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/rooms",roomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/payments", paymentRoutes);

// test route
app.get("/",(req,res)=>{
    res.send("Hostel Hormony Backend Is Running...!!!");
});

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server Running On Port ${PORT}`);
});