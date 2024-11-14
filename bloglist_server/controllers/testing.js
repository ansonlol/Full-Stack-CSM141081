
const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Blog = require('../models/blog');

router.post('/reset', async (req, res) => {
  try {
    // Clear the users and blogs (you can add more models if necessary)
    await User.deleteMany({}); // Deletes all users
    await Blog.deleteMany({}); // Deletes all blogs

    // Optionally, you can add a default user or other data
    // const defaultUser = new User({
    //   username: 'testuser',
    //   name: 'Test User',
    //   passwordHash: await bcrypt.hash('password123', 10)
    // });
    // await defaultUser.save();

    res.status(200).send('Database reset successfully');
  } catch (error) {
    console.error('Error resetting the database:', error);
    res.status(500).send('Error resetting database');
  }
});

module.exports = router;
