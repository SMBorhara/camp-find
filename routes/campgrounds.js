const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campground.js');
const CatchAsync = require('../utils/CatchAsync.js');
const Campground = require('../models/campgrounds.js');
const {
	isLoggedIn,
	isAuthor,
	validateCampground,
} = require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router
	.route('/')
	.get(CatchAsync(campgrounds.index))
	.post(
		isLoggedIn,
		upload.array('image'),
		validateCampground,
		CatchAsync(campgrounds.submitNewCamp)
	);

// campground form - new
router.get('/new', isLoggedIn, campgrounds.addCampForm);

// find camp for edit
router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	CatchAsync(campgrounds.editCampInfo)
);

router
	.route('/:id')
	.get(CatchAsync(campgrounds.campgroundInfoPage))
	.put(
		isLoggedIn,
		isAuthor,
		upload.array('image'),
		validateCampground,
		CatchAsync(campgrounds.updateCampInfo)
	)
	.delete(isLoggedIn, isAuthor, CatchAsync(campgrounds.deleteCamp));

module.exports = router;
