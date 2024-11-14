// tests/login.test.cjs
const { test, expect, beforeEach, describe } = require('@playwright/test');

const baseURL = 'http://localhost:5173'; // Base URL for your app
const apiBaseURL = 'http://localhost:3003/api'; // Base URL for your API

// Helper function to login a user
async function loginUser(page, username, password, name) {
  await page.fill('input[name="Username"]', username);
  await page.fill('input[name="Password"]', password);
  await page.click('button[type="submit"]');
  const userGreeting = page.locator(`p:has-text("logged in as ${name}")`);
  await expect(userGreeting).toBeVisible();
}

// Helper function to create a blog
async function createBlog(page, title, author, url) {
  const newBlogButton = page.locator('button:has-text("create new blog")');
  await newBlogButton.click();
  await expect(page.locator('input[name="title"]')).toBeVisible();
  await page.fill('input[name="title"]', title);
  await page.locator('input[name="author"]').fill(author);
  await page.locator('input[name="url"]').fill(url);
  await Promise.all([
    page.waitForResponse(response => 
      response.url().includes('/api/blogs') && response.status() === 201
    ),
    page.locator('button[type="submit"]').click()
  ]);
}


async function createBlogOther(page, title, author, url) {
  
  await expect(page.locator('input[name="title"]')).toBeVisible();
  await page.fill('input[name="title"]', title);
  await page.locator('input[name="author"]').fill(author);
  await page.locator('input[name="url"]').fill(url);
  await Promise.all([
    page.waitForResponse(response => 
      response.url().includes('/api/blogs') && response.status() === 201
    ),
    page.locator('button[type="submit"]').click()
  ]);
}

async function likeBlog(page, blogTitle) {
  // Find the blog container using the blog-title class
  const blogContainer = page.locator(`.blog:has(.blog-title:text-is("${blogTitle}"))`);
  
  // Click the view button using the toggle-button class
  await blogContainer.locator('.toggle-button').click();
  console.log("viewed");

  // Wait for the blog details to appear and find the like button
  // You might need to wait for the expanded content to become visible
  await page.waitForTimeout(500); // Add a small delay for the content to expand
  
  // Find the like button within the same blog container
  const likeButton = blogContainer.locator('button:has-text("like")');
  await expect(likeButton).toBeVisible({ timeout: 10000 });
  
  await likeButton.click();
  console.log("clicked once");
  
  await page.waitForTimeout(500);
}


// Login and Blog Creation tests
describe('Login and Blog Creation Tests', () => {
  beforeEach(async ({ page, request }) => {
    // Reset DB and create test users
    await request.post(`${apiBaseURL}/testing/reset`);
    await request.post(`${apiBaseURL}/users`, {
      data: { username: 'tryUs1232132er', name: 'Test User', password: 'password123' }
    });
    await request.post(`${apiBaseURL}/users`, {
      data: { username: 'anotheruser', name: 'Another User', password: 'password123' }
    });
  });

  test('Login form is shown', async ({ page }) => {
    await page.goto(baseURL);
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
  });

  describe('Login Tests', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.goto(baseURL);
      await loginUser(page, 'tryUs1232132er', 'password123', 'Test User');
    });

    test('fails with wrong credentials', async ({ page }) => {
      await page.goto(baseURL);
      await page.fill('input[name="Username"]', 'tryUs1232132er');
      await page.fill('input[name="Password"]', '123');
      await page.click('button[type="submit"]');
      const errorMessage = page.locator('.error');
      await expect(errorMessage).toBeVisible();
    });
  });

  describe('Blog Tests', () => {
    test('a new blog can be created', async ({ page }) => {
      await page.goto(baseURL);
      await loginUser(page, 'tryUs1232132er', 'password123', 'Test User');
      await createBlog(page, 'New Blog Title', 'Test Author', 'http://example.com');
      const blogTitle = page.locator('span:has-text("New Blog Title")');
      await expect(blogTitle).toBeVisible();
      const checkAuthor = page.locator('span:has-text("Test Author")');
      await expect(checkAuthor).toBeVisible();
    });

    test('a blog can be liked', async ({ page }) => {
      await page.goto(baseURL);
      await loginUser(page, 'tryUs1232132er', 'password123', 'Test User');
      await createBlog(page, 'New Blog Title', 'Test Author', 'http://example.com');
      await page.waitForTimeout(1000); // Wait for UI to update
    
      await page.click('button:has-text("view")');
      const likesText = page.locator('text=likes');
      await expect(likesText).toBeVisible();
    
      // Wait for the text content and then parse it
      const initialLikesContent = await likesText.textContent();
      const initialLikes = parseInt(initialLikesContent.match(/\d+/)[0]);
    
      await page.click('button:has-text("like")');
    
      // Wait for the likes count to update and verify it's incremented
      await expect(async () => {
        const newLikesContent = await likesText.textContent();
        const newLikes = parseInt(newLikesContent.match(/\d+/)[0]);
        expect(newLikes).toBe(initialLikes + 1);
      }).toPass();
    });
    

    test('a blog can be deleted by the creator', async ({ page }) => {
      await page.goto(baseURL);
      await loginUser(page, 'tryUs1232132er', 'password123', 'Test User');
      await createBlog(page, 'Blog to be deleted', 'Test Author', 'http://example.com');
      await page.click('button:has-text("view")');

      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      await page.click('button:has-text("remove")');
      const blogTitle = page.locator('span.blog-title:has-text("Blog to be deleted")');
      await expect(blogTitle).not.toBeVisible();
    });
  });
});

