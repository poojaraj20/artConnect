//import mongoose
const mongoose = require('mongoose')
//create schema and model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: "art user"
    }
}, { timestamps: true });
module.exports = mongoose.model("users", userSchema)