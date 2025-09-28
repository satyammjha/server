import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        required:true,
        type:String
    },
    email:{
        type:String,
        required:false,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    }
})

const User = mongoose.model('user', userSchema)

export default User;