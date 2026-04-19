const express = require("express");
const router = express.Router();
const { getRooms, createRoom, updateRoom, deleteRoom } = require("../controllers/roomController");

// GET all rooms
router.get("/", getRooms);

// POST create room
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;
