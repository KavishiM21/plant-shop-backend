import express from "express";
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  toggleReviewVisibility,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);
router.put("/visibility/:reviewId", toggleReviewVisibility); // Admin only

export default router;
