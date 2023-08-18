// find by id and add review
const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews.js');
const CatchAsync = require('../utils/CatchAsync.js');
const Campground = require('../models/campgrounds.js');
const {
	validateReview,
	isLoggedIn,
	isReviewAuthor,
} = require('../middleware.js');

// submit review

router.post('/', validateReview, isLoggedIn, CatchAsync(reviews.createReview));

// delete review
router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	CatchAsync(reviews.deleteReview)
);

module.exports = router;
