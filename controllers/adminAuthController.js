const client = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

JWT_SECRET = 'made-by-ali';

// Function to create admin table if it doesn't exist
const createAdminTableIfNotExists = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS admins (
            AdminID SERIAL PRIMARY KEY,
            Name VARCHAR(100) NOT NULL,
            Email VARCHAR(100) UNIQUE NOT NULL,
            Password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    try {
        await client.query(createTableQuery);
        console.log('Admins table created or already exists.');
    } catch (err) {
        console.error('Error creating admins table:', err);
        throw err;
    }
};

// Register admin API
exports.adminRegister = [
    // Validation checks
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    async (req, res) => {
        const { name, email, password } = req.body;

        // Handling validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0].msg;
            return res.status(400).json({ message: firstError });
        }

        try {
            await createAdminTableIfNotExists();

            // Check if the admin already exists
            const adminCheckQuery = 'SELECT * FROM admins WHERE email = $1';
            const adminCheckResult = await client.query(adminCheckQuery, [email]);

            if (adminCheckResult.rows.length > 0) {
                return res.status(400).json({ message: 'Admin already exists' });
            }

            // Hash the password before saving it to the database
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert the new admin into the database
            const insertAdminQuery = 'INSERT INTO admins (Name, Email, Password) VALUES ($1, $2, $3)';
            const values = [name, email, hashedPassword];
            await client.query(insertAdminQuery, values);

            // Create token
            const token = jwt.sign({ email: email }, JWT_SECRET);

            // Send result
            return res.status(200).json({ message: 'Admin registered successfully', token: token });

        } catch (err) {
            console.error('Error registering admin:', err);
            return res.status(500).json({ error: 'Error registering admin' });
        }
    }
];



// Admin login API
exports.adminLogin = [
    // Validation checks
    body('email').isEmail().withMessage('Email or password is incorrect'),
    body('password').isLength({ min: 6 }).withMessage('Email or password is incorrect'),

    async (req, res) => {
        const { email, password } = req.body;

        // Handling validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Email or password is incorrect' });
        }

        try {
            // Checking if the admin with the email exists
            const query = 'SELECT * FROM admins WHERE email=$1';
            const queryResult = await client.query(query, [email]);

            if (queryResult.rowCount === 1) {
                const pass = queryResult.rows[0].password;
                const result = await bcrypt.compare(password, pass);

                if (result) {
                    // Create token
                    const token = jwt.sign({ email: email }, JWT_SECRET);
                    // Send data
                    return res.status(200).json({ message: 'Admin logged in successfully', token: token });
                } else {
                    return res.status(401).json({ message: 'Email or password is incorrect' });
                }
            } else {
                return res.status(404).json({ message: 'Email or password is incorrect' });
            }

        } catch (err) {
            console.error('Error logging in admin:', err);
            return res.status(500).json({ error: 'Error logging in admin' });
        }
    }
];
