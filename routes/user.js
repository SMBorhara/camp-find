const express = require('express');
const CatchAsync = require('../utils/CatchAsync.js');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

// register user routes
router.get('/register', (req, res) => {
	res.render('users/register');
});

router.post(
	'/register',
	CatchAsync(async (req, res) => {
		try {
			const { email, username, password } = req.body;
			const user = new User({ email, username });
			const registeredUser = await User.register(user, password);
			console.log(registeredUser);
			req.login(registeredUser, (err) => {
				if (err) return next(err);
				req.flash('success', 'Welcome to Camp Seeker!');
				res.redirect('/campgrounds');
			});
		} catch (e) {
			req.flash('error', e.message);
			res.redirect('/register');
		}
	})
);

// login routes
router.get('/login', (req, res) => {
	res.render('users/login');
});

router.post(
	'/login',
	storeReturnTo,
	passport.authenticate('local', {
		failureFlash: true,
		failureRedirect: '/login',
	}),
	(req, res) => {
		req.flash('success', 'Welcome Back!');
		const redirectUrl = res.locals.returnTo || '/campgrounds';
		delete req.session.returnTo;
		res.redirect(redirectUrl);
	}
);

router.get('/logout', (req, res) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		req.flash('success', 'Successfully Logged Out');
		res.redirect('/campgrounds');
	});
});

module.exports = router;
