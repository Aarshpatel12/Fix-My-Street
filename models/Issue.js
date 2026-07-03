const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['New', 'In Progress', 'Fixed'],
        default: 'New'
    },
    photoUrl: {
        type: String, // Base64 string for simplicity in MVP
        required: false
    },
    upvotes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Issue', IssueSchema);
