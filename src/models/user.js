const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        toLowerCase: true
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: "Room"
    },
    token: String
})

const User = mongoose.model("User", userSchema)

module.exports = User;