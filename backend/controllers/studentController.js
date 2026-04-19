const Student = require("../models/Student");
const Room = require("../models/Room");
const User = require("../models/User");

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("room");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("room");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, phone, roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.occupied >= room.capacity) {
      return res.status(400).json({ message: "Room is full" });
    }

    const student = await Student.create({
      name,
      email,
      phone,
      room: roomId,
    });

    room.students.push(student._id);
    room.occupied += 1;
    await room.save();

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: "Failed to create student" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, email, phone, roomId, role } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const previousEmail = student.email;
    const previousRoomId = student.room ? student.room.toString() : null;

    if (roomId && roomId !== previousRoomId) {
      const newRoom = await Room.findById(roomId);
      if (!newRoom) {
        return res.status(404).json({ message: "Room not found" });
      }

      if (newRoom.occupied >= newRoom.capacity) {
        return res.status(400).json({ message: "Room is full" });
      }

      if (previousRoomId) {
        const previousRoom = await Room.findById(previousRoomId);
        if (previousRoom) {
          previousRoom.students = previousRoom.students.filter(
            (id) => id.toString() !== student._id.toString()
          );
          previousRoom.occupied = Math.max(0, previousRoom.occupied - 1);
          await previousRoom.save();
        }
      }

      newRoom.students.push(student._id);
      newRoom.occupied += 1;
      await newRoom.save();
      student.room = roomId;
    }

    student.name = name ?? student.name;
    student.email = email ?? student.email;
    student.phone = phone ?? student.phone;
    await student.save();

    const user = await User.findOne({ email: previousEmail });
    if (user) {
      user.name = student.name;
      user.email = student.email;
      user.phone = student.phone;
      if (role) {
        user.role = role;
      }
      await user.save();
    }

    const updatedStudent = await Student.findById(student._id).populate("room");
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const room = await Room.findById(student.room);

    if (room) {
      room.students = room.students.filter(
        (id) => id.toString() !== student._id.toString()
      );
      room.occupied = Math.max(0, room.occupied - 1);
      await room.save();
    }

    await User.findOneAndDelete({ email: student.email });
    await student.deleteOne();

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.allocateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    student.room = roomId;
    await student.save();

    room.students.push(student._id);
    room.occupied += 1;
    await room.save();

    res.json({
      message: "Room allocated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentByEmail = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email }).populate({
      path: "room",
      populate: {
        path: "students",
        select: "name email avatar",
      },
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
