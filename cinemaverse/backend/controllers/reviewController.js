const Review = require('../models/Review');

const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Simple query without isApproved
    const reviews = await Review.find({ movieId: Number(movieId) })
      .populate('userId', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ movieId: Number(movieId) });

    let avgRating = null;
    if (total > 0 && reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = Number((sum / reviews.length).toFixed(1));
    }

    res.json({
      success: true,
      data: reviews,
      avgRating,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('getMovieReviews error:', error);
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

const createReview = async (req, res) => {
  try {
    const { movieId, movieTitle, moviePoster, mediaType, rating, comment, containsSpoilers } = req.body;

    // Check if review exists
    const existing = await Review.findOne({ 
      userId: req.user._id, 
      movieId: Number(movieId) 
    });
    
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already reviewed this' });
    }

    const review = await Review.create({
      userId: req.user._id,
      movieId: Number(movieId),
      movieTitle,
      moviePoster: moviePoster || '',
      mediaType: mediaType || 'movie',
      rating: Number(rating),
      comment,
      containsSpoilers: containsSpoilers || false,
    });

    await review.populate('userId', 'name avatar');
    
    res.status(201).json({ success: true, message: 'Review posted', data: review });
  } catch (error) {
    console.error('createReview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { rating, comment, containsSpoilers } = req.body;
    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment;
    if (containsSpoilers !== undefined) review.containsSpoilers = containsSpoilers;

    await review.save();
    await review.populate('userId', 'name avatar');

    res.json({ success: true, message: 'Review updated', data: review });
  } catch (error) {
    console.error('updateReview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = req.user._id;
    const likedIndex = review.likes.indexOf(userId);

    if (likedIndex === -1) {
      review.likes.push(userId);
    } else {
      review.likes.splice(likedIndex, 1);
    }

    await review.save();

    res.json({
      success: true,
      liked: likedIndex === -1,
      likeCount: review.likes.length,
    });
  } catch (error) {
    console.error('toggleLike error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .populate('userId', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ userId });

    res.json({
      success: true,
      data: reviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('getUserReviews error:', error);
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

module.exports = { getMovieReviews, createReview, updateReview, deleteReview, toggleLike, getUserReviews };