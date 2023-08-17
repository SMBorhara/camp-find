// find by id and add review
const express = require('express');
const router = express.Router({ mergeParams: true });
const CatchAsync = require('../utils/CatchAsync.js');
const Campground = require('../models/campgrounds.js');
const Review = require('../models/review.js');
const {
	validateReview,
	isLoggedIn,
	isReviewAuthor,
} = require('../middleware.js');

router.post(
	'/',
	validateReview,
	isLoggedIn,
	CatchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
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
	isLoggedIn,
	isReviewAuthor,
	CatchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'Review Successfully Deleted');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
