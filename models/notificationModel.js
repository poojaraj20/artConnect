const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    toUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', required: true 
    },
    fromUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', required: true 
    },
    type: { 
        type: String, enum: ['like', 'comment','order'], 
        required: true 
    },
    artwork: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Artwork' 
    }, 
    message: { 
        type: String, 
        required: true 
    },
    read: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
