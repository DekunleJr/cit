const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teacher = new Schema({
    name: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    portUrl: String
});

module.exports = mongoose.model('Teacher', teacher);