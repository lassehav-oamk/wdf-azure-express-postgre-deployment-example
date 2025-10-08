const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getAllGreetings, createGreeting, createTablesIfNotExists } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Azure SQL Greetings API',
    status: 'running'
  });
});

// GET all greetings
app.get('/greetings', async (req, res) => {
  try {
    const greetings = await getAllGreetings();
    res.json({
      success: true,
      data: greetings
    });
  } catch (err) {
    console.error('Error fetching greetings:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch greetings',
      message: err.message
    });
  }
});

// POST a new greeting
app.post('/greetings', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Greeting text is required'
      });
    }

    const greeting = await createGreeting(text.trim());
    res.status(201).json({
      success: true,
      data: greeting,
      message: 'Greeting created successfully'
    });
  } catch (err) {
    console.error('Error creating greeting:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create greeting',
      message: err.message
    });
  }
});

// Start server
async function startServer() {
  try {
    // Create tables if they don't exist
    await createTablesIfNotExists();
    
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize the server
startServer();
