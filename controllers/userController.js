const { body, validationResult } = require('express-validator');
const client = require('../database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Update user endpoint
exports.updateUser = [
    // Validation middleware
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('dob').isDate().withMessage('Please enter a valid date of birth'),
    body('email').isEmail().withMessage('Enter a correct email'),

    async (req, res) => {
        const { name, dob, email } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0].msg;
            return res.status(400).json({ error: firstError });
        }

        try {
            const existingEmailQuery = `SELECT * FROM users WHERE email = $1`;
            const existingEmailResult = await client.query(existingEmailQuery, [email]);

            if (existingEmailResult.rowCount > 0) {
                return res.status(409).json({ error: 'Email already in use by another account.' });
            }

            // Update user information
            const updateUserQuery = `UPDATE users SET name = $1, dob = $2, email = $3, profileStatus = $4 WHERE email = $5`;
            const result = await client.query(updateUserQuery, [name, dob, email, true, req.userMail]);

            // Check if the user was found and updated
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'User not found or no changes made.' });
            }
            return res.status(200).json({ message: 'User updated successfully' });
        } catch (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }
    }
];

exports.profile = async (req, res) => {
    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await client.query(query, [req.userMail]);

        if (result.rowCount === 1) {
            const user = result.rows[0];
            return res.status(200).json(user);
        } else {
            return res.status(400).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};

//change password
exports.changePassword= [
    // Validation middleware
    body('oldPassword').isLength({ min: 6 }).withMessage('Old password must be at least 6 characters long'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    body('confirmNewPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),

    async (req, res) => {
        const { oldPassword, newPassword,confirmNewPassword } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0].msg;
            return res.status(400).json({ error: firstError });
        }

        try {
            const userQuery = `SELECT * FROM users WHERE email = $1`;
            const userResult = await client.query(userQuery, [req.userMail]);
            //password not match
            if(newPassword !== confirmNewPassword){
                return res.status(400).json({ error: 'Password not match' });
            }
            //user not found
            if (userResult.rowCount === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = userResult.rows[0];
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Incorrect password' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            const updatePasswordQuery = `UPDATE users SET password = $1 WHERE email = $2`;
            await client.query(updatePasswordQuery, [hashedPassword, req.userMail]);

            return res.status(200).json({ message: 'Password updated successfully' });
        } catch (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }
    }
];

//delete account
exports.deleteUser = async (req, res) => {
    try {
        const checkUserQuery = `SELECT * FROM users WHERE email = $1`;
        const userResult = await client.query(checkUserQuery, [req.userMail]);

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Proceed with deletion
        const deleteQuery = `DELETE FROM users WHERE email = $1`;
        await client.query(deleteQuery, [req.userMail]);
        return res.status(200).json({ message: 'Account deleted successfully.' });

    } catch (err) {
        console.error('Error deleting account:', err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};

const CreateIssueTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,         
            email VARCHAR(255) NOT NULL,  
            issue TEXT NOT NULL,           
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
        );
    `;
      try {
        await client.query(createTableQuery);
        console.log('Users table created or already exists.');
    } catch (err) {
        console.error('Error creating users table:', err);
        throw err;
    }
};

//report an issue
exports.reportIssue = async (req, res) => {
    const { issue } = req.body;
    try {
        CreateIssueTable();  
        const reportQuery = `INSERT INTO issues (email, issue) VALUES ($1, $2)`;
        await client.query(reportQuery, [req.userMail, issue]);
        return res.status(200).json({ message: 'Issue reported successfully' });
    } catch (err) {
        console.error('Error reporting issue:', err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};

//see all issues
exports.getIssues=async(req,res)=>{
    try {
        const query = `SELECT * FROM issues`;
        const result = await client.query(query);
        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};