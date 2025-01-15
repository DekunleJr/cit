const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const service = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Services', service);