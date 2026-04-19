const express = require("express");
const router = express.Router();
// const { getStudents, createStudent } = require("../controllers/studentController");
const { 
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  allocateRoom,
  getStudentByEmail
} = require("../controllers/studentController");

router.get("/", getStudents);
router.get("/email/:email", getStudentByEmail);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.put("/:id/allocate-room", allocateRoom);

module.exports = router;
