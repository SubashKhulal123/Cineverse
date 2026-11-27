# 🎬 CinemaVerse — Production Movie Platform

A full-stack MERN movie discovery and streaming platform competitive with Netflix, IMDb, and Letterboxd.

---

## 🏛️ Architect's Feature Proposal (Beyond the Brief)

Before building, here's what makes CinemaVerse **competitive** with top platforms:

### 🆕 Competitive Differentiators

| Feature | Netflix | IMDb | Letterboxd | CinemaVerse |
|---------|---------|------|------------|-------------|
| Social film lists | ❌ | ❌ | ✅ | ✅ |
| AI-powered recommendations | ✅ | ❌ | ❌ | ✅ |
| Mood-based discovery | ❌ | ❌ | ❌ | ✅ |
| Watch parties | ✅ | ❌ | ❌ | ✅ (planned) |
| Filmmaker focus | ❌ | ✅ | ✅ | ✅ |
| Critics vs Audience scores | ❌ | ✅ | ❌ | ✅ |
| Diary/journal system | ❌ | ❌ | ✅ | ✅ |
| Collections/curated lists | ❌ | ✅ | ✅ | ✅ |

### Additional Features Added to Architecture:
1. **Movie Diary** — log when you watched a film, journal entries per viewing
2. **Public Lists** — curated lists (like Letterboxd), shareable & followable
3. **Mood Discovery** — "I'm feeling..." engine (tense, heartwarming, mindless fun, etc.)
4. **Activity Feed** — follow friends, see their ratings/reviews
5. **Critics vs Audience Score** — dual rating display from TMDb + user ratings
6. **Collections** — movie series/franchises grouped automatically
7. **AI Chatbot** — "What should I watch tonight?" powered by Claude API
8. **Notification System** — new episodes, friend activity, recommendations
9. **Admin Analytics** — rich dashboard with engagement metrics

---

## 📁 Folder Structure

```
cinemaverse/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── env.js                 # Environment variable validation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── reviewController.js
│   │   ├── watchlistController.js
│   │   ├── userController.js
│   │   ├── subscriptionController.js
│   │   ├── listController.js
│   │   ├── diaryController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── roleMiddleware.js      # Admin/user role guards
│   │   ├── rateLimiter.js         # express-rate-limit
│   │   ├── errorHandler.js        # Global error middleware
│   │   ├── validate.js            # Joi/express-validator
│   │   └── logger.js              # Morgan + Winston
│   ├── models/
│   │   ├── User.js
│   │   ├── Review.js
│   │   ├── Watchlist.js
│   │   ├── Subscription.js
│   │   ├── List.js                # Curated lists
│   │   ├── Diary.js               # Watch diary
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── watchlistRoutes.js
│   │   ├── userRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── listRoutes.js
│   │   ├── diaryRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   ├── tmdbService.js         # TMDb API wrapper
│   │   ├── youtubeService.js      # YouTube API wrapper
│   │   ├── emailService.js        # Nodemailer
│   │   ├── recommendationService.js
│   │   └── uploadService.js       # Cloudinary
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendEmail.js
│   │   └── apiFeatures.js         # Filtering/sorting/pagination
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/            # Button, Modal, Skeleton, Badge...
    │   │   ├── layout/            # Navbar, Footer, Sidebar
    │   │   ├── movie/             # MovieCard, MovieGrid, HeroSlider...
    │   │   └── auth/              # LoginForm, RegisterForm
    │   ├── pages/
    │   │   ├── public/            # Home, Movies, TVShows, Search, Login, Register
    │   │   └── protected/         # Watchlist, Profile, Diary, Lists, Subscription
    │   ├── store/
    │   │   ├── index.js           # Redux store
    │   │   └── slices/            # authSlice, movieSlice, watchlistSlice...
    │   ├── hooks/                 # useAuth, useMovie, useDebounce...
    │   ├── services/              # axios instances, API calls
    │   ├── utils/                 # formatters, helpers
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── tailwind.config.js
    └── package.json
```

---

## 🗄️ Database Design

### User Model
```js
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  bio: String,
  role: enum['user', 'admin'],
  subscriptionPlan: enum['free', 'premium'],
  following: [ObjectId → User],
  followers: [ObjectId → User],
  favoriteGenres: [String],
  notificationsEnabled: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date
}
```

