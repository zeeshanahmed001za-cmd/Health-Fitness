import mongoose from 'mongoose';

const workoutSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, required: true, enum: ['Cardio', 'Strength', 'Flexibility', 'Other'] },
    duration: { type: Number, required: true }, // in minutes
    caloriesBurned: { type: Number },
    exercises: [{
        name: { type: String, required: true },
        sets: { type: Number },
        reps: { type: Number },
        weight: { type: Number },
    }],
    notes: { type: String }
}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;
