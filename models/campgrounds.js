const mongoose = require('mongoose');
const Review = require('./review.js');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

ImageSchema.virtual('thumb').get(() => {
	console.log(this.url);
	return this.url.replace('/upload', '/upload/w_200');
});
const campgroundSchema = new Schema({
	title: String,
	images: [ImageSchema],
	price: Number,
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review',
		},
	],
});

campgroundSchema.post('findOneAndDelete', async (doc) => {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews,
			},
		});
	}
});

const Campground = mongoose.model('Campground', campgroundSchema);
module.exports = Campground;
