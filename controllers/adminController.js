const { body, validationResult } = require('express-validator');
const client = require('../database');

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

//disable user account
exports.disableUserAccount=async(req,res)=>{
    const { email } = req.body;
    try {
        const checkUserQuery = `SELECT * FROM users WHERE email = $1`;
        const userResult = await client.query(checkUserQuery, [email]);

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const updateQuery = `UPDATE users SET accountStatus = FALSE WHERE email = $1`;
        await client.query(updateQuery, [email]);

        return res.status(200).json({ message: 'Account has been disabled successfully.' });

    } catch (err) {
        console.error('Error disabling account:', err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};