const mongoose = require('mongoose');

const RoadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['LineString'],
            required: true
        },
        coordinates: {
            type: [[Number]],
            required: true
        }
    }
});

// Create a 2dsphere index for geospatial queries
RoadSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Road', RoadSchema);
