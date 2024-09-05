const client = require('../database');
const { body, validationResult } = require('express-validator');

// Function to create the projects table if it doesn't exist
const createProjectsTableIfNotExists = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS projects (
            ProjectID SERIAL PRIMARY KEY,
            AdminID INTEGER REFERENCES admins(AdminID) ON DELETE CASCADE,
            Title VARCHAR(255) NOT NULL,
            Description TEXT NOT NULL,
            TargetAmount DECIMAL(15, 2) NOT NULL,
            StartDate DATE NOT NULL,
            EndDate DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    try {
        await client.query(createTableQuery);
        console.log('Projects table created or already exists.');
    } catch (err) {
        console.error('Error creating projects table:', err);
        throw err;
    }
};

// API to add a new project
exports.addProject = [
    // Validation checks
    body('adminID').isInt().withMessage('AdminID must be an integer'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('targetAmount').isDecimal().withMessage('Target amount must be a decimal value'),
    body('startDate').isDate().withMessage('Start date is required'),
    body('endDate').isDate().withMessage('End date is required'),

    async (req, res) => {
        const { adminID, title, description, targetAmount, startDate, endDate } = req.body;

        // Handling validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0].msg;
            return res.status(400).json({ message: firstError });
        }

        try {
            await createProjectsTableIfNotExists();

            // Insert new project into the database
            const insertProjectQuery = `
                INSERT INTO projects (AdminID, Title, Description, TargetAmount, StartDate, EndDate)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const values = [adminID, title, description, targetAmount, startDate, endDate];
            await client.query(insertProjectQuery, values);

            // Send success response
            return res.status(200).json({ message: 'Project added successfully' });

        } catch (err) {
            console.error('Error adding project:', err);
            return res.status(500).json({ error: 'Error adding project' });
        }
    }
];

// API to get all projects
exports.getAllProjects = async (req, res) => {
    try {
      // Query to fetch all projects
      const query = `
        SELECT p.ProjectID, p.Title, p.Description, p.TargetAmount, p.StartDate, p.EndDate, a.Name as AdminName
        FROM projects p
        JOIN admins a ON p.AdminID = a.AdminID
      `;
      const result = await client.query(query);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No projects found' });
      }
  
      // Return all the projects
      return res.status(200).json(result.rows);
  
    } catch (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ error: 'Error fetching projects' });
    }
};