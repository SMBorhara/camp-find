const User = require('../models/user.js');

module.exports.registerUser = (req, res) => {
	res.render('users/register');
};

module.exports.createUser = async (req, res) => {
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
};

module.exports.loginScreen = (req, res) => {
	res.render('users/login');
};

module.exports.login = (req, res) => {
	req.flash('success', 'Welcome Back!');
	const redirectUrl = res.locals.returnTo || '/campgrounds';
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		req.flash('success', 'Successfully Logged Out');
		res.redirect('/campgrounds');
	});
};
