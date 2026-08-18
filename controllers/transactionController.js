const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("book")
      .populate("member")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

const issueBook = async (req, res) => {
  try {
    const { bookId, memberId } = req.body;

    console.log("Issue request:", { bookId, memberId });

    if (!bookId || !memberId) {
      return res.status(400).json({
        message: "Book and member are required",
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        message: "This book is not available",
      });
    }

    book.availableQuantity -= 1;

    await book.save();

    const transaction = await Transaction.create({
      book: bookId,
      member: memberId,
      issueDate: new Date(),
      status: "issued",
    });

    const populatedTransaction = await Transaction.findById(
      transaction._id
    )
      .populate("book")
      .populate("member");

    res.status(201).json({
      message: "Book issued successfully",
      transaction: populatedTransaction,
    });
  } catch (error) {
    console.error("Issue book error:", error);

    res.status(500).json({
      message: "Failed to issue book",
      error: error.message,
    });
  }
};

const returnBook = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        message: "Transaction ID is required",
      });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    if (transaction.status === "returned") {
      return res.status(400).json({
        message: "Book is already returned",
      });
    }

    const book = await Book.findById(transaction.book);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    book.availableQuantity += 1;

    await book.save();

    transaction.status = "returned";
    transaction.returnDate = new Date();

    await transaction.save();

    const populatedTransaction = await Transaction.findById(
      transaction._id
    )
      .populate("book")
      .populate("member");

    res.status(200).json({
      message: "Book returned successfully",
      transaction: populatedTransaction,
    });
  } catch (error) {
    console.error("Return book error:", error);

    res.status(500).json({
      message: "Failed to return book",
      error: error.message,
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    if (transaction.status === "issued") {
      const book = await Book.findById(transaction.book);

      if (book) {
        book.availableQuantity += 1;
        await book.save();
      }
    }

    await Transaction.findByIdAndDelete(id);

    res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};

module.exports = {
  getTransactions,
  issueBook,
  returnBook,
  deleteTransaction,
};