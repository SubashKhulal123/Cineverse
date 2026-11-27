// tvRoutes.js
const express = require('express');
const tvRouter = express.Router();
const tmdb = require('../services/tmdbService');

tvRouter.get('/popular', async (req, res, next) => {
  try { res.json({ success: true, data: await tmdb.getTVPopular(req.query.page) }); } catch (e) { next(e); }
});
tvRouter.get('/top-rated', async (req, res, next) => {
  try { res.json({ success: true, data: await tmdb.getTVTopRated(req.query.page) }); } catch (e) { next(e); }
});
tvRouter.get('/trending', async (req, res, next) => {
  try { res.json({ success: true, data: await tmdb.getTVTrending() }); } catch (e) { next(e); }
});
tvRouter.get('/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await tmdb.getTVDetails(req.params.id) }); } catch (e) { next(e); }
});

// ─────────────────────────────────────────────────────────
// reviewRoutes.js
const reviewRouter = express.Router();
const { getMovieReviews, createReview, updateReview, deleteReview, toggleLike, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

reviewRouter.get('/movie/:movieId', getMovieReviews);
reviewRouter.get('/user/:userId', getUserReviews);
reviewRouter.post('/', protect, createReview);
reviewRouter.put('/:id', protect, updateReview);
reviewRouter.delete('/:id', protect, deleteReview);
reviewRouter.post('/:id/like', protect, toggleLike);

// ─────────────────────────────────────────────────────────
// watchlistRoutes.js
const watchlistRouter = express.Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist, markWatched, toggleFavorite, checkInWatchlist } = require('../controllers/watchlistController');

watchlistRouter.use(protect);
watchlistRouter.get('/', getWatchlist);
watchlistRouter.post('/', addToWatchlist);
watchlistRouter.get('/check/:movieId', checkInWatchlist);
watchlistRouter.delete('/:movieId', removeFromWatchlist);
watchlistRouter.put('/:movieId/watched', markWatched);
watchlistRouter.put('/:movieId/favorite', toggleFavorite);

// ─────────────────────────────────────────────────────────
// userRoutes.js
const userRouter = express.Router();
const {
  getProfile, updateProfile, updateAvatar, changePassword,
  followUser, unfollowUser, getRecommendations, getActivityFeed,
  getNotifications, markNotificationsRead,
} = require('../controllers/userController');

userRouter.get('/recommendations', protect, getRecommendations);
userRouter.get('/feed', protect, getActivityFeed);
userRouter.get('/notifications', protect, getNotifications);
userRouter.put('/notifications/read', protect, markNotificationsRead);
userRouter.put('/profile', protect, updateProfile);
userRouter.put('/avatar', protect, updateAvatar);
userRouter.put('/password', protect, changePassword);
userRouter.get('/:id/profile', getProfile);
userRouter.post('/:id/follow', protect, followUser);
userRouter.delete('/:id/follow', protect, unfollowUser);

// ─────────────────────────────────────────────────────────
// subscriptionRoutes.js
const subRouter = express.Router();
const { getMySubscription, upgradeToPremium, cancelSubscription } = require('../controllers/combinedControllers');

subRouter.use(protect);
subRouter.get('/', getMySubscription);
subRouter.post('/upgrade', upgradeToPremium);
subRouter.delete('/cancel', cancelSubscription);

// ─────────────────────────────────────────────────────────
// listRoutes.js
const listRouter = express.Router();
const { getPublicLists, getMyLists, createList, updateList, deleteList, addMovieToList, removeMovieFromList } = require('../controllers/combinedControllers');

listRouter.get('/public', getPublicLists);
listRouter.get('/my', protect, getMyLists);
listRouter.post('/', protect, createList);
listRouter.put('/:id', protect, updateList);
listRouter.delete('/:id', protect, deleteList);
listRouter.post('/:id/movies', protect, addMovieToList);
listRouter.delete('/:id/movies/:movieId', protect, removeMovieFromList);

// ─────────────────────────────────────────────────────────
// diaryRoutes.js
const diaryRouter = express.Router();
const { getDiary, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry } = require('../controllers/combinedControllers');

diaryRouter.use(protect);
diaryRouter.get('/', getDiary);
diaryRouter.post('/', addDiaryEntry);
diaryRouter.put('/:id', updateDiaryEntry);
diaryRouter.delete('/:id', deleteDiaryEntry);

// ─────────────────────────────────────────────────────────
// adminRoutes.js
const adminRouter = express.Router();
const { adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers, updateUser, deleteUser, getAllReviews, moderateReview, getAnalytics } = require('../controllers/combinedControllers');

adminRouter.use(protect, adminOnly);
adminRouter.get('/users', getAllUsers);
adminRouter.put('/users/:id', updateUser);
adminRouter.delete('/users/:id', deleteUser);
adminRouter.get('/reviews', getAllReviews);
adminRouter.put('/reviews/:id/moderate', moderateReview);
adminRouter.delete('/reviews/:id', deleteReview);
adminRouter.get('/analytics', getAnalytics);

// function deleteReview(req, res, next) {
//   const Review = require('../models/Review');
//   Review.findByIdAndDelete(req.params.id)
//     .then(() => res.json({ success: true, message: 'Review deleted' }))
//     .catch(next);
// }

module.exports = { tvRouter, reviewRouter, watchlistRouter, userRouter, subRouter, listRouter, diaryRouter, adminRouter };
