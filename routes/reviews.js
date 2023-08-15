// find by id and add review
const express = require('express');
const router = express.Router({ mergeParams: true });
const CatchAsync = require('../utils/CatchAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Campground = require('../models/campgrounds.js');
const Review = require('../models/review.js');
const { reviewSchema } = require('../schemas');

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
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

router.post(
	'/',
	validateReview,
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Review Added!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

// delete review
router.delete(
	'/:reviewId',
	CatchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'Review Successfully Deleted');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
