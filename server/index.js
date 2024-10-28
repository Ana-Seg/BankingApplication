import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { authRouter } from "./controllers/authController.js";
import { transactionRouter } from "./controllers/transactionsController.js"; // Import the new transactions router
import { auth } from "./middleware/authMiddleware.js";
import User from "./models/userModel.js";

config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // Adjust the origin to match your frontend
app.use(express.json());

mongoose
    .connect(process.env.mongodb)
    .then(() => console.log('Database is connected'))
    .catch((error) => console.log(error));

// Use the authentication routes
app.use('/auth', authRouter);

// Use the transactions routes
app.use('/api/transactions', transactionRouter); // Set up the transactions router

// Middleware to check for admin role
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied: Admins only' });
    }
    next();
};

// Route to get user profile (accessible to all authenticated users)
app.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Only return user info without the password
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user); // Send the specific user info
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Server error');
    }
});

// Route to get all users (protected route, admin only)
app.get('/users', auth, isAdmin, async (req, res) => {
    try {
        // Fetch all users except for their password
        const users = await User.find().select('-password'); // Select all fields except password

        if (!users || users.length === 0) {
            return res.status(404).json({ msg: 'No users found' });
        }

        res.json(users); // Return the list of users as a response
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

app.listen(process.env.PORT, () =>
    console.log(`Server running on ${process.env.PORT} PORT`)
);





