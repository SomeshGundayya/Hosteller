const Room = require("../models/Room");
const Student = require("../models/Student");

exports.getDashboardStats = async (req, res) => {
  try {

    const totalRooms = await Room.countDocuments();
    const totalStudents = await Student.countDocuments();

    const rooms = await Room.find();

    let totalBeds = 0;
    let occupiedBeds = 0;

    rooms.forEach(room => {
      totalBeds += room.capacity;
      occupiedBeds += room.occupied;
    });

    const availableBeds = totalBeds - occupiedBeds;

    res.json({
      totalRooms,
      totalStudents,
      totalBeds,
      occupiedBeds,
      availableBeds
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};