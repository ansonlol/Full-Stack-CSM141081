const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogRouter = require('./controllers/bloglist')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const tokenExtractor = require('./middleware/tokenExtractor');
const userExtractor = require('./middleware/userExtractor');

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())

app.use(express.json())
app.use(middleware.requestLogger)
app.use(express.static('dist'))

app.use(tokenExtractor); // Keep this as is

// The userExtractor middleware should be used only on routes that require the user to be authenticated
app.use('/api/blogs', userExtractor, blogRouter);

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)


const testingRouter = require('./controllers/testing')
app.use('/api/testing', testingRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
app.use(middleware.authenticateToken)

module.exports = app