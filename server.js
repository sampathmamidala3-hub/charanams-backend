const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Load environment variables
dotenv.config();

const app = express();

// =========================================
// MIDDLEWARE
// =========================================

// Allow requests from frontend
app.use(cors());

// Parse JSON requests
app.use(express.json());

// =========================================
// DATABASE
// =========================================

connectDB();

// =========================================
// TEST ROUTE
// =========================================

app.get("/", (req, res) => {
  res.json({
    message: "Library Management System API is running",
  });
});

// =========================================
// API ROUTES
// =========================================

app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// =========================================
// SERVER
// =========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});