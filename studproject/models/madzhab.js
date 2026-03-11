import mongoose from 'mongoose';

const madzhabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  founder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholar',
    required: true
  },
  description: {
    type: String
  },
  era: {
    type: String
  }
}, { timestamps: true });

const Madzhab = mongoose.model('Madzhab', madzhabSchema);

export default Madzhab;