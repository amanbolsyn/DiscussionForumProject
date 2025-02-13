const { Router } = require('express')
const controllers = require('../controllers/controllers.js');
const { requireAuth, checkUser, checkRefreshToken } = require('../middleware/authMiddleware.js');

const router = Router();


router.get('*', checkUser);
router.get('/', requireAuth, checkRefreshToken, controllers.redirect_home);
router.get('/posts', requireAuth, checkRefreshToken, controllers.posts_get);
router.post('/posts', requireAuth, checkRefreshToken, controllers.post_post);


router.get('/post/:id', controllers.post_get);

//delete post routes
router.delete('/posts/:id', controllers.posts_delete);
router.delete('/post/:id', controllers.post_delete);


router.get('/new', controllers.newPosts_get);
router.get('/popular', controllers.popularPosts_get);

//auth routes
router.get('/signup', controllers.signup_get);
router.post('/signup', controllers.signup_post);
router.get('/login', controllers.login_get);
router.post('/login', controllers.login_post);
router.get('/logout', controllers.logout_get);

module.exports = router;