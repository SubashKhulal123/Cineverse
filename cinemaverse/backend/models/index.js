const mongoose = require('mongoose');

// ─── Watchlist ───────────────────────────────────────────────────────────────
const watchlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movieId: { type: Number, required: true },
    movieTitle: { type: String, required: true },
    poster: { type: String, default: '' },
    releaseYear: { type: String, default: '' },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    watched: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    watchedAt: { type: Date },
  },
  { timestamps: true }
);
watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// ─── Subscription ────────────────────────────────────────────────────────────
const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    paymentId: { type: String, default: '' },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// ─── Curated List ────────────────────────────────────────────────────────────
const listSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'List title cannot exceed 100 characters'],
    },
    description: { type: String, maxlength: [500, 'Description cannot exceed 500 characters'], default: '' },
    movies: [
      {
        movieId: Number,
        title: String,
        poster: String,
        mediaType: { type: String, default: 'movie' },
        addedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    isPublic: { type: Boolean, default: true },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);
listSchema.index({ userId: 1, isPublic: 1 });
listSchema.index({ tags: 1 });

// ─── Watch Diary ─────────────────────────────────────────────────────────────
const diarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movieId: { type: Number, required: true },
    movieTitle: { type: String, required: true },
    poster: { type: String, default: '' },
    mediaType: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    watchedOn: { type: Date, required: true, default: Date.now },
    rating: { type: Number, min: 0.5, max: 5 },
    notes: { type: String, maxlength: [1000, 'Notes cannot exceed 1000 characters'], default: '' },
    rewatch: { type: Boolean, default: false },
  },
  { timestamps: true }
);
diarySchema.index({ userId: 1, watchedOn: -1 });

// ─── Notification ────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['follow', 'review_like', 'new_review', 'recommendation', 'system'],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = {
  Watchlist: mongoose.model('Watchlist', watchlistSchema),
  Subscription: mongoose.model('Subscription', subscriptionSchema),
  List: mongoose.model('List', listSchema),
  Diary: mongoose.model('Diary', diarySchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
