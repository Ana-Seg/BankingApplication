import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Default role should be user
    balance: { type: Number, default: 0 },
    transactionLogs: { type: [String], default: [] }, // Initialize transactionLogs as an array
});

const User = mongoose.model('User', userSchema);
export default User;