// Delete Permissions Test
describe('Delete Permissions Tests', () => {
  beforeEach(async ({ page, request }) => {
    // Reset DB and create test users
    await request.post(`${apiBaseURL}/testing/reset`);
    await request.post(`${apiBaseURL}/users`, {
      data: { username: 'tryUs1232132er', name: 'Test User', password: 'password123' }
    });
    await request.post(`${apiBaseURL}/users`, {
      data: { username: 'anotheruser', name: 'Another User', password: 'password123' }
    });
  });

  test('delete button is only visible to blog creator', async ({ page }) => {
    await page.goto(baseURL);
    await loginUser(page, 'tryUs1232132er', 'password123', 'Test User');

    await createBlog(page, 'Test Blog', 'Test Author', 'http://testurl.com');
    await page.click('button:has-text("view")');
    const deleteButton = page.locator('button:has-text("remove")');
    await expect(deleteButton).toBeVisible();

    // Logout creator
    await page.click('button:has-text("logout")');

    // Login as another user
    await loginUser(page, 'anotheruser', 'password123', 'Another User');
    
    const deleteButtonForOtherUser = page.locator('button:has-text("remove")');
    await expect(deleteButtonForOtherUser).not.toBeVisible();
  });
});

describe('Blog Sorting by Likes Test', () => {
  beforeEach(async ({ page, request }) => {
    // Reset DB and create test users
    await request.post(`${apiBaseURL}/testing/reset`);
    await request.post(`${apiBaseURL}/users`, {
      data: { username: 'tryUs1232132er', name: 'Test User', password: 'password123' }
    });
  });

  test('blogs are ordered by likes, with the most liked blog first', async ({ page }) => {
    // Log in as a test user
    await page.goto(baseURL);
    await loginUser(page, 'tryUs1232132er', 'password123', 'Test User');

    // Create blogs
    await createBlog(page, 'Blog 1', 'Test Author', 'http://example.com/1');
    await createBlogOther(page, 'Blog 2', 'Test Author', 'http://example.com/2');
    await page.waitForTimeout(1000); // Wait for UI to update

    // Like Blog 2 once
    const blog2Container = page.locator('.blog:has(.blog-title:text-is("Blog 2"))');
    await blog2Container.locator('.toggle-button').click();
    const blog2Likes = blog2Container.locator('text=likes');
    await expect(blog2Likes).toBeVisible();
    
    await blog2Container.locator('button:has-text("like")').click();
    await page.waitForTimeout(500);

    // View Blog 1 but don't like it
    const blog1Container = page.locator('.blog:has(.blog-title:text-is("Blog 1"))');
    await blog1Container.locator('.toggle-button').click();
    const blog1Likes = blog1Container.locator('text=likes');
    await expect(blog1Likes).toBeVisible();

    // Get the blogs in their current order
    const blogs = await page.locator('.blog').all();
    const blogData = [];
    
    for (const blog of blogs) {
        const title = await blog.locator('.blog-title').textContent();
        const likesText = await blog.locator('text=likes').textContent();
        const likes = parseInt(likesText.match(/\d+/)[0]);
        blogData.push({ title, likes });
    }

    // Verify the order: Blog 2 (1 like) should be first, followed by Blog 1 (0 likes)
    expect(blogData[0].title).toBe('Blog 2');
    expect(blogData[0].likes).toBe(1);
    expect(blogData[1].title).toBe('Blog 1');
    expect(blogData[1].likes).toBe(0);
});
});