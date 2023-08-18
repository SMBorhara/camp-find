const express = require('express');
const CatchAsync = require('../utils/CatchAsync.js');
const router = express.Router();
const users = require('../controllers/users.js');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

router
	.route('/register')
	.get(users.registerUser)
	.post(CatchAsync(users.createUser));
router.route('/login');

router
	.route('/login')
	.get(users.loginScreen)
	.post(
		storeReturnTo,
		passport.authenticate('local', {
			failureFlash: true,
			failureRedirect: '/login',
		}),
		users.login
	);


router.get('/logout', users.logout);

module.exports = router;
