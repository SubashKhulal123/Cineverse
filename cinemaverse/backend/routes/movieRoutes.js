// ════════════════════════════════════════════════
//  movieRoutes.js
// ════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const {
  getTrending, getPopular, getTopRated, getUpcoming, getNowPlaying,
  getMovieDetails, getSimilar, searchMovies, getByGenre, getGenres,
  getByMood, discover,
} = require('../controllers/movieController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/top-rated', getTopRated);
router.get('/upcoming', getUpcoming);
router.get('/now-playing', getNowPlaying);
router.get('/search', searchMovies);
router.get('/genres', getGenres);
router.get('/discover', discover);
router.get('/genre/:genreId', getByGenre);
router.get('/mood/:mood', getByMood);
router.get('/:id', optionalAuth, getMovieDetails);
router.get('/:id/similar', getSimilar);

module.exports = router;
