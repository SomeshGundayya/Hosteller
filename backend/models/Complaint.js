const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  roomNumber: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true
  },

  type: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

 status: {
  type: String,
  enum: ["pending", "in-progress", "resolved"],
  default: "pending"
}

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);