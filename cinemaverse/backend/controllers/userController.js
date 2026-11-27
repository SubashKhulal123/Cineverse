const User = require('../models/User');
const Review = require('../models/Review');
const { Watchlist, Diary, Notification } = require('../models/index');
const tmdb = require('../services/tmdbService');

// @route GET /api/users/:id/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [reviewCount, watchlistCount, diaryCount] = await Promise.all([
      Review.countDocuments({ userId: user._id }),
      Watchlist.countDocuments({ userId: user._id }),
      Diary.countDocuments({ userId: user._id }),
    ]);

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        stats: { reviewCount, watchlistCount, diaryCount },
      },
    });
  } catch (error) { next(error); }
};

// @route PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, favoriteGenres, notificationsEnabled } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (favoriteGenres) updates.favoriteGenres = favoriteGenres;
    if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    }).select('-password');

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) { next(error); }
};

// @route PUT /api/users/avatar
const updateAvatar = async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) return res.status(400).json({ success: false, message: 'Avatar URL is required' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Avatar updated', data: user });
  } catch (error) { next(error); }
};

// @route PUT /api/users/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) { next(error); }
};

// @route POST /api/users/:id/follow
const followUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    if (currentUser.following.includes(targetId)) {
      return res.status(409).json({ success: false, message: 'Already following this user' });
    }

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $push: { following: targetId } }),
      User.findByIdAndUpdate(targetId, { $push: { followers: req.user._id } }),
    ]);

    // Create notification
    if (target.notificationsEnabled) {
      await Notification.create({
        userId: targetId,
        type: 'follow',
        message: `${req.user.name} started following you`,
        fromUser: req.user._id,
        link: `/profile/${req.user._id}`,
      });
    }

    res.json({ success: true, message: `Now following ${target.name}` });
  } catch (error) { next(error); }
};

// @route DELETE /api/users/:id/follow
const unfollowUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } }),
      User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } }),
    ]);

    res.json({ success: true, message: 'Unfollowed' });
  } catch (error) { next(error); }
};

// @route GET /api/users/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const user = req.user;

    // Get user's favorite genres and recently watched
    const recentWatched = await Watchlist.find({ userId: user._id, watched: true })
      .sort('-watchedAt')
      .limit(5);

    // Use favorite genres or fallback to action/drama
    const genres = user.favoriteGenres?.length
      ? user.favoriteGenres.slice(0, 3).join(',')
      : '28,18,35';

    // Pick a random page for variety
    const page = Math.floor(Math.random() * 5) + 1;
    const data = await tmdb.discoverMovies({ genres, page, sortBy: 'vote_average.desc' });

    // Filter out already-watched movies
    const watchedIds = new Set(recentWatched.map((w) => w.movieId));
    const filtered = data.results.filter((m) => !watchedIds.has(m.id)).slice(0, 20);

    res.json({ success: true, data: { results: filtered, total_results: filtered.length } });
  } catch (error) { next(error); }
};

// @route GET /api/users/feed
const getActivityFeed = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followingIds = currentUser.following;

    const reviews = await Review.find({ userId: { $in: followingIds } })
      .populate('userId', 'name avatar')
      .sort('-createdAt')
      .limit(30);

    const diaryEntries = await Diary.find({ userId: { $in: followingIds } })
      .sort('-watchedOn')
      .limit(20);

    // Merge and sort by date
    const feed = [
      ...reviews.map((r) => ({ type: 'review', data: r, date: r.createdAt })),
      ...diaryEntries.map((d) => ({ type: 'diary', data: d, date: d.watchedOn })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 40);

    res.json({ success: true, data: feed });
  } catch (error) { next(error); }
};

// @route GET /api/users/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('fromUser', 'name avatar')
      .sort('-createdAt')
      .limit(20);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) { next(error); }
};

// @route PUT /api/users/notifications/read
const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

module.exports = {
  getProfile, updateProfile, updateAvatar, changePassword,
  followUser, unfollowUser, getRecommendations, getActivityFeed,
  getNotifications, markNotificationsRead,
};
