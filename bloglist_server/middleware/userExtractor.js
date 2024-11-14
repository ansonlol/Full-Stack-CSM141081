const jwt = require('jsonwebtoken');
const config = require('../utils/config'); // Ensure config.SECRET is set correctly

const userExtractor = (request, response, next) => {
  // Extract the token from the request
  const token = request.token; // This should be set by tokenExtractor

  if (!token) {
    return response.status(401).json({ error: 'token missing' }); // Token is required for authentication
  }

  try {
    // Decode and verify the token
    const decodedToken = jwt.verify(token, process.env.SECRET); // Secret should match the one used to sign the token

    // Check if the token contains an 'id' field (or any other necessary fields you expect)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' }); // Token is missing user id
    }

    // Attach the user information (decoded from the token) to the request object
    request.user = decodedToken; // Now you can access `request.user` in other routes, such as blog creation

    // Proceed to the next middleware or route handler
    next();

  } catch (error) {
    // Handle any JWT verification errors (e.g., token expired, malformed)
    return response.status(401).json({ error: 'token invalid' }); // Invalid token error
  }
};

module.exports = userExtractor;
