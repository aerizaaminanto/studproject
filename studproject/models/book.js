import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  authorScholarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scholar",
    default: null
  },

  authorName: {
    type: String,
    default: null
  },

  description: {
    type: String,
    default: null
  }

}, { timestamps: true });

const Book = mongoose.model("Book", bookSchema);

export default Book;