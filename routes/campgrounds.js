const express = require('express');
const router = express.Router();
const CatchAsync = require('../utils/CatchAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Campground = require('../models/campgrounds.js');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware.js');

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

// campgrounds list
router.get(
	'/',
	CatchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

// campground form - new
router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

// form submit
router.post(
	'/',
	isLoggedIn,
	validateCampground,
	CatchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		console.log(campground);
		await campground.save();
		req.flash('success', 'Campground Succesfully Added!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

// campground by id - show page
router.get(
	'/:id',
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate(
			'reviews'
		);
		if (!campground) {
			req.flash('error', 'Campground Not Found');
			res.redirect('/campgrounds');
		}
		res.render('campgrounds/show', { campground });
	})
);

// find camp for edit
router.get(
	'/:id/edit',
	isLoggedIn,
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { campground });
	})
);

// save edit
router.put(
	'/:id',
	isLoggedIn,
	validateCampground,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		req.flash('success', 'Campground Successfully Updated');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

// delete campground info
router.delete(
	'/:id',
	isLoggedIn,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const deletedCamp = await Campground.findByIdAndDelete(id);
		req.flash('success', 'Campground Deleted');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
