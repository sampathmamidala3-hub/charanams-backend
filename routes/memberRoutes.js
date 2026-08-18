const express = require("express");

const router = express.Router();

const {
  getMembers,
  addMember,
  deleteMember,
} = require("../controllers/memberController");


router.get("/", getMembers);


router.post("/", addMember);


router.delete("/:id", deleteMember);

module.exports = router;