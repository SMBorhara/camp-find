const mongoose = require('mongoose');
const Review = require('./review.js');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

//
ImageSchema.virtual('thumb').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
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
	},
	opts
);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `
	<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
	<p>${this.location}`;
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
