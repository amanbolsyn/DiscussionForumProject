const jwt = require('jsonwebtoken');
const User = require('../models/user');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    // check json web token exists & is verified
    if (token) {
        jwt.verify(token,  process.env.KEY , (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
};


// check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token,  process.env.KEY , async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
          next();
        }
      });
    } else {
      res.locals.user = null;
      next();
    }
  };

  // Function to check the refresh token (this will be reusable for all requests)
const checkRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies['refresh-token']; // Accessing 'refresh-token' from cookies
  console.log(refreshToken)
  try {
    // Decode the refresh token to get the user ID
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY);
    const userId = decoded.id;

    // Find the user in the database
    const user = await User.findById(userId);

    // Check if the refresh token stored in the DB matches the one in the cookies
    if (user.refreshToken !== refreshToken) {
      // Tokens don't match, log out the user
      res.redirect('/logout');
    }
    // Token is valid, proceed to the next middleware
    next();

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};


  
module.exports = { requireAuth, checkUser, checkRefreshToken};