### Review Model
```js
{
  userId: ObjectId → User,
  movieId: Number (TMDb ID),
  movieTitle: String,
  rating: Number (1-5),
  comment: String,
  likes: [ObjectId → User],
  containsSpoilers: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Watchlist Model
```js
{
  userId: ObjectId → User,
  movieId: Number,
  movieTitle: String,
  poster: String,
  addedAt: Date,
  watched: Boolean,
  isFavorite: Boolean
}
```

### List Model (Curated)
```js
{
  userId: ObjectId → User,
  title: String,
  description: String,
  movies: [{ movieId, title, poster, addedAt }],
  isPublic: Boolean,
  tags: [String],
  likes: [ObjectId → User],
  createdAt: Date
}
```

### Diary Model
```js
{
  userId: ObjectId → User,
  movieId: Number,
  movieTitle: String,
  watchedOn: Date,
  rating: Number,
  notes: String,
  rewatch: Boolean
}
```

### Subscription Model
```js
{
  userId: ObjectId → User,
  plan: enum['free', 'premium'],
  startDate: Date,
  expiryDate: Date,
  isActive: Boolean,
  paymentId: String
}
```

---

## 🔌 API Endpoints

### Auth `/api/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /register | Register user | Public |
| POST | /login | Login user | Public |
| POST | /logout | Logout | Private |
| POST | /forgot-password | Send reset email | Public |
| PUT | /reset-password/:token | Reset password | Public |
| GET | /me | Get current user | Private |

### Movies `/api/movies`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /trending | Trending movies | Public |
| GET | /popular | Popular movies | Public |
| GET | /top-rated | Top rated | Public |
| GET | /upcoming | Upcoming | Public |
| GET | /now-playing | Now playing | Public |
| GET | /:id | Movie details | Public |
| GET | /:id/trailer | YouTube trailer | Public |
| GET | /:id/similar | Similar movies | Public |
| GET | /:id/cast | Cast & crew | Public |
| GET | /search | Search movies | Public |
| GET | /genre/:genreId | By genre | Public |
| GET | /mood/:mood | Mood discovery | Public |

### TV Shows `/api/tv`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /popular | Popular shows | Public |
| GET | /top-rated | Top rated shows | Public |
| GET | /:id | Show details | Public |
| GET | /:id/seasons | Season list | Public |

### Reviews `/api/reviews`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /movie/:movieId | Get movie reviews | Public |
| POST | / | Create review | Private |
| PUT | /:id | Update review | Private |
| DELETE | /:id | Delete review | Private |
| POST | /:id/like | Like a review | Private |

### Watchlist `/api/watchlist`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get user watchlist | Private |
| POST | / | Add to watchlist | Private |
| DELETE | /:movieId | Remove from watchlist | Private |
| PUT | /:movieId/watched | Mark as watched | Private |
| PUT | /:movieId/favorite | Toggle favorite | Private |

### Users `/api/users`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /:id/profile | Public profile | Public |
| PUT | /profile | Update profile | Private |
| PUT | /avatar | Update avatar | Private |
| POST | /:id/follow | Follow user | Private |
| DELETE | /:id/follow | Unfollow | Private |
| GET | /recommendations | AI recommendations | Private |
| GET | /feed | Activity feed | Private |

### Lists `/api/lists`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /public | Browse public lists | Public |
| GET | /my | My lists | Private |
| POST | / | Create list | Private |
| PUT | /:id | Update list | Private |
| DELETE | /:id | Delete list | Private |
| POST | /:id/movies | Add movie to list | Private |
| DELETE | /:id/movies/:movieId | Remove from list | Private |

### Diary `/api/diary`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get diary entries | Private |
| POST | / | Log a viewing | Private |
| PUT | /:id | Update entry | Private |
| DELETE | /:id | Delete entry | Private |

### Subscriptions `/api/subscriptions`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Get my subscription | Private |
| POST | /upgrade | Upgrade to premium | Private |
| DELETE | /cancel | Cancel subscription | Private |

### Admin `/api/admin`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /users | List all users | Admin |
| PUT | /users/:id | Update user | Admin |
| DELETE | /users/:id | Delete user | Admin |
| GET | /reviews | All reviews | Admin |
| DELETE | /reviews/:id | Moderate review | Admin |
| GET | /analytics | Dashboard stats | Admin |

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- TMDb API key (free at themoviedb.org)
- YouTube Data API v3 key (Google Cloud Console)
- Cloudinary account (avatar uploads)

### Backend → Render

1. Push backend to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set environment variables (see `.env.example`)
4. Build command: `npm install`
5. Start command: `node server.js`

### Frontend → Vercel

1. Push frontend to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` to your Render backend URL
4. Set `VITE_TMDB_KEY` for client-side calls
5. Deploy

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist all IPs (`0.0.0.0/0`) for Render
3. Copy connection string to `MONGODB_URI`

### Environment Variables

**Backend `.env`:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
TMDB_API_KEY=your_tmdb_key
TMDB_BASE_URL=https://api.themoviedb.org/3
YOUTUBE_API_KEY=your_youtube_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=https://your-vercel-app.vercel.app
```

**Frontend `.env`:**
```env
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
VITE_APP_NAME=CinemaVerse
```
