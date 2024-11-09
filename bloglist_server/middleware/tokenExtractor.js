// middleware/tokenExtractor.js
const tokenExtractor = (request, response, next) => {
  const authorization = request.get('Authorization'); // Get the Authorization header

  // Check if the Authorization header exists and starts with "Bearer "
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7); // Extract the token (after "Bearer ")
  } else {
    request.token = null; // If no token is provided, set it to null
  }

  next(); // Proceed to the next middleware
};

module.exports = tokenExtractor;
