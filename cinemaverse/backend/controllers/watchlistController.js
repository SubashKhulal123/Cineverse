const { Watchlist } = require('../models/index');

// @route GET /api/watchlist
const getWatchlist = async (req, res, next) => {
  try {
    const { filter = 'all', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (filter === 'watched') query.watched = true;
    if (filter === 'unwatched') query.watched = false;
    if (filter === 'favorites') query.isFavorite = true;

    const [items, total] = await Promise.all([
      Watchlist.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      Watchlist.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

// @route POST /api/watchlist
const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId, movieTitle, poster, releaseYear, mediaType } = req.body;

    const exists = await Watchlist.findOne({ userId: req.user._id, movieId });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Already in your watchlist' });
    }

    const item = await Watchlist.create({
      userId: req.user._id,
      movieId, movieTitle, poster, releaseYear,
      mediaType: mediaType || 'movie',
    });

    res.status(201).json({ success: true, message: 'Added to watchlist', data: item });
  } catch (error) { next(error); }
};

// @route DELETE /api/watchlist/:movieId
const removeFromWatchlist = async (req, res, next) => {
  try {
    const item = await Watchlist.findOneAndDelete({
      userId: req.user._id,
      movieId: req.params.movieId,
    });

    if (!item) return res.status(404).json({ success: false, message: 'Item not in watchlist' });

    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) { next(error); }
};

// @route PUT /api/watchlist/:movieId/watched
const markWatched = async (req, res, next) => {
  try {
    const item = await Watchlist.findOneAndUpdate(
      { userId: req.user._id, movieId: req.params.movieId },
      { watched: req.body.watched ?? true, watchedAt: new Date() },
      { new: true }
    );

    if (!item) return res.status(404).json({ success: false, message: 'Item not in watchlist' });

    res.json({ success: true, message: 'Updated', data: item });
  } catch (error) { next(error); }
};

// @route PUT /api/watchlist/:movieId/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const item = await Watchlist.findOne({ userId: req.user._id, movieId: req.params.movieId });

    if (!item) return res.status(404).json({ success: false, message: 'Item not in watchlist' });

    item.isFavorite = !item.isFavorite;
    await item.save();

    res.json({ success: true, isFavorite: item.isFavorite, data: item });
  } catch (error) { next(error); }
};

// @route GET /api/watchlist/check/:movieId
const checkInWatchlist = async (req, res, next) => {
  try {
    const item = await Watchlist.findOne({
      userId: req.user._id,
      movieId: req.params.movieId,
    });
    res.json({ success: true, inWatchlist: !!item, data: item || null });
  } catch (error) { next(error); }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, markWatched, toggleFavorite, checkInWatchlist };
