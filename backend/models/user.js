import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
  email:String,
  password:String,
  todos:Object
});

export default mongoose.model("User",userSchema);