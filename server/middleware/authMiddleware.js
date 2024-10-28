import { config } from "dotenv";
import jwt from "jsonwebtoken";
import User from '../models/userModel.js';

const auth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check if the Authorization header is present and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1].trim();
    console.log("Token received:", token);

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Fetch user details from the database, including the role
        const user = await User.findById(decoded.id).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Attach user info to the request object
        req.user = { ...req.user, role: user.role }; // Add the role to the request object

        next(); // Continue to the next middleware or route handler
    } catch (e) {
        console.error("Token verification error:", e.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

export { auth };


