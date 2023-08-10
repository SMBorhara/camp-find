const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { campgroundSchema } = require('./schemas');
const CatchAsync = require('./utils/CatchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campgrounds.js');

const mongooseConnect = async () => {
	try {
		const db = await mongoose.connect('mongodb://localhost:27017/camp-finder');
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

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details
			.map((el) => {
				el.message;
			})
			.join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

// homepage
app.get('/', (req, res) => {
	res.render('home');
});

// campgrounds list
app.get(
	'/campgrounds',
	CatchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

// campground form - new
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

// form submit
app.post(
	'/campgrounds',
	validateCampground,
	CatchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		console.log(campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

// campground by id
app.get(
	'/campgrounds/:id',
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/show', { campground });
	})
);

// find camp for edit
app.get(
	'/campgrounds/:id/edit',
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { campground });
	})
);

// save edit
app.put(
	'/campgrounds/:id',
	validateCampground,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

// delete campground info
app.delete(
	'/campgrounds/:id',
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const deletedCamp = await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
	})
);

app.post('/campgrounds/:id/review', CatchAsync(async(req, res) => {
	res.send()
}))

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No! What Happened?';
	res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
	console.log('LISTENING ON PORT 3000');
});
