const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {

    const { student, roomNumber, title, type, description } = req.body;

    if (!student || !roomNumber || !title || !type || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

   const complaint = new Complaint({
  student,
  roomNumber,
  title,
  type,
  description
});

    await complaint.save();

    res.status(201).json(complaint);

  } catch (error) {
    console.error("Complaint Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getComplaints = async (req, res) => {
  try {

    const complaints = await Complaint
      .find()
      .populate("student");

    res.json(complaints);

  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );

    res.json(complaint);

  } catch (error) {
    res.status(500).json({ message: "Error updating complaint" });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json({
      message: "Complaint status updated",
      complaint
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};