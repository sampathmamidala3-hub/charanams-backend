const Member = require("../models/Member");

// GET all members
const getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch members",
      error: error.message,
    });
  }
};

// ADD member
const addMember = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const member = await Member.create({
      name,
      email,
      phone,
    });

    res.status(201).json({
      message: "Member added successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add member",
      error: error.message,
    });
  }
};

// DELETE member
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.status(200).json({
      message: "Member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete member",
      error: error.message,
    });
  }
};

module.exports = {
  getMembers,
  addMember,
  deleteMember,
};