const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const alumni = new Schema({
    name: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Alumni', alumni);