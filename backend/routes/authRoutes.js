const express=require("express");
const router=express.Router();
const { protect } = require("../middleware/authMiddleware");
const{
    registerUser,
    loginUser,
    updateProfile
}=require("../controllers/authcontroller")

router.post("/register",registerUser);
router.post("/login",loginUser);
router.put("/update-profile", protect, updateProfile);

module.exports=router;