// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loginDB', {
    
});
const User = mongoose.model('User', {
    username: String,
    email: String,
    password: String
});

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'Rinshu330@gmail.com',
        pass: 'your_password'
    }
});

// Signup route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' });
    }
    // Here you can generate and return a JWT token for authentication
    res.status(200).json({ message: 'Login successful' });
});

// Forgot password route
app.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    // Generate a new password
    const newPassword = Math.random().toString(36).slice(-8);
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update user's password in the database
    await User.updateOne({ email }, { password: hashedPassword });
    // Send the new password to user's email
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'New Password',
        text: `Your new password is: ${newPassword}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Failed to send email' });
        }
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'New password sent to your email' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
