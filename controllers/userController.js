const { body, validationResult } = require('express-validator');
const client = require('../database');
require('dotenv').config();

exports.updateUser = [

    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('dob').isDate().withMessage('Please enter a valid date of birth'),
    body('nationalID').isNumeric().withMessage('National ID must be a numeric value'),

    async (req, res) => {

        const { name, dob, nationalID } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0].msg;
            return res.status(400).json({ error: firstError });
        }

        try {
            const updateUserQuery = `UPDATE users SET name = $1, dob = $2, nationalID = $3,profileStatus=$4 WHERE email = $5`;
            const result = await client.query(updateUserQuery, [name, dob, nationalID,true,req.userMail]);

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