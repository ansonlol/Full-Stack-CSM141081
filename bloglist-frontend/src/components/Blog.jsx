import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, handleLike, handleDelete }) => {
  const [expanded, setExpanded] = useState(false)

  const blogStyle = {
    padding: '10px',
    border: 'solid 1px',
    marginBottom: '5px',
    borderRadius: '4px',
  }

  const deleteButtonStyle = {
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '3px',
    cursor: 'pointer',
  }

  const { title, author, url, likes, user } = blog
  const userName = user?.name || user?.username

  const addLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
    }
    handleLike(blog.id, updatedBlog)
  }

  const removeBlog = () => {
    if (window.confirm(`Remove blog "${title}" by ${author}?`)) {
      handleDelete(blog.id)
    }
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <div style={blogStyle} className="blog">
      <div className="blog-header">
        <span className="blog-title">{title}</span> - <span className="blog-author">{author}</span>
        <button 
          onClick={toggleExpanded} 
          style={{ marginLeft: '10px' }}
          className="toggle-button"
          aria-label={expanded ? 'Hide blog details' : 'View blog details'}
        >
          {expanded ? 'hide' : 'view'}
        </button>
      </div>
      
      {expanded && (
        <div className="blog-details">
          <div className="blog-url">{url}</div>
          <div className="blog-likes">
            likes <span className="likes-count">{likes}</span>
            <button onClick={addLike} className="like-button" aria-label="Like blog">like</button>
          </div>
          <div className="blog-user">{userName}</div>
          <button 
            style={deleteButtonStyle} 
            onClick={removeBlog} 
            className="remove-button"
            aria-label="Remove blog"
          >
            remove
          </button>
        </div>
      )}
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      name: PropTypes.string,
    }),
  }).isRequired,
  handleLike: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
}

export default Blog