const Campground = require('../models/campgrounds.js');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.addCampForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.submitNewCamp = async (req, res, next) => {
	const campground = new Campground(req.body.campground);
	campground.images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.author = req.user._id;
	await campground.save();
	console.log(campground);
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
