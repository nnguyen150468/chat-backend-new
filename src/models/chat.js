const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        name: String
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: "Room",
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {timestamps: true})

const Chat = mongoose.model("Chat", chatSchema)

module.exports = Chat;