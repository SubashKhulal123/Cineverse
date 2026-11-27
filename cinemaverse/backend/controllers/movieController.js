const tmdb = require('../services/tmdbService');
const Review = require('../models/Review');
const { Watchlist } = require('../models/index');

// @route GET /api/movies/trending
const getTrending = async (req, res, next) => {
  try {
    const { time_window = 'week' } = req.query;
    const data = await tmdb.getTrending(time_window);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/popular
const getPopular = async (req, res, next) => {
  try {
    const data = await tmdb.getPopular(req.query.page);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/top-rated
const getTopRated = async (req, res, next) => {
  try {
    const data = await tmdb.getTopRated(req.query.page);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/upcoming
const getUpcoming = async (req, res, next) => {
  try {
    const data = await tmdb.getUpcoming(req.query.page);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/now-playing
const getNowPlaying = async (req, res, next) => {
  try {
    const data = await tmdb.getNowPlaying(req.query.page);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/:id
const getMovieDetails = async (req, res, next) => {
  try {
    const movie = await tmdb.getMovieDetails(req.params.id);

    // Get community rating from our DB
    const reviews = await Review.find({ movieId: req.params.id, isApproved: true });
    const communityRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;
    const reviewCount = reviews.length;

    // Check if user has in watchlist
    let inWatchlist = false;
    let userRating = null;
    if (req.user) {
      const wl = await Watchlist.findOne({ userId: req.user._id, movieId: req.params.id });
      inWatchlist = !!wl;
      const userReview = reviews.find((r) => r.userId.toString() === req.user._id.toString());
      userRating = userReview?.rating || null;
    }

    // Extract trailer
    const trailerKey = tmdb.getTrailerKey(movie.videos);

    res.json({
      success: true,
      data: {
        ...movie,
        trailerKey,
        communityRating: communityRating ? parseFloat(communityRating) : null,
        reviewCount,
        inWatchlist,
        userRating,
      },
    });
  } catch (error) { next(error); }
};

// @route GET /api/movies/:id/similar
const getSimilar = async (req, res, next) => {
  try {
    const data = await tmdb.getSimilarMovies(req.params.id, req.query.page);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/search
const searchMovies = async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query is required' });
    const data = await tmdb.searchMovies(q, page);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/genre/:genreId
const getByGenre = async (req, res, next) => {
  try {
    const data = await tmdb.getByGenre(req.params.genreId, req.query.page, req.query.sort_by);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/genres
const getGenres = async (req, res, next) => {
  try {
    const data = await tmdb.getGenreList();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/mood/:mood
const getByMood = async (req, res, next) => {
  try {
    const data = await tmdb.getByMood(req.params.mood, req.query.page);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

// @route GET /api/movies/discover
const discover = async (req, res, next) => {
  try {
    const data = await tmdb.discoverMovies(req.query);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports = {
  getTrending, getPopular, getTopRated, getUpcoming, getNowPlaying,
  getMovieDetails, getSimilar, searchMovies, getByGenre, getGenres,
  getByMood, discover,
};
