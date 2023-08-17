const express = require('express');
const router = express.Router();
const CatchAsync = require('../utils/CatchAsync.js');
const Campground = require('../models/campgrounds.js');
const {
	isLoggedIn,
	isAuthor,
	validateCampground,
} = require('../middleware.js');

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
		campground.author = req.user._id;
		await campground.save();
		req.flash('success', 'Campground Succesfully Added!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

// campground by id - show page
router.get(
	'/:id',
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
			.populate({
				path: 'reviews',
				populate: {
					path: 'author',
				},
			})
			.populate('author');
		console.log(campground);
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
	isAuthor,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		if (!campground) {
			req.flash('error', 'Campground Not Found');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', { campground });
	})
);

// save edit
router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
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
	isAuthor,
	CatchAsync(async (req, res) => {
		const { id } = req.params;
		const deletedCamp = await Campground.findByIdAndDelete(id);
		req.flash('success', 'Campground Deleted');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
