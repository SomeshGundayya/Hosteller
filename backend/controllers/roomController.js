const Room = require("../models/Room");

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { number, block, floor, capacity, rent } = req.body;

    const room = await Room.create({
      number,
      block,
      floor,
      capacity,
      rent,
      occupied: 0,
      students: [],
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: "Failed to create room" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { number, block, floor, capacity, rent } = req.body;

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        number,
        block,
        floor,
        capacity,
        rent,
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    res.status(400).json({ message: "Failed to update room" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.occupied > 0 || room.students.length > 0) {
      return res.status(400).json({ message: "Cannot delete a room with assigned students" });
    }

    await room.deleteOne();
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete room" });
  }
};
