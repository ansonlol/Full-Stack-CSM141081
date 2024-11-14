import React from 'react'
import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'
import {vi} from 'vitest'

describe('Blog component', () => {
  const blog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testurl.com',
    likes: 10,
    user: { username: 'testuser', name: 'Test User' }
  }

  // Mock functions for handleLike and handleDelete
  const handleLike = vi.fn()
  const handleDelete = vi.fn()

  test('renders title and author, but not URL or likes by default', () => {
    render(<Blog blog={blog} handleLike={handleLike} handleDelete={handleDelete} />)

    // Check that title and author are rendered
    expect(screen.getByText('Test Blog')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()

    // Check that URL and likes are not rendered by default
    expect(screen.queryByText('http://testurl.com')).not.toBeInTheDocument()
    expect(screen.queryByText('likes 10')).not.toBeInTheDocument()
  })

  test('renders URL and likes when the details button is clicked', async () => {
    render(<Blog blog={blog} handleLike={handleLike} handleDelete={handleDelete} />)

    // Click the button to expand the blog details
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    // Check that URL and likes are now rendered
    // Check that URL and likes are now rendered
  expect(screen.getByText(/http:\/\/testurl\.com/i)).toBeInTheDocument()
  expect(screen.getByText(/likes/i)).toBeInTheDocument() // Check for "likes" text
  expect(screen.getByText('10')).toBeInTheDocument() // Check for "10" separately
  })


  test('calls handleLike twice when like button is clicked twice', async () => {
    render(<Blog blog={blog} handleLike={handleLike} handleDelete={handleDelete} />)

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton) // Expand the blog details

    const likeButton = screen.getByText('like')
    await user.click(likeButton) // First click
    await user.click(likeButton) // Second click

    expect(handleLike).toHaveBeenCalledTimes(2) // Assert that handleLike is called twice
  })
  
})