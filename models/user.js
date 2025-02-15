const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const user = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model('User', user);