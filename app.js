const express = require('express');
const mongoose = require('mongoose');
const Post = require('./models/post');
const routes = require('./routes/routes');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

//load environment vars
dotenv.config();

//express app
const app = express();

//register view engine 
app.set('view engine', 'ejs')

//connect to mongoDB
const dbURI = process.env.DB_URL;
mongoose.connect(dbURI)
    .then((result) => {
        app.listen(process.env.PORT)
        console.log("Server started")})
    .catch((err) => console.log(err))


//register view engine 
app.set('view engine', 'ejs')

//middlware and static files(images, styles)
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(routes);


//logging to console for every request 
app.use((req, res, next) => {
    console.log('New request made:', 'host: ', req.hostname, 'path: ', req.path, ' method: ', req.method);
    //explicitly say middlware that we finished and it may go on
    next();
});


app.put('/posts/:id', (req, res) => {
    const id = req.params.id; // Get the post ID from the URL
    const { title, body } = req.body; // Get updated title and body from the request body

    console.log(req.body)

    // Find the post by ID and update it
    Post.findByIdAndUpdate(id, { title, body }, { new: true })  // `new: true` returns the updated post
        .then((updatedPost) => {
            res.json({ result: updatedPost });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Error updating post' });
        });
});

//404 page
app.use((req, res) => {
    res.render('404');
});


