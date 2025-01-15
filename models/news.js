const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const news = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: function() {
            // Set expiration to 1 hour after the event date
            return new Date(this.date.getTime() + 60 * 60 * 1000);
        }
    }
});

news.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('News', news);