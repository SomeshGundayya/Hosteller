const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  block: {
    type: String,
    required: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  rent: {
    type: Number,
    required: true,
    default: 0,
  },
  occupied: {
    type: Number,
    default: 0,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
