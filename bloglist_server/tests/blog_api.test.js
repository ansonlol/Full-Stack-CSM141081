const { test, beforeEach, after } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app'); // Adjust the path as necessary
const Blog = require('../models/blog');
const assert = require('node:assert'); // Using assert

const api = supertest(app);

// Helper function to get the token
const getToken = async () => {
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'password' });
  return loginResponse.body.token;
};

beforeEach(async () => {
  try {
    await mongoose.connect(process.env.TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to test MongoDB');
  } catch (error) {
    console.error('Error connecting to test MongoDB:', error);
  }

  await Blog.deleteMany({});
  await Blog.insertMany([
    { title: 'Sample Blog', author: 'Test Author', url: 'http://example.com', likes: 0 },
    { title: 'Another Blog', author: 'Anson Author', url: 'http://anson.com', likes: 10 },
  ]);
});

after(async () => {
  await mongoose.connection.close();
});

// Now you can use the getToken function in your tests

test('blogs are returned as json', async () => {
  const token = await getToken();  // Get the token

  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Set the token in the Authorization header
    .expect(200)
    .expect('Content-Type', /application\/json/);

  console.log('Blogs response:', response.body);  // Debugging log

  assert.strictEqual(Array.isArray(response.body), true);
});

test('there are two blogs', async () => {
  const token = await getToken();  // Get the token

  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Set the token in the Authorization header
    .expect(200);

  console.log('Response body:', response.body); // Log the response for debugging
  assert.strictEqual(response.body.length, 2);
});

test('blogs have an id property', async () => {
  const token = await getToken();  // Get the token

  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Set the token in the Authorization header
    .expect(200);

  console.log('Response body:', response.body);

  assert.strictEqual(Array.isArray(response.body), true);

  response.body.forEach(blog => {
    assert.strictEqual(blog.id !== undefined, true);
    assert.strictEqual(blog.hasOwnProperty('_id'), false);
  });
});

test('creating a new blog post increases the number of blogs', async () => {
  const token = await getToken();  // Get the token

  const initialBlogs = await Blog.find({});
  const initialBlogCount = initialBlogs.length;

  const newBlog = {
    title: 'New Blog Title',
    author: 'New Author',
    url: 'http://new-blog.com',
    likes: 5,
  };

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)  // Include the token
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAfter = await Blog.find({});
  const newBlogCount = blogsAfter.length;

  assert.strictEqual(newBlogCount, initialBlogCount + 1);

  const addedBlog = blogsAfter.find(blog => blog.id === response.body.id);
  assert.strictEqual(addedBlog.title, newBlog.title);
  assert.strictEqual(addedBlog.author, newBlog.author);
  assert.strictEqual(addedBlog.url, newBlog.url);
  assert.strictEqual(addedBlog.likes, newBlog.likes);
});

test('if likes property is missing, it defaults to 0', async () => {
  const token = await getToken();  // Get the token

  const newBlog = {
    title: 'Blog Without Likes',
    author: 'Author',
    url: 'http://nolikes.com',
  };

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.likes, 0);
});

test('POST /api/blogs responds with 400 if title is missing', async () => {
  const token = await getToken();  // Get the token

  const newBlogWithoutTitle = {
    author: 'Author',
    url: 'http://example.com',
    likes: 5,
  };

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlogWithoutTitle)
    .expect(400);

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(response.body, { error: 'Title is required' });
});

test('POST /api/blogs responds with 400 if url is missing', async () => {
  const token = await getToken();  // Get the token

  const newBlogWithoutUrl = {
    title: 'Blog Without URL',
    author: 'Author',
    likes: 5,
  };

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlogWithoutUrl)
    .expect(400);

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(response.body, { error: 'URL is required' });
});

