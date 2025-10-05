// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Initialize the app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allows cross-origin requests (from your frontend)
app.use(express.json()); // Parses incoming JSON requests

// --- MongoDB Connection ---
// Replace 'your_database_name' with your actual DB name
mongoose.connect('mongodb://127.0.0.1:27017/budgetTrackerDB')
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schemas ---
// Schema for Users
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Schema for Transactions
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // 'income' or 'expense'
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

// --- Mongoose Models ---
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// --- API Endpoints ---

// 1. User Registration
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).send({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).send({ message: 'Error registering user', error });
    }
});

// 2. User Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        // Compare submitted password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        // On successful login, send back the user's ID
        res.status(200).send({ message: 'Login successful!', userId: user._id });
    } catch (error) {
        res.status(500).send({ message: 'Error logging in', error });
    }
});

// 3. Add a Transaction
app.post('/transactions', async (req, res) => {
    try {
        const { userId, type, amount, description } = req.body;
        const newTransaction = new Transaction({ userId, type, amount, description });
        await newTransaction.save();
        res.status(201).send(newTransaction);
    } catch (error) {
        res.status(500).send({ message: 'Error adding transaction', error });
    }
});

// 4. Get all Transactions for a specific user
app.get('/transactions', async (req, res) => {
    try {
        const { userId } = req.query; // Get userId from query parameter
        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' });
        }
        const transactions = await Transaction.find({ userId }).sort({ date: -1 }); // Sort by newest first
        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching transactions', error });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});