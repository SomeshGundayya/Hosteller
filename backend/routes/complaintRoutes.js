const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getComplaints,
  updateComplaintStatus
} = require("../controllers/complaintController");

router.post("/", createComplaint);
router.get("/", getComplaints);
router.put("/:id", updateComplaintStatus);

module.exports = router;