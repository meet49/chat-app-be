const mongoose = require("mongoose");

const signUpModel = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        required : true,
        enum : ["user", "admin"],
        default : "user"
    },
    profileImage : {
        type : String,
        required : true
    },
    resetPasswordToken : { 
        type : String,
    },
    resetPasswordExpires : {
        type : Date
    }
},{
    timestamps : true
});

const signUp = mongoose.model('User', signUpModel);

module.exports = signUp;