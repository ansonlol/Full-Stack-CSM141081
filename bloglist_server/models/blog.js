const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: {type: Number, default: 0},

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Define how Mongoose converts documents to JSON
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Rename _id to id
    delete returnedObject._id; // Remove the _id property
    delete returnedObject.__v; // Optionally remove the __v property
  }
});

module.exports = mongoose.model('Blog', blogSchema);
