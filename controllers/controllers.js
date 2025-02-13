const Post = require('../models/post');
const User = require('../models/user');


const jwt = require('jsonwebtoken');

//twilio thrid package api to send sms to a phone number
const twilio = require('twilio');
const dotenv = require('dotenv');

//load environment vars
dotenv.config();

// Twilio client setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//redirects to home page 
module.exports.redirect_home = (req, res) => {
    res.redirect('/posts');
}

//shows all posts on a home page
module.exports.posts_get = (req, res) => {
    //automatically infers content type
    //automatically infers status code

    //display all post on a main page
    Post.find()
        .then((result) => {
            res.render('home', { posts: result });
        })
        .catch((err) => {
            console.log(err)
        })

}

module.exports.post_get = (req, res) => {
    const id = req.params.id;
    //console.log(id)

    Post.findById(id)
        .then((result) => {
            res.render('post', { post: result, title: 'Post' })
        })
        .catch((err) => {
            console.log(err);
        })
}


module.exports.post_post = async (req, res) => {
    const post = new Post(req.body);

    const accessToken = req.cookies['jwt']; // Accessing 'jwt' from cookies
    // Decode the refresh token to get the user ID
    const decoded = jwt.verify(accessToken, process.env.KEY);
    const id = decoded.id;

    // Find the user in the database
    const user = await User.findById(id);
    console.log(user);
    post.author = id

    post.save()
        .then((result) => {
            // Send SMS after saving the post
            const messageBody = `A new post has been created: ${result.title}`;
            const recipientPhoneNumber = "+77021345823"; // Phone number to receive the SMS (can be admin or user)

            client.messages.create({
                to: recipientPhoneNumber, // Recipient's phone number
                from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
                body: messageBody, // Message content
            })
                .then((message) => {
                    console.log('SMS sent successfully:', message.sid);
                    res.redirect('/posts'); // Redirect to posts list after sending SMS
                })
                .catch((err) => {
                    console.error('Failed to send SMS:', err);
                    res.status(500).send('Error occurred while sending SMS.');
                });
        })
        .catch((err) => {
            console.log('Error saving post:', err);
            res.status(500).send('Error occurred while saving the post.');
        });

}


module.exports.posts_delete = (req, res) => {
    const id = req.params.id;

    //deletes record by id and deletes it 
    Post.findByIdAndDelete(id)
        .then((result) => {
            res.json({ redirect: '/posts' })
        })
        .catch((err) => {
            console.log(err)
        })
}

module.exports.post_delete = (req, res) => {
    const id = req.params.id;

    //deletes record by id and deletes it 
    Post.findByIdAndDelete(id)
        .then((result) => {
            res.json({ redirect: '/posts' })
        })
        .catch((err) => {
            console.log(err)
        })
}

//renders new posts page
module.exports.newPosts_get = (req, res) => {
    res.render('newPosts');
}

//renders popular posts page
module.exports.popularPosts_get = (req, res) => {
    res.render('popularPosts');
}


//handle auth errors 

const HandleErrors = (err) => {
    // console.log(err.message, err.code);
    let errors = { nickname: '', email: '', password: '' };


    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
    }

    //duplicat error code
    if (err.code === 11000) {
        errors.email = "That email is already registered";
        return errors;
    }

    //validation errors 
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {//gets values of an object without it keys
            errors[properties.path] = properties.message; //updating "error" object with different error messages
        });
    }

    return errors;
}


//crate token 
const maxAge = 1000 * 60 * 10;

// Generate access and refresh tokens
const CreateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.KEY, {
        expiresIn: '10m', // Access token expires in 10 minutes
    });

    const refreshToken = jwt.sign({ id }, process.env.REFRESH_KEY, {
        expiresIn: '7d', // Refresh token expires in 7 days
    });

    console.log(refreshToken)

    return { accessToken, refreshToken };
};
//auth controllers
module.exports.signup_get = (req, res) => {
    res.render('signup');
    console.log("Opened sign up page")
};

module.exports.login_get = (req, res) => {
    res.render('login');
    console.log("Opened login page")
};

module.exports.signup_post = async (req, res) => {
    const { nickname, email, password } = req.body;

    console.log("create a new user")

    try {
        const user = await User.create({ nickname, email, password });//storing new user in db by passing an object

        // Check if the user already has a refresh token, and if so, invalidate it
        if (user.refreshToken) {
            // Optionally, you could delete the previous refresh token, or update it
            user.refreshToken = null; // Remove old refresh token
            await user.save();
        }

        // Create new tokens
        const { accessToken, refreshToken } = CreateTokens(user._id);

        // Save the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Set the access token in a cookie or return it directly
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge });
        res.cookie('refresh-token', refreshToken, { httpOnly: true, maxAge: maxAge });
        res.status(200).json({ user: user._id });


    } catch (err) {  //throws an error if user wasn't saved successfully 
        console.log(err.message, err.code);
        const errors = HandleErrors(err);
        res.status(400).json({ errors });


    }
}


module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.login(email, password);
        // Check if the user already has a refresh token, and if so, invalidate it
        if (user.refreshToken) {
            // Optionally, you could delete the previous refresh token, or update it
            user.refreshToken = null; // Remove old refresh token
            await user.save();
        }

        // Create new tokens
        const { accessToken, refreshToken } = CreateTokens(user._id);

        // Save the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Set the access token in a cookie or return it directly
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge });
        res.cookie('refresh-token', refreshToken, { httpOnly: true, maxAge: maxAge });

        // Return the refresh token in the response
        res.status(200).json({ user: user._id, refreshToken });

    } catch (err) {
        const errors = HandleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.logout_get = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.cookie('refresh-token', '', { maxAge: 1 });
    res.redirect('/');
};


