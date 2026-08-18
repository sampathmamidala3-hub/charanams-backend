const Book = require("../models/Book");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

const getDashboardStats = async (req, res) => {
  try {
    const totalBooksResult = await Book.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$quantity",
          },
        },
      },
    ]);

    const totalBooks =
      totalBooksResult.length > 0
        ? totalBooksResult[0].total
        : 0;

    const totalMembers = await Member.countDocuments();

    const issuedBooks = await Transaction.countDocuments({
      status: "Issued",
    });

    const returnedBooks = await Transaction.countDocuments({
      status: "Returned",
    });

    res.json({
      totalBooks,
      totalMembers,
      issuedBooks,
      returnedBooks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};