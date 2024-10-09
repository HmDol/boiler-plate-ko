const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,// 빈칸을 없애줌
        unique: 1

    },
    password: {
        type: String,
        minlength: 5
    },
    lastnmae: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }

})
const User = mongoose.model('User', userSchema)

module.exports = { User }