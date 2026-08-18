const Book = require("../models/Book");

// GET ALL BOOKS
const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch books",
      error: error.message,
    });
  }
};

// GET ONE BOOK
const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch book",
      error: error.message,
    });
  }
};

// ADD BOOK
const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      quantity,
    } = req.body;

    if (!title || !author || !category || !isbn || quantity === undefined) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const existingBook = await Book.findOne({ isbn });

    if (existingBook) {
      return res.status(400).json({
        message: "A book with this ISBN already exists",
      });
    }

    const book = await Book.create({
      title,
      author,
      category,
      isbn,
      quantity,
      availableQuantity: quantity,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add book",
      error: error.message,
    });
  }
};

// UPDATE BOOK
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const {
      title,
      author,
      category,
      isbn,
      quantity,
    } = req.body;

    const issuedCopies = book.quantity - book.availableQuantity;

    if (quantity < issuedCopies) {
      return res.status(400).json({
        message: `Quantity cannot be less than ${issuedCopies} issued copies`,
      });
    }

    book.title = title;
    book.author = author;
    book.category = category;
    book.isbn = isbn;
    book.quantity = quantity;

    book.availableQuantity = quantity - issuedCopies;

    await book.save();

    res.json(book);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update book",
      error: error.message,
    });
  }
};

// DELETE BOOK
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

module.exports = {
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
};