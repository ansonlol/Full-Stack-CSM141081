import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './blogForm'
import { vi } from 'vitest'

describe('NewBlogForm component', () => {
    test('calls createBlog with the right details when a new blog is created', async () => {
      const createBlog = vi.fn() // Mock function for createBlog
      render(<BlogForm createBlog={createBlog} />)
  
      const user = userEvent.setup()
  
      // Fill out the form
      await user.type(screen.getByLabelText('Title:'), 'Test Blog Title')
      await user.type(screen.getByLabelText('Author:'), 'Test Author')
      await user.type(screen.getByLabelText('URL:'), 'http://testblogurl.com')
  
      // Submit the form
      await user.click(screen.getByRole('button', { name: /create/i }))
  
      // Assert that createBlog was called with correct details
      expect(createBlog).toHaveBeenCalledWith({
        title: 'Test Blog Title',
        author: 'Test Author',
        url: 'http://testblogurl.com',
      })
    })
  })