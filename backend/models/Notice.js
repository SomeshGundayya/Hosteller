const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({

title:{
type:String,
required:true
},

content:{
type:String,
required:true
},

priority:{
type:String,
enum:["normal","important","urgent"],
default:"normal"
},

createdBy:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}

},{timestamps:true});

module.exports=mongoose.model("Notice",noticeSchema);