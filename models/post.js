const mongoose = require('mongoose');

// Define the schema for the Post
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is required
    maxlength: 200,  // Limit the length of the title if needed
  },
  body: {
    type: String,
    required: true, // Body/content of the post is required
  },
  date: {
    type: Date,
    default: Date.now, // Use the current date if no date is provided
  },
  categories: {
    type: [String], // Array of categories (e.g., ['Climate', 'Environment'])
    required: true,
  },
  likes: {
    type: Number,
    default: 0, // Initial likes count
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: 'User', // Assuming you have a User model to track authors
    required: true,
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User who made the comment
      ref: 'User',
    },
    commentText: {
      type: String,
      required: true, // Comment text is required
    },
    date: {
      type: Date,
      default: Date.now, // Date when the comment was made
    },
  }],
});

// Create the Post model from the schema
const Post = mongoose.model('Post', postSchema);

// Export the model to use in other files
module.exports = Post;

