const User = require('../models/User');
const Review = require('../models/Review');
const { Watchlist, Subscription, List, Diary } = require('../models/index');

// ══════════════════════════════════════════════
//  SUBSCRIPTION CONTROLLER
// ══════════════════════════════════════════════

const getMySubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
};

const upgradeToPremium = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const sub = await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      { plan: 'premium', startDate: new Date(), expiryDate, isActive: true, paymentId: paymentId || 'manual' },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: 'premium' });

    res.json({ success: true, message: 'Upgraded to Premium!', data: sub });
  } catch (error) { next(error); }
};

const cancelSubscription = async (req, res, next) => {
  try {
    await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      { plan: 'free', isActive: false, cancelledAt: new Date() }
    );
    await User.findByIdAndUpdate(req.user._id, { subscriptionPlan: 'free' });
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) { next(error); }
};

// ══════════════════════════════════════════════
//  LIST CONTROLLER
// ══════════════════════════════════════════════

const getPublicLists = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, tag } = req.query;
    const query = { isPublic: true };
    if (tag) query.tags = tag;

    const [lists, total] = await Promise.all([
      List.find(query)
        .populate('userId', 'name avatar')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      List.countDocuments(query),
    ]);

    res.json({ success: true, data: lists, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const getMyLists = async (req, res, next) => {
  try {
    const lists = await List.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: lists });
  } catch (error) { next(error); }
};

const createList = async (req, res, next) => {
  try {
    const { title, description, isPublic, tags } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const list = await List.create({ userId: req.user._id, title, description, isPublic, tags });
    res.status(201).json({ success: true, data: list });
  } catch (error) { next(error); }
};

const updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });
    if (list.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, isPublic, tags } = req.body;
    if (title) list.title = title;
    if (description !== undefined) list.description = description;
    if (isPublic !== undefined) list.isPublic = isPublic;
    if (tags) list.tags = tags;

    await list.save();
    res.json({ success: true, data: list });
  } catch (error) { next(error); }
};

const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });
    if (list.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await list.deleteOne();
    res.json({ success: true, message: 'List deleted' });
  } catch (error) { next(error); }
};

const addMovieToList = async (req, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.user._id });
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });

    const { movieId, title, poster, mediaType, note } = req.body;
    const alreadyIn = list.movies.some((m) => m.movieId === movieId);
    if (alreadyIn) return res.status(409).json({ success: false, message: 'Movie already in this list' });

    list.movies.push({ movieId, title, poster, mediaType, note });
    await list.save();
    res.json({ success: true, data: list });
  } catch (error) { next(error); }
};

const removeMovieFromList = async (req, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.user._id });
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });

    list.movies = list.movies.filter((m) => m.movieId !== Number(req.params.movieId));
    await list.save();
    res.json({ success: true, data: list });
  } catch (error) { next(error); }
};

// ══════════════════════════════════════════════
//  DIARY CONTROLLER
// ══════════════════════════════════════════════

const getDiary = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, year, month } = req.query;
    const query = { userId: req.user._id };

    if (year && month) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.watchedOn = { $gte: start, $lte: end };
    }

    const [entries, total] = await Promise.all([
      Diary.find(query).sort('-watchedOn').skip((page - 1) * limit).limit(Number(limit)),
      Diary.countDocuments(query),
    ]);

    res.json({ success: true, data: entries, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const addDiaryEntry = async (req, res, next) => {
  try {
    const { movieId, movieTitle, poster, mediaType, watchedOn, rating, notes, rewatch } = req.body;
    const entry = await Diary.create({
      userId: req.user._id,
      movieId, movieTitle, poster, mediaType,
      watchedOn: watchedOn || new Date(),
      rating, notes, rewatch,
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
};

const updateDiaryEntry = async (req, res, next) => {
  try {
    const entry = await Diary.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    const { watchedOn, rating, notes, rewatch } = req.body;
    if (watchedOn) entry.watchedOn = watchedOn;
    if (rating) entry.rating = rating;
    if (notes !== undefined) entry.notes = notes;
    if (rewatch !== undefined) entry.rewatch = rewatch;

    await entry.save();
    res.json({ success: true, data: entry });
  } catch (error) { next(error); }
};

const deleteDiaryEntry = async (req, res, next) => {
  try {
    const entry = await Diary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Diary entry deleted' });
  } catch (error) { next(error); }
};

// ══════════════════════════════════════════════
//  ADMIN CONTROLLER
// ══════════════════════════════════════════════

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({ success: true, data: users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, subscriptionPlan } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (subscriptionPlan) updates.subscriptionPlan = subscriptionPlan;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, approved } = req.query;
    const query = {};
    if (approved !== undefined) query.isApproved = approved === 'true';

    const [reviews, total] = await Promise.all([
      Review.find(query).populate('userId', 'name email').sort('-createdAt')
        .skip((page - 1) * limit).limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    res.json({ success: true, data: reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const moderateReview = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: `Review ${isApproved ? 'approved' : 'hidden'}`, data: review });
  } catch (error) { next(error); }
};

const getAnalytics = async (req, res) => {
  try {
    // Import models from index.js
    const { Watchlist } = require('../models/index');
    const User = require('../models/User');
    const Review = require('../models/Review');

    // Get current date ranges
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run queries in parallel
    const [
      totalUsers,
      premiumUsers,
      activeUsers,
      newUsersThisMonth,
      totalReviews,
      totalWatchlist,
      monthlySignups,
      topRatedByUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ subscriptionPlan: 'premium' }),
      User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Review.countDocuments(),
      Watchlist.countDocuments(),
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ]),
      Review.aggregate([
        {
          $group: {
            _id: '$movieId',
            title: { $first: '$movieTitle' },
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        },
        { $match: { count: { $gte: 1 } } },
        { $sort: { avgRating: -1, count: -1 } },
        { $limit: 8 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          premiumUsers,
          activeUsers,
          newUsersThisMonth,
          totalReviews,
          totalWatchlist,
        },
        monthlySignups: monthlySignups.reverse(),
        topRatedByUsers: topRatedByUsers || [],
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {
        overview: {
          totalUsers: 0,
          premiumUsers: 0,
          activeUsers: 0,
          newUsersThisMonth: 0,
          totalReviews: 0,
          totalWatchlist: 0,
        },
        monthlySignups: [],
        topRatedByUsers: []
      }
    });
  }
};

module.exports = {
  // Subscription
  getMySubscription, upgradeToPremium, cancelSubscription,
  // Lists
  getPublicLists, getMyLists, createList, updateList, deleteList, addMovieToList, removeMovieFromList,
  // Diary
  getDiary, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
  // Admin
  getAllUsers, updateUser, deleteUser, getAllReviews, moderateReview, getAnalytics,
};
