import mongoose from 'mongoose';

const progressSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    date: { type: Date, required: true, default: Date.now },
    weight: { type: Number, required: true },
    bodyFatPercentage: { type: Number },
    measurements: {
        chest: { type: Number },
        arms: { type: Number },
        waist: { type: Number },
        legs: { type: Number }
    },
    notes: { type: String }
}, { timestamps: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
