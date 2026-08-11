const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ========================================
// CONFIGURATION
// ========================================

const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI;

// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

app.use(express.json());

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

const Appointment = mongoose.model(
    "Appointment",
    appointmentSchema
);

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Charanams Constructions API is running!"
    });

});

// ========================================
// CREATE APPOINTMENT
// ========================================

app.post(
    "/api/appointments",
    async (req, res) => {

        try {

            console.log(
                "Appointment request received:"
            );

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

            if (
                !name ||
                !phone ||
                !date ||
                !service
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, phone, date and service are required."
                });
            }

            // Create appointment

            const appointment =
                new Appointment({

                    name: name,

                    phone: phone,

                    email: email || "",

                    date: date,

                    service: service,

                    message: message || "",

                    status: "Pending"
                });

            // Save to MongoDB

            const savedAppointment =
                await appointment.save();

            console.log(
                "Appointment saved successfully:"
            );

            console.log(
                savedAppointment
            );

            // Send response

            res.status(201).json({

                success: true,

                message:
                    "Appointment submitted successfully!",

                appointment:
                    savedAppointment
            });

        } catch (error) {

            console.error(
                "Appointment error:"
            );

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to save appointment.",

                error:
                    error.message
            });
        }
    }
);

// ========================================
// GET ALL APPOINTMENTS
// ========================================

app.get(
    "/api/appointments",
    async (req, res) => {

        try {

            const appointments =
                await Appointment
                    .find()
                    .sort({
                        createdAt: -1
                    });

            res.json({

                success: true,

                count:
                    appointments.length,

                appointments:
                    appointments
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to get appointments."
            });
        }
    }
);

// ========================================
// GET ONE APPOINTMENT
// ========================================

app.get(
    "/api/appointments/:id",
    async (req, res) => {

        try {

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

                appointment:
                    appointment
            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    "Invalid appointment ID."
            });
        }
    }
);

// ========================================
// UPDATE APPOINTMENT STATUS
// ========================================

app.put(
    "/api/appointments/:id",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            const appointment =
                await Appointment.findByIdAndUpdate(

                    req.params.id,

                    {
                        status: status
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

                appointment:
                    appointment
            });

        } catch (error) {

            res.status(400).json({

                success: false,

                message:
                    "Unable to update appointment."
            });
        }
    }
);

// ========================================
// DELETE APPOINTMENT
// ========================================

app.delete(
    "/api/appointments/:id",
    async (req, res) => {

        try {

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

            res.status(400).json({

                success: false,

                message:
                    "Unable to delete appointment."
            });
        }
    }
);

// ========================================
// START SERVER
// ========================================

async function startServer() {

    try {

        console.log(
            "Connecting to MongoDB..."
        );

        await mongoose.connect(
            MONGODB_URI
        );

        console.log(
            "MongoDB connected successfully!"
        );

        console.log(
            "Database:",
            mongoose.connection.name
        );

        app.listen(
            PORT,
            () => {

                console.log(
                    "================================"
                );

                console.log(
                    `Server running at http://localhost:${PORT}`
                );

                console.log(
                    "================================"
                );

            }
        );

    } catch (error) {

        console.error(
            "MongoDB connection failed!"
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
}

// ========================================
// START APPLICATION
// ========================================

startServer();