import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    required: true,
    unique: true,
  },
  productID: {
    type: String,
    required: true, // Associate review with a specific product
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String, // User's email
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: true, // Admin can hide/unhide
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
