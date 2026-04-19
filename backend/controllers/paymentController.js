const Payment = require("../models/Payment");
const Student = require("../models/Student");
const User = require("../models/User");
const mongoose = require("mongoose");

const populateStudentRoom = {
  path: "student",
  populate: {
    path: "room",
    select: "number",
  },
};

const resolveFallbackStudent = async (studentRef) => {
  if (!studentRef || !mongoose.Types.ObjectId.isValid(studentRef)) {
    return null;
  }

  const user = await User.findById(studentRef).select("name email roomNumber").lean();
  if (!user) {
    return null;
  }

  const student = await Student.findOne({ email: user.email })
    .populate("room", "number")
    .lean();

  if (student) {
    return {
      _id: student._id,
      name: student.name || user.name,
      email: student.email || user.email,
      room: student.room
        ? {
            _id: student.room._id,
            number: student.room.number,
          }
        : user.roomNumber
          ? { number: user.roomNumber }
          : undefined,
    };
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    room: user.roomNumber ? { number: user.roomNumber } : undefined,
  };
};

const normalizePayment = async (paymentDoc) => {
  const payment = paymentDoc.toObject ? paymentDoc.toObject() : paymentDoc;

  if (payment.student && typeof payment.student === "object" && payment.student.name) {
    return payment;
  }

  const studentRef =
    payment.student && typeof payment.student === "object"
      ? payment.student._id
      : payment.student;

  payment.student = await resolveFallbackStudent(studentRef);
  return payment;
};

const normalizePayments = async (payments) => Promise.all(payments.map(normalizePayment));

exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate(populateStudentRoom)
      .sort({ createdAt: -1 });

    const normalizedPayments = await normalizePayments(payments);

    res.json({ success: true, data: normalizedPayments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentPayments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const payments = await Payment.find({ student: id })
      .populate(populateStudentRoom)
      .sort({ dueDate: 1, createdAt: -1 });

    const normalizedPayments = await normalizePayments(payments);

    res.json({
      success: true,
      data: normalizedPayments,
    });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "paid",
        paidAt: new Date(),
      },
      { new: true }
    ).populate(populateStudentRoom);

    const normalizedPayment = payment ? await normalizePayment(payment) : null;

    res.json({ success: true, data: normalizedPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const payments = await Payment.find();

    const totalCollected = payments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingAmount = payments
      .filter((payment) => payment.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const overdueAmount = payments
      .filter((payment) => payment.status === "overdue")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const paidCount = payments.filter((payment) => payment.status === "paid").length;
    const pendingCount = payments.filter((payment) => payment.status === "pending").length;
    const overdueCount = payments.filter((payment) => payment.status === "overdue").length;

    const total = paidCount + pendingCount + overdueCount;
    const collectionRate = total ? Math.round((paidCount / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalCollected,
        pendingAmount,
        overdueAmount,
        paidCount,
        pendingCount,
        overdueCount,
        collectionRate,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
