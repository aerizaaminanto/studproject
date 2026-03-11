import mongoose from "mongoose";

const opinionReferenceSchema = new mongoose.Schema({

  opinionCoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OpinionCore",
    required: true
  },

  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    default: null
  },

  sourceType: {
    type: String,
    enum: ["book", "lecture", "khutbah", "article", "other"],
    default: "book"
  },

  volume: {
    type: String,
    default: null
  },

  page: {
    type: String,
    default: null
  },

  quote: {
    type: String,
    default: null
  },

  dalilQuote: {
  type: String,
  default: null
},

  notes: {
    type: String,
    default: null
  }

}, { timestamps: true });

const OpinionReference = mongoose.model("OpinionReference", opinionReferenceSchema);

export default OpinionReference;