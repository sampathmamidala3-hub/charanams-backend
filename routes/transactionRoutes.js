const express = require("express");

const {
  getTransactions,
  issueBook,
  returnBook,
  deleteTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/", getTransactions);

router.post("/issue", issueBook);

router.post("/return", returnBook);

router.delete("/:id", deleteTransaction);

module.exports = router;