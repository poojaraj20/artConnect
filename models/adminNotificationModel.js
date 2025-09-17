const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['app_issue', 'user_complaint', 'general_query'],
        required: true
    },
    name: { 
        type: String, 
        trim: true 
    },
    email: { 
        type: String, 
        trim: true 
    },
    message: { 
        type: String, 
        required: true, 
        trim: true 
    },
    fromUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    }, 
    status: {
        type: String,
        enum: ['unread', 'read', 'resolved'],
        default: 'unread'
    },
    meta: {
        ip: String,
        userAgent: String
    }
}, { timestamps: true });


adminNotificationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
