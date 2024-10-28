import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Registration route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            balance: 0, // Default balance
            role: 'user' // Default role
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Create JWT token
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with the token and user details
        res.status(201).json({ token, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email }, msg: 'User registered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Admin Registration route
router.post('/admin/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the admin already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'Admin already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new admin user
        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            balance: 0, // Default balance
            role: 'admin' // Admin role
        });

        // Save the admin to the database
        const savedAdmin = await newAdmin.save();

        // Create JWT token
        const token = jwt.sign({ id: savedAdmin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with the token and admin details
        res.status(201).json({ token, user: { id: savedAdmin._id, name: savedAdmin.name, email: savedAdmin.email, role: savedAdmin.role }, msg: 'Admin registered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// User Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role // Include role in the payload if needed
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (error, token) => {
                    if (error) throw error;
                    res.json({
                        token,
                        user: { id: user._id, email: user.email, name: user.name, balance: user.balance, role: user.role }
                    });
                }
            );
        } else {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

export { router as authRouter };

