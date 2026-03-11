import mongoose from "mongoose";

const legalIssueSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: null
  },

  parentIssueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LegalIssue",
    default: null
  },

  asbabAlKhilaf: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ["belum_diketahui_khilaf", "ikhtilaf", "ijma"],
    default: "belum_diketahui_khilaf"
  }

}, { timestamps: true });

const LegalIssue = mongoose.model("LegalIssue", legalIssueSchema);

export default LegalIssue;