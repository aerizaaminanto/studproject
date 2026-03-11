import mongoose from "mongoose";

const opinionCoreSchema = new mongoose.Schema({
  scholarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scholar",
    required: true
  },

  legalIssueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LegalIssue",
    required: true
  },

  type: {
  type: String,
  enum: ["ruling", "tarjih"],
  default: "ruling"
  },

  rulingCategory: {
    type: String,
    required: true
  },

  rulingValue: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    default: null
  },
 
  dalil: {
  type: String,
  default: null
},

  phase: {
    type: String,
    enum: ["qadim", "jadid", null],
    default: null
  },

  notes: {
    type: String,
    default: null
  }

}, { timestamps: true });

opinionCoreSchema.index({ legalIssueId: 1 });
opinionCoreSchema.index({ scholarId: 1 });

const OpinionCore = mongoose.model("OpinionCore", opinionCoreSchema);

export default OpinionCore;