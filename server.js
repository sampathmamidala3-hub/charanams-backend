const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ========================================
// CONFIGURATION
// ========================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined.");
}

// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

// ========================================
// MONGODB CONNECTION
// ========================================

let isConnected = false;

async function connectDB() {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(MONGODB_URI);

    isConnected = true;

    console.log("MongoDB connected successfully!");
    console.log("Database:", mongoose.connection.name);
}

// ========================================
// APPOINTMENT SCHEMA
// ========================================

const appointmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            default: "",
            trim: true
        },

        date: {
            type: String,
            required: true
        },

        service: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

// ========================================
// MODEL
// ========================================

const Appointment =
    mongoose.models.Appointment ||
    mongoose.model("Appointment", appointmentSchema);

// ========================================
// TEST ROUTE
// ========================================

app.get("/", async (req, res) => {
    try {
        await connectDB();

        res.json({
            success: true,
            message: "Charanams Constructions API is running!",
            database: mongoose.connection.name
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            message: "API is running but database connection failed.",
            error: error.message
        });
    }
});

// ========================================
// CREATE APPOINTMENT
// ========================================

app.post("/api/appointments", async (req, res) => {
    try {
        await connectDB();

        console.log("Appointment request received:");
        console.log(req.body);

        const {
            name,
            phone,
            email,
            date,
            service,
            message
        } = req.body;

        // Validate required fields

        if (!name || !phone || !date || !service) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, phone, date and service are required."
            });
        }

        // Create appointment

        const appointment = new Appointment({
            name,
            phone,
            email: email || "",
            date,
            service,
            message: message || "",
            status: "Pending"
        });

        // Save to MongoDB

        const savedAppointment =
            await appointment.save();

        console.log(
            "Appointment saved successfully:"
        );

        console.log(savedAppointment);

        res.status(201).json({
            success: true,
            message:
                "Appointment submitted successfully!",
            appointment: savedAppointment
        });

    } catch (error) {
        console.error("Appointment error:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to save appointment.",
            error: error.message
        });
    }
});

// ========================================
// GET ALL APPOINTMENTS
// ========================================

app.get("/api/appointments", async (req, res) => {
    try {
        await connectDB();

        const appointments =
            await Appointment
                .find()
                .sort({
                    createdAt: -1
                });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.error(
            "Get appointments error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to get appointments.",
            error: error.message
        });
    }
});

// ========================================
// GET ONE APPOINTMENT
// ========================================

app.get("/api/appointments/:id", async (req, res) => {
    try {
        await connectDB();

        const appointment =
            await Appointment.findById(
                req.params.id
            );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found."
            });
        }

        res.json({
            success: true,
            appointment
        });

    } catch (error) {
        console.error(
            "Get appointment error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                "Invalid appointment ID."
        });
    }
});

// ========================================
// UPDATE APPOINTMENT STATUS
// ========================================

app.put("/api/appointments/:id", async (req, res) => {
    try {
        await connectDB();

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message:
                    "Status is required."
            });
        }

        const appointment =
            await Appointment.findByIdAndUpdate(
                req.params.id,
                {
                    status
                },
                {
                    new: true
                }
            );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found."
            });
        }

        res.json({
            success: true,
            message:
                "Appointment status updated.",
            appointment
        });

    } catch (error) {
        console.error(
            "Update appointment error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                "Unable to update appointment."
        });
    }
});

// ========================================
// DELETE APPOINTMENT
// ========================================

app.delete("/api/appointments/:id", async (req, res) => {
    try {
        await connectDB();

        const appointment =
            await Appointment.findByIdAndDelete(
                req.params.id
            );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found."
            });
        }

        res.json({
            success: true,
            message:
                "Appointment deleted successfully."
        });

    } catch (error) {
        console.error(
            "Delete appointment error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                "Unable to delete appointment."
        });
    }
});

// ========================================
// VERCEL EXPORT
// ========================================

module.exports = app;