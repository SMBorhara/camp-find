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
	for (let i = 0; i < 400; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			// my author id
			author: '64dcf7e3ff6409b5823fa2b1',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Breathe in fresh air and find yourself grounded amongst the green of the tress and rustling of the streams. Be one with the earth and disconnect from the distractions of modern life.',
			price,
			geometry: {
				type: 'Point',
				coordinates: [
					cities[random1000].longitude,
					cities[random1000].latitude,
				],
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dsxqp863w/image/upload/v1692751029/Camp%20Seeker/nvgcyt1ud39vkvzghfyb.jpg',
					filename: 'Camp Seeker/nvgcyt1ud39vkvzghfyb',
				},
				{
					url: 'https://res.cloudinary.com/dsxqp863w/image/upload/v1692751028/Camp%20Seeker/vxpjtenkpiftntwvsiot.jpg',
					filename: 'Camp Seeker/vxpjtenkpiftntwvsiot',
				},
				{
					url: 'https://res.cloudinary.com/dsxqp863w/image/upload/v1692751028/Camp%20Seeker/wmhcn0f3pudhwkbkvm2h.jpg',
					filename: 'Camp Seeker/wmhcn0f3pudhwkbkvm2h',
				},
			],
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
