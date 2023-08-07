const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// homepage
app.get('/', (req, res) => {
	res.render('home');
});

// campgrounds list
app.get('/campgrounds', async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
});

// campground form - new
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

// form submit
app.post('/campgrounds', async (req, res) => {
	const campground = new Campground(req.body);
    console.log(campground)
	await campground.save();
	res.redirect(`/campgrounds/${campground._id}`);
});

// campground by id
app.get('/campgrounds/:id', async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	console.log(campground);
	res.render('campgrounds/show', { campground });
});

app.listen(3000, () => {
	console.log('LISTENING ON PORT 3000');
});
