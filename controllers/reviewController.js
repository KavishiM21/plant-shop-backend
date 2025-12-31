import Review from "../models/review.js";
import { isAdmin } from "./userController.js";

/**
 * Create a review
 */
export async function createReview(req, res) {
  try {
    // Only logged-in users
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const latestReview = await Review.findOne().sort({ date: -1 });
    let reviewId = "REV000001";

    if (latestReview) {
      let latestId = latestReview.reviewId.replace("REV", "");
      reviewId = "REV" + (parseInt(latestId) + 1).toString().padStart(6, "0");
    }

    const newReview = new Review({
      reviewId,
      productID: req.body.productID,
      name: req.user.firstName + " " + req.user.lastName,
      email: req.user.email,
      rating: req.body.rating,
      comment: req.body.comment,
      isVisible: true,
    });

    await newReview.save();

    res.json({
      message: "Review submitted successfully",
      reviewId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting review", error: error.message });
  }
}

/**
 * Get all reviews
 */
export async function getReviews(req, res) {
  try {
    let reviews;
    if (isAdmin(req)) {
      reviews = await Review.find().sort({ date: -1 });
    } else {
      reviews = await Review.find({ isVisible: true }).sort({ date: -1 });
    }

    const mappedReviews = reviews.map((rev) => ({
      reviewId: rev.reviewId,
      productID: rev.productID,
      name: rev.name,
      email: rev.email,
      rating: rev.rating,
      comment: rev.comment,
    }));

    res.json(mappedReviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
}

/**
 * Update review (user can update own review, admin can update any)
 */
export async function updateReview(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const review = await Review.findOne({ reviewId: req.params.reviewId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only admin or owner can update
    if (!isAdmin(req) && review.email !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();
    res.json({ message: "Review updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating review", error: error.message });
  }
}

/**
 * Delete review (user can delete own review, admin can delete any)
 */
export async function deleteReview(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const review = await Review.findOne({ reviewId: req.params.reviewId });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only admin or owner can delete
    if (!isAdmin(req) && review.email !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Review.deleteOne({ reviewId: req.params.reviewId });
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting review", error: error.message });
  }
}

/**
 * Toggle visibility (admin only)
 */
export async function toggleReviewVisibility(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ message: "Unauthorized" });

  try {
    const review = await Review.findOne({ reviewId: req.params.reviewId });
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.isVisible = req.body.isVisible;
    await review.save();

    res.json({ message: "Review visibility updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating visibility", error: error.message });
  }
}
