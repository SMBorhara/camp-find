if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/user.js');
const helmet = require('helmet');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camp-finder';
const mongooseConnect = async () => {
	try {
		const db = await mongoose.connect(dbUrl);
		console.log('DATABASE CONNECETED');
	} catch (error) {
		console.log('ERROR >>>>>', error);
	}
};
mongooseConnect();

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'needstobettersecret';

const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60,
	crypto: {
		secret,
	},
});

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No! What Happened?';
	res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`LISTENING ON PORT ${port}`);
});
