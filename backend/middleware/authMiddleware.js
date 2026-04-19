// const jwt =require("jsonwebtoken");
// // const user=require("../models/User");
// const User = require("../models/User");

// const protect= async (req,res,next) => {
//     let token;

// // Check If Token Exists
// if(
//     req.headers.authorization && req.headers.authorization.startsWith("Bearer")
// ){
//     try{
//         // extarct Token
//         token=req.headers.authorization.split(""[1]);

//         // verify Token
//         const decoded=jwt.verify(token.process.env.JWT_SECRET);

//         // get User From Token
//         req.user=await User.findById(decoded.id).select("-password");
//         next();
//     }catch(error){
//         return res.status(401).json({message:"Not Authorized,Token Failed...!!!"});
//     }
// }
//     if(!token){
//     return res.status(401).json({message:"Not Authorized,No Token"})
// }
// console.log("TOKEN:", token);
// console.log("SECRET:", process.env.JWT_SECRET);


// };

// module.exports={protect};


const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;


  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
   
      token = req.headers.authorization.split(" ")[1];

 
      const decoded = jwt.verify(token, process.env.JWT_SECRET);


      req.user = await User.findById(decoded.id).select("-password");

      return next(); 

    } catch (error) {
      return res.status(401).json({
        message: "Not Authorized, Token Failed",
      });
    }
  }

  return res.status(401).json({
    message: "Not Authorized, No Token",
  });
};

module.exports = { protect };