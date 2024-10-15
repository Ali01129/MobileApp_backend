const client = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const createUserTableIfNotExists = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
      userID SERIAL PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      totalInvested DECIMAL(10, 2) DEFAULT 0,
      totalProfit DECIMAL(10, 2) DEFAULT 0,
      totalLoss DECIMAL(10, 2) DEFAULT 0,
      dob DATE,
      nationalID VARCHAR(50), -- SSN / Passport / National ID
      profileStatus BOOLEAN DEFAULT FALSE, -- false means not completed
      accountStatus BOOLEAN DEFAULT TRUE, -- true means active
      accountDeleted BOOLEAN DEFAULT FALSE, -- true means deleted
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
    try {
        await client.query(createTableQuery);
        console.log('Users table created or already exists.');
    } catch (err) {
        console.error('Error creating users table:', err);
        throw err;
    }
};

//register user api
exports.register = [
  // Validation checks
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  async (req, res) => {
    const { email, password } = req.body;

    // Handling validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ message: firstError });
    }

    try {
      await createUserTableIfNotExists();

      // Check if the user already exists
      const userCheckQuery = 'SELECT * FROM users WHERE email = $1';
      const userCheckResult = await client.query(userCheckQuery, [email]);

      if (userCheckResult.rows.length > 0) {
        if(userCheckResult.rows[0].accountdeleted==true || userCheckResult.rows[0].accountstatus==false){
          return res.status(400).json({message:'Your account has been Deleted or Banned. If you want to reopen your account, please contact support.'});
        }
        return res.status(400).json({ message: 'User already exists'});
      }

      // Hash the password before saving it to the database
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert the new user into the database
      const insertUserQuery = 'INSERT INTO users (email, password) VALUES ($1, $2)';
      const values = [ email, hashedPassword];
      await client.query(insertUserQuery, values);

      // Creating token
      const token = jwt.sign({ email: email }, JWT_SECRET);

      // Sending result
      return res.status(200).json({ message: 'User registered successfully', token: token });

    } catch (err) {
      console.error('Error registering user:', err);
      return res.status(500).json({ error: 'Error registering user' });
    }
  }
];


//login user api
exports.login = [
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
        // Checking if the user with the email exists
        const query = 'SELECT * FROM users WHERE email=$1 AND accountDeleted != true AND accountstatus != false';
        const queryResult = await client.query(query, [email]);
  
        if (queryResult.rowCount === 1) {
          const userinfo=queryResult.rows[0];
          const pass = queryResult.rows[0].password;
          const result = await bcrypt.compare(password, pass);
  
          if (result) {
            // Creating token
            const token = jwt.sign({ email: email }, JWT_SECRET);
            // Sending data
            return res.status(200).json({ message: 'User logged in successfully', token: token,user:{name:userinfo.name,email:userinfo.email,dob:userinfo.dob,totalinvested:userinfo.totalinvested,totalprofit:userinfo.totalprofit,totalloss:userinfo.totalloss} });
          } else {
            return res.status(401).json({ message: 'Email or password is incorrect' });
          }
        } else {
          return res.status(404).json({ message: 'Email or password is incorrect' });
        }
  
      } catch (err) {
        console.error('Error logging in user:', err);
        return res.status(500).json({ error: 'Error logging in user' });
      }
    }
];

exports.googleAuth=[
  // Validation checks
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email or password is incorrect'),
  async(req,res)=>{
    const {name,email}=req.body;
    try{
      // Checking if the user exists
      const query = 'SELECT * FROM users WHERE email=$1';
      const queryResult = await client.query(query, [email]);
      //login
      if(queryResult.rowCount===1){
          const userinfo=queryResult.rows[0];
          if(userinfo.accountdeleted==true || userinfo.accountstatus==false){
            return res.status(400).json({message:'Your account has been Deleted or Banned. If you want to reopen your account, please contact support.'});
          }
          const pass = queryResult.rows[0].password;
          const result = await bcrypt.compare(email, pass);
          if (result) {
            const token = jwt.sign({ email: email }, JWT_SECRET);
            return res.status(200).json({ message: 'User logged in successfully', token: token ,user:{name:userinfo.name,email:userinfo.email,dob:userinfo.dob,totalinvested:userinfo.totalinvested,totalprofit:userinfo.totalprofit,totalloss:userinfo.totalloss}});
          }
          else{
            return res.status(401).json({ message: 'Email or password is incorrect' });
          }
      }
      else if(queryResult.rowCount===0){
        await createUserTableIfNotExists();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(email, salt);
        const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)';
        const values = [ name, email, hashedPassword];
        await client.query(insertUserQuery, values);
        const token = jwt.sign({ email: email }, JWT_SECRET);
        //fetching user info
        const query = 'SELECT * FROM users WHERE email=$1';
        const queryResult = await client.query(query, [email]);
        if(queryResult.rowCount===1){
          const userinfo=queryResult.rows[0];
        }
        return res.status(200).json({ message: 'User registered successfully', token: token ,user:{name:userinfo.name,email:userinfo.email,totalinvested:userinfo.totalinvested,totalprofit:userinfo.totalprofit,totalloss:userinfo.totalloss} });
      }
    }
    catch(err){
      console.error('Error logging in user:', err);
      return res.status(500).json({ error: 'Error logging in user' });
    }
  }
];