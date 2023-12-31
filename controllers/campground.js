const Campground = require('../models/campgrounds.js');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAP_BOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mbxToken });

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	// console.log(campgrounds.images);
	res.render('campgrounds/index', { campgrounds });
};

module.exports.addCampForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.submitNewCamp = async (req, res, next) => {
	const geodata = await geocoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geodata.body.features[0].geometry;
	// console.log('COORDINATES', campground.geometry.coordinates);
	campground.images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.author = req.user._id;
	await campground.save();
	// console.log(campground);
	req.flash('success', 'Campground Succesfully Added!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.campgroundInfoPage = async (req, res) => {
	const campground = await Campground.findById(req.params.id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author',
			},
		})
		.populate('author');
	if (!campground) {
		req.flash('error', 'Campground Not Found');
		res.redirect('/campgrounds');
	}
	res.render('campgrounds/show', { campground });
};

module.exports.editCampInfo = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash('error', 'Campground Not Found');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/edit', { campground });
};

module.exports.updateCampInfo = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});
	const imgs = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.images.push(...imgs);
	await campground.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}
	req.flash('success', 'Campground Successfully Updated');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCamp = async (req, res) => {
	const { id } = req.params;
	const deletedCamp = await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground Deleted');
	res.redirect('/campgrounds');
};
