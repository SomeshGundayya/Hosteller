const express=require("express");
const router=express.Router();

const {protect}=require("../middleware/authMiddleware");
const {allowRoles}=require("../middleware/roleMiddleware");

router.get("/profile",protect,(req,res)=>{
    res.json(req.user);
});

router.get("/admin",protect,allowRoles("admin"),(req,res)=>{
    res.json({message:"Welcome Admin"});
});

module.exports=router;