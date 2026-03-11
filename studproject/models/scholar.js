import mongoose from 'mongoose';

const scholarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  madzhab: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ["individual", "institution"],
    default: "individual"
  }
}, { timestamps: true });

const Scholar = mongoose.model('Scholar', scholarSchema);

export default Scholar;