import bcrypt from 'bcryptjs';
import authModel from '../model/authModel.js';
import generateToken from '../utils/generateToken.js';

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const registerUser = async (req, res) => {
    try {
        let { name, email, password, course, department } = req.body;

        name = name?.trim();
        email = email?.trim().toLowerCase();
        course = course?.trim().toLowerCase();
        department = department?.trim().toLowerCase();

        if (!name || !email || !password || !course || !department) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Enter a valid email' });
        }

        if (password.length < 10) {
            return res.status(400).json({
                message: 'Password must be at least 10 characters long'
            });
        }

        const existingUser = await authModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await authModel.create({
            name,
            email,
            password: hashedPassword,
            course,
            department
        });

        const token = generateToken(newUser._id);

        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                course: newUser.course,
                department: newUser.department
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Error creating user',
            error: err.message
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        email = email?.trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Enter a valid email' });
        }

        const user = await authModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                course: user.course,
                department: user.department
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Error logging in',
            error: err.message
        });
    }
};