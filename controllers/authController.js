const client = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

JWT_SECRET='made-by-ali';

const createUserTableIfNotExists = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(15) NOT NULL,
            dob DATE NOT NULL,
            accountStatus BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

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
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('dob').isDate().withMessage('Please enter a valid date of birth'),

  async (req, res) => {
    const { name, email, password, phone, dob } = req.body;

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
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash the password before saving it to the database
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert the new user into the database
      const insertUserQuery = 'INSERT INTO users (name, email, password, phone, dob) VALUES ($1, $2, $3, $4, $5)';
      const values = [name, email, hashedPassword, phone, dob];
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
        const query = 'SELECT * FROM users WHERE email=$1';
        const queryResult = await client.query(query, [email]);
  
        if (queryResult.rowCount === 1) {
          const pass = queryResult.rows[0].password;
          const result = await bcrypt.compare(password, pass);
  
          if (result) {
            // Creating token
            const token = jwt.sign({ email: email }, JWT_SECRET);
            // Sending data
            return res.status(200).json({ message: 'User logged in successfully', token: token });
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