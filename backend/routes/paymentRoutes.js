const express = require("express");
const router = express.Router();
const { getPaymentStats } = require("../controllers/paymentController");

const {
  createPayment,
  getPayments,
  getStudentPayments,
  markAsPaid,
  deletePayment,
} = require("../controllers/paymentController");


// Create payment
router.post("/", createPayment);

// Get all payments
router.get("/", getPayments);

// Get student payments
router.get("/student/:id", getStudentPayments);

// Mark as paid
router.put("/:id/pay", markAsPaid);

// Delete
router.delete("/:id", deletePayment);

router.get("/stats", getPaymentStats);

module.exports = router;