import mongoose from 'mongoose';

const nutritionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    activityType: { type: String, required: true }, // 'food' or 'water'
    name: { type: String }, // e.g. 'Apple'
    category: { type: String }, // 'breakfast', 'lunch', 'dinner', 'snacks'
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
    amount: { type: Number }, // For water logs (e.g. 250ml)
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Nutrition = mongoose.model('Nutrition', nutritionSchema);

export default Nutrition;
