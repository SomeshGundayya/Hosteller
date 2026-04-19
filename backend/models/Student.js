const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  avatar: {
    type: String,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
