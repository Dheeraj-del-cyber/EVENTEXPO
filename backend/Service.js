const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Celebrities', 'Sound & Lighting', 'Catering', 'Event Hosts', 'Decorations', 'DJ', 'Singers']
    },
    priceRange: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    description: {
        type: String,
        default: 'Premium event service provider ready to make your event unforgettable.'
    },
    moreInfo: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
