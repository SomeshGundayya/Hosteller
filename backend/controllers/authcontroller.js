const User=require("../models/User");
const Student =require("../models/Student");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

//Register User

const registerUser=async (req,res)=>{
try{
   const { name, email, password, role, phone, roomNumber, avatar } = req.body;

    //Check If User Already Exists
    const userExists=await User.findOne({email});
    if(userExists){
        return res.status(400).json({message:"User Already Exists"});
    }

// Hash Password
const salt=await bcrypt.genSalt(10);
const hashedPassword=await bcrypt.hash(password,salt);

//Create User
const user=await User.create({
    name,
    email,
    password:hashedPassword,
    role,
    phone,
    roomNumber,
    avatar
});if(role === "student"){
    await Student.create({
        name,
        email,
        phone,
        avatar
    });
}

res.status(201).json({
    message:"User Registered Successfully...!!!",
    user,
});
console.log("Register Body:", req.body);
} catch(error){
res.status(500).json({message:error.message})
}
};

// Login User
const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;

        // Check User
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"});
        }

        // Compare Password
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Credentials"});
        }

        // Generate Tokem
        const token=jwt.sign(
            {id:user._id,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        );

        res.json({
            message:"Login Successful",
            token,
            user,
        });

    } catch(error){
        res.status(500).json({message:error.message});
    }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    // update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true }
    );

    // update student also (important for your project)
    await Student.findOneAndUpdate(
      { email: user.email },
      { name, phone, avatar }
    );

    res.json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports={registerUser,loginUser,updateProfile};
