const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator'); // desttuctring validator package to have access to isEmail function
const Schema = mongoose.Schema;


const userSchema = new Schema({
  nickname: {
    type: String,
    required: [true, 'Please enter a nickname']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Pleas enter a valid email"]         //helps to validate an email 
    //isEmail func helps to validate an email that user entered. Returns true if valid and false if it is not valid
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'], //custome error messages for each case
    minlength: [7, 'Minimum password length is 7']
  },
  refreshToken: {
    type: String,  // Storing refresh token for single device login
    default: null,
  },
  verificationCode: {
    type: String,  // This stores the code sent to the user for email verification
    required: true,
},
})


userSchema.pre('save', async function (next) {
  // Check if the password is already hashed
  if (this.isModified('password') && !this.password.startsWith('$2')) {
      // If the password is not hashed (does not start with $2), hash it

      const salt = await bcrypt.genSalt();  // Generate a salt for bcrypt hashing
      this.password = await bcrypt.hash(this.password, salt);  // Hash the password
  }

  next();  // Proceed to the next middleware
});



// static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);

    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const User = mongoose.model('user', userSchema);

module.exports = User;