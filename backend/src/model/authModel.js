import mongoose from 'mongoose';

const authSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 10,
        select: false
    },
    course: {
        type: String,
        enum: ['b.tech', 'm.tech'],
        required: true,
        lowercase: true
    },
    department: {
        type: String,
        required: true,
        enum: ['cse', 'ece', 'mech', 'civil', 'eee'],
        lowercase: true
    },
    currency: {
        type: String,
        enum: ['₹', '$', '€', '£'],
        default: '₹'
    },
    timezone: {
        type: String,
        default: 'Asia/Kolkata'
    },
    points: {
        type: Number,
        default: 0
    },
    lifetimePoints: {
        type: Number,
        default: 0
    },
    tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    },
    purchasedItems: [{
        type: String
    }],
    avatarUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('auth', authSchema);