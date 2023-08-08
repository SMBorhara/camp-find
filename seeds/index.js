const mongoose = require('mongoose');
const Campground = require('../models/campgrounds.js');
const cities = require('./cities.js');
const { places, descriptors } = require('./seedHelper');

const mongooseConnect = async () => {
	try {
		const db = await mongoose.connect('mongodb://localhost:27017/camp-finder');
		console.log('DATABASE CONNECETED');
	} catch (error) {
		console.log('ERROR >>>>>', error);
	}
};
mongooseConnect();

const sample = (arr) => {
	return arr[Math.floor(Math.random() * arr.length)];
};

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			image: 'https://source.unsplash.com/collection/483251',
			description:
				'Breathe in fresh air and find yourself grounded amongst the green of the tress and rustling of the streams. Be one with the earth and disconnect from the distractions of modern life.',
			price,
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
