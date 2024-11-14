const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

// Middleware to extract user from the token
const getUserFromToken = async (request, response) => {
  const authorization = request.get('authorization');
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const token = authorization.substring(7);
  
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return response.status(401).json({ error: 'user not found' });
    }
    return user;
  } catch (error) {
    return response.status(401).json({ error: 'invalid token' });
  }
};

// GET all blogs
blogRouter.get('/', async (request, response) => {
  try {
    const user = await getUserFromToken(request, response);  // Extract user from token
    if (!user) return;  // If user is not found, exit early

    // Find blogs where the user ID matches the token's user ID
    const blogs = await Blog.find({ user: user._id })
      .populate('user', { username: 1, name: 1, id: 1 });

    response.json(blogs);
  } catch (error) {
    response.status(500).json({ error: 'Failed to retrieve blogs' });
  }
});

// POST a new blog
blogRouter.post('/', async (request, response) => {
  const { title, url, author, likes = 0 } = request.body;
  const user = await getUserFromToken(request, response);  // Extract user from token
  if (!user) return;  // If user is not found, exit early

  // Validate required fields
  if (!title || !url) {
    return response.status(400).json({ error: 'Title and URL are required' });
  }

  try {
    // Create a new blog
    const blog = new Blog({
      title,
      author,
      url,
      likes,
      user: user._id, // Set the creator's ID from the user object
    });

    const result = await blog.save();

    // Add the blog to the user's list of blogs
    user.blogs = user.blogs.concat(result._id);
    await user.save();

    response.status(201).json(result);  // Return the created blog
  } catch (error) {
    console.error('Error saving blog:', error);  // Log the error for debugging
    response.status(400).json({ error: 'Failed to create blog' });
  }
});

// DELETE a blog by ID
blogRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const user = await getUserFromToken(request, response);  // Extract user from token
  if (!user) return;  // If user is not found, exit early

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    // Check if the user ID matches
    if (blog.user.toString() !== user._id.toString()) {
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
  const { title, author, url, likes } = request.body;
  const user = await getUserFromToken(request, response);  // Extract user from token
  if (!user) return;  // If user is not found, exit early

  try {
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    // Ensure the blog can only be updated by its creator
    if (blog.user.toString() !== user._id.toString()) {
      return response.status(403).json({ error: 'Only the creator can update this blog' });
    }

    // Update blog data
    blog.title = title || blog.title;
    blog.author = author || blog.author;
    blog.url = url || blog.url;
    blog.likes = likes || blog.likes;

    // Save the updated blog
    const updatedBlog = await blog.save();

    response.json(updatedBlog);  // Return the updated blog
  } catch (error) {
    response.status(400).json({ error: 'Failed to update blog' });
  }
});

module.exports = blogRouter;
