const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
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

//see all admins
exports.allAdmins=async(req,res)=>{
    try {
        const query = `SELECT * FROM admins`;
        const result = await client.query(query);
        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};

//update admin
exports.updateAdmin=async(req,res)=>{
    const { name } = req.body;
    try {
        const checkAdminQuery = `SELECT * FROM admins WHERE email = $1`;
        const adminResult = await client.query(checkAdminQuery, [req.userMail]);

        if (adminResult.rowCount === 0) {
            return res.status(404).json({ error: 'Admin not found.' });
        }

        const updateQuery = `UPDATE admins SET name = $1 WHERE email = $2`;
        await client.query(updateQuery, [name, req.userMail]);

        return res.status(200).json({ message: 'Admin has been updated successfully.' });

    } catch (err) {
        console.error('Error updating admin:', err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};

//admin change password
exports.changeAdminPassword=async(req,res)=>{
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    try{
        const checkAdminQuery = `SELECT * FROM admins WHERE email = $1`;
        const adminResult = await client.query(checkAdminQuery, [req.userMail]);

        if (adminResult.rowCount === 0) {
            return res.status(404).json({ error: 'Admin not found.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }  

        const admin = adminResult.rows[0];
        const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
        if(!isPasswordValid){
            return res.status(401).json({ error: 'Incorrect password' });
        }

        //hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updateQuery = `UPDATE admins SET password = $1 WHERE email = $2`;
        await client.query(updateQuery, [hashedPassword, req.userMail]);

        return res.status(200).json({ message: 'Password has been changed successfully.' });
    }
    catch(err){
        console.error('Error changing password:', err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};

//get all users
exports.allUsers=async(req,res)=>{
    try {
        const query = `SELECT * FROM users`;
        const result = await client.query(query);
        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};