test('a blog can be deleted', async () => {
  const token = await getToken(); // Ensure you get a valid token for the user creating the blog

  // Create a new blog first, so you can delete it later
  const newBlog = {
    title: "New Blog for Deletion",
    author: "Anson Lee",
    url: "http://anson.com/my-deletion-blog",
    likes: 10,
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201); // Expect creation success

  // Get all blogs and ensure the one you just created exists
  const initialResponse = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const initialBlogs = initialResponse.body;
  const blogToDelete = initialBlogs.find(blog => blog.title === "New Blog for Deletion");

  // Log the ID to verify it's correct
  console.log('Blog ID to Delete:', blogToDelete.id);  // Debugging log

  // Attempt to delete the blog
  const deleteResponse = await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204);  // 204 No Content indicates a successful deletion

  console.log('Delete Response:', deleteResponse.status);  // Debugging log

  // Now, let's check if the blog has actually been deleted
  const updatedResponse = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const updatedBlogs = updatedResponse.body;

  // Ensure the total number of blogs decreased by 1
  assert.strictEqual(updatedBlogs.length, initialBlogs.length - 1);

  // Ensure the deleted blog is no longer in the list of blogs
  const deletedBlogTitles = updatedBlogs.map(blog => blog.title);
  assert(!deletedBlogTitles.includes(blogToDelete.title));  // The deleted blog should not be in the updated list
});


test('deleting a non-existent blog returns 404', async () => {
  const token = await getToken();  // Get the token

  const nonExistentId = '605c72a2c3e17a2a38e4e2b1'; 

  const response = await api
    .delete(`/api/blogs/${nonExistentId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404);

  assert.strictEqual(response.body.error, 'Blog not found');
});

test('a blog post can be updated', async () => {
  const token = await getToken();  // Get the token

  const initialResponse = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`);

  const blogToUpdate = initialResponse.body[0];
  const updatedLikes = { likes: 15 };

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedLikes)
    .expect(200);

  assert.strictEqual(response.body.likes, updatedLikes.likes);

  const updatedBlog = await Blog.findById(blogToUpdate.id);
  assert.strictEqual(updatedBlog.likes, updatedLikes.likes);
});

test('updating a non-existent blog returns 404', async () => {
  const token = await getToken();  // Get the token

  const nonExistentId = '605c72a2c3e17a2a38e4e2b1'; 
  const updatedLikes = { likes: 10 };

  const response = await api
    .put(`/api/blogs/${nonExistentId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedLikes)
    .expect(404);

  assert.strictEqual(response.body.error, 'Blog not found');
});

test('updating without likes defaults to 0', async () => {
  const token = await getToken();  // Get the token

  const initialResponse = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`);

  const blogToUpdate = initialResponse.body[0];

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({})
    .expect(200);

  assert.strictEqual(response.body.likes, 0);
});

test('adding a new blog with a valid token succeeds', async () => {
  const token = await getToken();  // Get the token

  // Ensure the database is empty before adding a new blog
  await Blog.deleteMany({});

  const newBlog = {
    title: 'New Blog Title',
    author: 'Test Author',
    url: 'https://example.com',
    likes: 100,
  };

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201);

  assert.strictEqual(response.body.title, newBlog.title);
  assert.strictEqual(response.body.author, newBlog.author);
  assert.strictEqual(response.body.url, newBlog.url);
  assert.strictEqual(response.body.likes, newBlog.likes);

  // Check the number of blogs after adding the new one
  const blogsAtEnd = await Blog.find({});
  assert.strictEqual(blogsAtEnd.length, 1);  // Only one blog should be present

  // Optionally check the new blog's data
  const addedBlog = blogsAtEnd[0];
  assert.strictEqual(addedBlog.title, newBlog.title);
  assert.strictEqual(addedBlog.author, newBlog.author);
  assert.strictEqual(addedBlog.url, newBlog.url);
  assert.strictEqual(addedBlog.likes, newBlog.likes);
});


test('adding a new blog fails with 401 Unauthorized if no token is provided', async () => {
  const newBlog = {
    title: 'New Blog Title',
    author: 'Test Author',
    url: 'https://example.com',
    likes: 100,
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401);

  assert.strictEqual(response.body.error, 'token missing');
});
