const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // ✅ FIXED (VERY IMPORTANT)
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "paid", "overdue"], // ✅ added overdue
    default: "pending",
  },

  month: {
    type: String,
    required: true,
  },

  year: {
    type: Number,
    required: true,
  },

  dueDate: {
    type: Date,
  },

  paidAt: {
    type: Date,
  },

  description: {
    type: String,
    default: "Hostel Rent",
  },

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);