const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/users')
const jwt = require('jsonwebtoken')


// GET all blogs
blogRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id:1}); // Populate creator info
    response.json(blogs);
  } catch (error) {
    response.status(500).json({ error: 'Failed to retrieve blogs' });
  }
});

// POST a new blog

blogRouter.post('/', async (request, response) => {
  const { title, url, author, likes } = request.body;
  const user = request.user; // Get user from request object

  // Log for debugging
  console.log('Received blog data:', request.body);
  console.log('Authenticated user:', user);

  // Validate required fields
  if (!title) {
    return response.status(400).json({ error: 'Title is required' });
  }
  
  if (!url) {
    return response.status(400).json({ error: 'URL is required' });
  }

  // Create a new blog
  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user.id, // Set the creator's ID from the user object
  });

  try {
    const result = await blog.save();

    // Fetch the full user document from the database using user.id
    const fullUser = await User.findById(user.id);
    
    // Ensure the user is found
    if (!fullUser) {
      return response.status(400).json({ error: 'User not found' });
    }

    // Initialize `blogs` as an empty array if it's undefined
    if (!fullUser.blogs) {
      fullUser.blogs = [];
    }

    // Add the blog ID to the user's blogs array
    fullUser.blogs = fullUser.blogs.concat(result._id);

    // Save the updated user document
    await fullUser.save();

    response.status(201).json(result);  // Return the created blog
  } catch (error) {
    console.error('Error saving blog:', error);  // Log the error for debugging
    response.status(400).json({ error: 'Failed to create a blog' });
  }
});


// DELETE a blog by ID
blogRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const user = request.user; // Get user from request object

  // Find the blog to be deleted
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    // Check if the user ID matches
    if (blog.user.toString() !== user.id.toString()) {
      return response.status(403).json({ error: 'Only the creator can delete this blog' });
    }

    await Blog.findByIdAndDelete(id);
    response.status(204).end(); // No content
  } catch (error) {
    response.status(400).json({ error: 'Invalid ID format' });
  }
});
// PUT: Update a blog post by ID
blogRouter.put('/:id', async (request, response) => {
  const { id } = request.params;
  const { likes } = request.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { likes: likes || 0 }, // Update likes, default to 0 if not provided
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (updatedBlog) {
      response.json(updatedBlog);
    } else {
      response.status(404).json({ error: 'Blog not found' });
    }
  } catch (error) {
    response.status(400).json({ error: 'Invalid ID format or update failed' });
  }
});
module.exports = blogRouter;